const jsdom = require('jsdom').JSDOM
const TinyPictures = require('./index')

describe('TinyPictures', function () {
    describe('constructor', function () {
        it('should throw if no user is set', function () {
            expect(() => new TinyPictures()).toThrow()
            expect(() => new TinyPictures({})).toThrow()
        })
        it('should set _apiBaseUrlObject', function () {
            expect((new TinyPictures({
                user: 'demo'
            }))._apiBaseUrlObject.hostname).toBe('demo.tiny.pictures')
            expect((new TinyPictures({
                user: 'demo',
                customSubdomain: false
            }))._apiBaseUrlObject.hostname).toBe('tiny.pictures')
            expect((new TinyPictures({
                user: 'demo',
                customSubdomain: 'http://api.localhost:1336/'
            }))._apiBaseUrlObject.hostname).toBe('api.localhost')
        })
    })

    describe('url', function () {
        beforeEach(function () {
            this.jsdom = new jsdom(
                '<img data-src="https://tiny.pictures/example1.jpg" data-tiny.pictures=\'{"width": 200}\'>' +
                '<img data-src="https://tiny.pictures/example2.jpg">',
                {
                    url: 'https://tiny.pictures/'
                }
            )
            this.tinyPictures = new TinyPictures({
                window: this.jsdom.window,
                user: 'demo'
            })
        })

        it('should return null if no source is set', function () {
            expect(this.tinyPictures.url('')).toBe(null)
        })
        it('should convert urls to a tiny.pictures url', function () {
            expect(this.tinyPictures.url('http://tiny.pictures/example1.jpg'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('http://tiny.pictures:80/example1.jpg'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('http://tiny.pictures:1336/example1.jpg'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg')
            expect(this.tinyPictures.url('http://tiny.pictures:1336/example1.jpg?test=true'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg%3Ftest%3Dtrue')
        })
        it('should append options to query string', function () {
            expect(this.tinyPictures.url('http://tiny.pictures/example1.jpg', {width: 100}))
                .toBe('https://demo.tiny.pictures/?width=100&source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
        })
        xit('should throw if no hostname or protocol is set and no location.href is present', function () {
            expect(() => this.tinyPictures.url('/example1.jpg')).toThrow()
            expect(() => this.tinyPictures.url('//tiny.pictures/example1.jpg')).toThrow()
        })
        it('should complement with baseUrl if no hostname or protocol is set', function () {
            expect(this.tinyPictures.url('/example1.jpg', {}, 'http://tiny.pictures/path/to'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('example1.jpg', {}, 'http://tiny.pictures/path/to'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%2Fpath%2Fexample1.jpg')
            expect(this.tinyPictures.url('example1.jpg', {}, 'http://tiny.pictures/path/to/'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%2Fpath%2Fto%2Fexample1.jpg')
        })
        it('should respect defaultBaseUrl option', function () {
            this.tinyPictures = new TinyPictures({user: 'demo', defaultBaseUrl: 'http://tiny.pictures/path/to'})
            expect(this.tinyPictures.url('/example1.jpg')).toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
        })
        it('should add the protocol for urls starting with a double slash', function () {
            expect(this.tinyPictures.url('//tiny.pictures/example1.jpg', {}, 'http://tiny.pictures/path/to'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('//tiny.pictures/example1.jpg', {}, 'https://tiny.pictures/path/to'))
                .toBe('https://demo.tiny.pictures/?source=https%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('//example1.jpg', {}, 'http://tiny.pictures/path/to'))
                .toBe('https://demo.tiny.pictures/?source=http%3A%2F%2Fexample1.jpg%2F')
        })
        it('should use named sources', function () {
            const originalNamedSources = this.tinyPictures._options.namedSources
            this.tinyPictures._options.namedSources = [{name: 'main', url: 'https://tiny.pictures'}]
            expect(this.tinyPictures.url('https://tiny.pictures/example1.jpg')).toBe('https://demo.tiny.pictures/main/example1.jpg')
            this.tinyPictures.namedSources = [{name: 'main', url: 'https://tiny.pictures/'}]
            expect(this.tinyPictures.url('https://tiny.pictures/example1.jpg')).toBe('https://demo.tiny.pictures/main/example1.jpg')
            this.tinyPictures._options.namedSources = originalNamedSources
        })
        it('should use named sources with customSubdomain', function () {
            this.tinyPictures = new TinyPictures({
                user: 'demo',
                customSubdomain: true,
                namedSources: [{name: 'main', url: 'https://tiny.pictures'}]
            })
            expect(this.tinyPictures.url('https://tiny.pictures/example1.jpg')).toBe('https://demo.tiny.pictures/main/example1.jpg')
        })
        it('should respect overrideSources', function () {
            this.tinyPictures = new TinyPictures({
                user: 'demo',
                overrideSourcesImages: 'cats',
                overrideSourcesAlways: true
            })
            expect(this.tinyPictures.url('http://tiny.pictures/example1.jpg'))
                .toMatch(/https:\/\/demo.tiny.pictures\/\?source=http%3A%2F%2Florempixel\.com%2F1920%2F1920%2Fcats%2F\d+/)
        })
        xit('should use location.href', function () {
            const baseUrl = 'https://tiny.pictures/path/to'
            expect(this.tinyPictures.url('/example1.jpg')).toBe(this.tinyPictures.url('/example1.jpg', null, baseUrl))
        })
    })

    describe('image', function () {
        beforeEach(function () {
            this.tinyPictures = new TinyPictures({user: 'demo'})
            this.source = 'https://tiny.pictures/example1.jpg'
            this.options = {quality: 50}
            this.attributes = {class: 'col-xs-12 col-md-6'}
            this.originalWidth = 800
        })

        it('should create a valid image tag', function () {
            expect(this.tinyPictures.image(
                this.source,
                this.options,
                this.attributes,
                this.originalWidth
            )).toBe('<img class="col-xs-12 col-md-6" src="' + this.tinyPictures.url(this.source, this.options) + '" srcset="' + this.tinyPictures.srcsetArray(this.source, this.originalWidth, this.options).join(', ') + '">')
        })
    })

    describe('srcsetArray', function () {
        beforeEach(function () {
            this.tinyPictures = new TinyPictures({user: 'demo'})
            this.url = 'http://tiny.pictures/example1.jpg'
            this.options = {quality: 50}
        })

        it('should build a srcset array', function () {
            expect(this.tinyPictures.srcsetArray(this.url, this.options)).toEqual(
                this.tinyPictures._options.srcsetWidths.map((width) => {
                    return this.tinyPictures.url(this.url, Object.assign({}, this.options, {width})) + ' ' + width + 'w'
                })
            )
        })
    })

    describe('unveil', function () {
        beforeEach(function () {
            this.tinyPictures = new TinyPictures({user: 'demo'})
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

        xit('should replace the src attribute', function () {
            this.tinyPictures.unveil(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.tinyPictures.url(this.url2, this.options))
        })
        xit('should set the src attribute to data-src if no options are set', function () {
            this.options = null
            this.tinyPictures.unveil(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.url2)
        })
        xit('should calculate the srcset attribute based on the source image\'s width', function () {
            this.tinyPictures.unveil(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('srcset', jasmine.anything())
        })
        xit('should calculate the srcset attribute even if no options are set', function () {
            this.options = null
            this.tinyPictures.unveil(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('srcset', jasmine.anything())
        })
        xit('should use options parameter', function () {
            const optionsOverride = {quality: 60}
            this.tinyPictures.unveil(this.img, optionsOverride)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.tinyPictures.url(this.url2, optionsOverride))
        })
    })

    describe('unveilAll', function () {
        beforeEach(function () {
            this.jsdom = new jsdom(
                '<img data-tp-src="https://tiny.pictures/example1.jpg" data-tp-options=\'{"width": 200}\'>' +
                '<img src="https://tiny.pictures/example2.jpg">',
                {
                    url: 'https://tiny.pictures/'
                }
            )
            this.tinyPictures = new TinyPictures({
                window: this.jsdom.window,
                user: 'demo'
            })
        })

        xit('should set the src attribute of all images', function () {
            this.tinyPictures.unveilAll()
            const images = this.jsdom.window.document.getElementsByTagName('img')
            expect(images[0].getAttribute('src')).toBe('https://demo.tiny.pictures/?width=200&source=https%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(images[1].getAttribute('src')).toBe('https://tiny.pictures/example2.jpg')
        })
    })
})
