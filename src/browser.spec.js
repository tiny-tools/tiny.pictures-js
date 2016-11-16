describe('browser.js', () => {
    let browser
    beforeAll(() => {
        browser = require('./browser.js').pictures
    })

    describe('replaceSourceAttributes', () => {
        let url, options, img
        beforeEach(() => {
            url = 'https://tiny.pictures/example'
            options = {quality: 50}
            img = jasmine.createSpyObj('img', ['getAttribute', 'setAttribute'])
            img.getAttribute.and.callFake((attribute) => {
                switch (attribute) {
                    case 'src':
                        return url
                    case 'data-tiny.pictures':
                        return JSON.stringify(options)
                    case 'data-tiny.pictures-width':
                        return '330'
                }
            })
        })

        it('should replace the src attribute', () => {
            browser.replaceSourceAttributes(img)
            expect(img.setAttribute).toHaveBeenCalledWith('src', browser.url(url, options))
        })
        it('should not replace the src attribute if no options are set', () => {
            options = null
            browser.replaceSourceAttributes(img)
            expect(img.setAttribute).not.toHaveBeenCalledWith('src', browser.url(url, options))
        })
        it('should calculate the srcset attribute based on the source image\'s width', () => {
            browser.replaceSourceAttributes(img)
            expect(img.setAttribute).toHaveBeenCalledWith('srcset', jasmine.anything())
        })
    })

    describe('registerAngularModule', () => {
        let angular, tinyPicturesFilter
        beforeAll(() => {
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
            expect(tinyPicturesFilter('http://tiny.pictures/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures')
        })
    })
})
