import jsdom from 'jsdom'

import { Browser } from './browser'
import { Universal } from './universal'

describe('Browser', function () {
    beforeEach(function () {
        this.browser = new Browser({user: 'demo'})
    })

    describe('url', function () {
        beforeEach(function () {
            this.universal = new Universal({user: 'demo'})
        })

        it('should amend parameters', function () {
            expect(this.browser.url('https://tiny.pictures/example1.jpg')).toBe(this.universal.url('https://tiny.pictures/example1.jpg'))
            expect(this.browser.url('https://tiny.pictures/example1.jpg', {})).toBe(this.universal.url('https://tiny.pictures/example1.jpg', {}))
            expect(this.browser.url('https://tiny.pictures/example1.jpg', {}, true)).toBe(this.universal.url('https://tiny.pictures/example1.jpg', {}, true))
            expect(this.browser.url('https://tiny.pictures/example1.jpg', {}, true, 'baseUrl')).toBe(this.universal.url('https://tiny.pictures/example1.jpg', {}, true, 'baseUrl'))
        })
        it('should replace baseUrl by location.href', function () {
            const baseUrl = 'http://tiny.pictures/path/to'
            global.location = {href: baseUrl}
            expect(this.browser.url('/example1.jpg')).toBe(this.universal.url('/example1.jpg', undefined, undefined, baseUrl))
            global.location = undefined
        })
    })

    describe('immediateAll', function () {
        it('should set the src attribute of all images', function () {
            global.document = jsdom.jsdom(
                '<img data-src="https://tiny.pictures/example1.jpg" data-tiny.pictures=\'{"width": 200}\'>' +
                '<img data-src="https://tiny.pictures/example2.jpg">'
            )
            this.browser.immediateAll()
            const images = global.document.getElementsByTagName('img')
            expect(images[0].getAttribute('src')).toBe('https://tiny.pictures/api/demo?width=200&source=https%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(images[1].getAttribute('src')).toBe('https://tiny.pictures/example2.jpg')
        })
    })

    describe('immediate', function () {
        beforeEach(function () {
            this.url = 'https://tiny.pictures/example'
            this.url2 = this.url + 2
            this.options = {quality: 50}
            this.img = jasmine.createSpyObj('img', ['getAttribute', 'setAttribute'])
            this.img.getAttribute.and.callFake((attribute) => {
                switch (attribute) {
                    case 'src':
                        return this.url
                    case 'data-src':
                        return this.url + 2
                    case 'data-tiny.pictures':
                        return JSON.stringify(this.options)
                    case 'data-tiny.pictures-width':
                        return '330'
                }
            })
        })

        it('should replace the src attribute', function () {
            this.browser.immediate(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.browser.url(this.url2, this.options))
        })
        it('should set the src attribute to data-src if no options are set', function () {
            this.options = null
            this.browser.immediate(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.url2)
        })
        it('should calculate the srcset attribute based on the source image\'s width', function () {
            this.browser.immediate(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('srcset', jasmine.anything())
        })
        it('should calculate the srcset attribute even if no options are set', function () {
            this.options = null
            this.browser.immediate(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('srcset', jasmine.anything())
        })
        it('should use options parameter', function () {
            const optionsOverride = {quality: 60}
            this.browser.immediate(this.img, optionsOverride)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.browser.url(this.url2, optionsOverride))
        })
    })
})
