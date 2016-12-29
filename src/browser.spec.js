describe('browser.js', () => {
    const jsdom = require('jsdom')
    const browser = require('./browser.js').pictures

    describe('immediateAll', () => {
        it('should set the src attribute of all images', () => {
            global.document = jsdom.jsdom(
                '<img data-src="https://tiny.pictures/example1.jpg" data-tiny.pictures=\'{"user": "demo", "width": 200}\'>' +
                '<img data-src="https://tiny.pictures/example2.jpg">'
            )
            browser.immediateAll()
            const images = global.document.getElementsByTagName('img')
            expect(images[0].getAttribute('src')).toBe('https://demo.tiny.pictures/?width=200&source=https%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(images[1].getAttribute('src')).toBe('https://tiny.pictures/example2.jpg')
        })
    })

    describe('immediate', () => {
        let url, url2, options, img
        beforeEach(() => {
            url = 'https://tiny.pictures/example'
            url2 = url + 2
            options = {user: 'demo', quality: 50}
            img = jasmine.createSpyObj('img', ['getAttribute', 'setAttribute'])
            img.getAttribute.and.callFake((attribute) => {
                switch (attribute) {
                    case 'src':
                        return url
                    case 'data-src':
                        return url + 2
                    case 'data-tiny.pictures':
                        return JSON.stringify(options)
                    case 'data-tiny.pictures-width':
                        return '330'
                }
            })
        })

        it('should replace the src attribute', () => {
            browser.immediate(img)
            expect(img.setAttribute).toHaveBeenCalledWith('src', browser.url(url2, options))
        })
        it('should set the src attribute to data-src if no options are set', () => {
            options = null
            browser.immediate(img)
            expect(img.setAttribute).toHaveBeenCalledWith('src', url2)
        })
        it('should calculate the srcset attribute based on the source image\'s width', () => {
            browser.immediate(img)
            expect(img.setAttribute).toHaveBeenCalledWith('srcset', jasmine.anything())
        })
        it('should use options parameter', () => {
            const optionsOverride = {user: 'demo', quality: 60}
            browser.immediate(img, optionsOverride)
            expect(img.setAttribute).toHaveBeenCalledWith('src', browser.url(url2, optionsOverride))
        })
    })

    describe('registerAngularModule', () => {
        let angular, tinyPicturesFilter
        beforeEach(() => {
            angular = jasmine.createSpyObj('angular', ['module', 'filter'])
            angular.module.and.callFake(() => angular)
            angular.filter.and.callFake((filterName, filterProviderFunction) => {
                tinyPicturesFilter = filterProviderFunction()
                return angular
            })
        })

        it('should register the url function as a filter', () => {
            browser.registerAngularModule(angular)
            expect(angular.module).toHaveBeenCalledWith('tiny.pictures', [])
            expect(angular.filter).toHaveBeenCalledWith('tinyPicturesUrl', jasmine.anything())
            expect(tinyPicturesFilter('http://tiny.pictures/example1.jpg', {user: 'demo'}))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
        })
    })

    describe('url', () => {
        it('should amend parameters', () => {
            spyOn(browser, '_url')
            browser.url('url')
            expect(browser._url).toHaveBeenCalledWith('url', undefined, undefined, null)
            browser._url.calls.reset()
            browser.url('url', {})
            expect(browser._url).toHaveBeenCalledWith('url', {}, undefined, null)
            browser._url.calls.reset()
            browser.url('url', {}, true)
            expect(browser._url).toHaveBeenCalledWith('url', {}, true, null)
            browser._url.calls.reset()
            browser.url('url', {}, true, 'baseUrl')
            expect(browser._url).toHaveBeenCalledWith('url', {}, true, 'baseUrl')
        })
    })
})
