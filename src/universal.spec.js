import jsdom from 'jsdom'
import TinyPictures from './universal'

describe('TinyPictures', function () {
    describe('constructor', function () {
        it('should throw if no user is set', function () {
            expect(() => new TinyPictures()).toThrow()
            expect(() => new TinyPictures({})).toThrow()
        })
        it('should set _apiBaseUrlObject', function () {
            expect((new TinyPictures({
                user: 'demo'
            }))._apiBaseUrlObject.hostname).toBe('tiny.pictures')
            expect((new TinyPictures({
                user: 'demo',
                customSubdomain: true
            }))._apiBaseUrlObject.hostname).toBe('demo.tiny.pictures')
            expect((new TinyPictures({
                user: 'demo',
                customSubdomain: 'http://api.localhost:1336/'
            }))._apiBaseUrlObject.hostname).toBe('api.localhost')
        })
    })

    describe('url', function () {
        beforeEach(function () {
            this.document = jsdom.jsdom(
                '<img data-src="https://tiny.pictures/example1.jpg" data-tiny.pictures=\'{"width": 200}\'>' +
                '<img data-src="https://tiny.pictures/example2.jpg">'
            )
            this.location = {
                href: ''
            }
            this.tinyPictures = new TinyPictures({
                document: this.document,
                location: this.location,
                user: 'demo'
            })
        })

        it('should return null if no source is set', function () {
            expect(this.tinyPictures.url('')).toBe(null)
        })
        it('should convert urls to a tiny.pictures url', function () {
            expect(this.tinyPictures.url('http://tiny.pictures/example1.jpg'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('http://tiny.pictures:80/example1.jpg'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('http://tiny.pictures:1336/example1.jpg'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg')
            expect(this.tinyPictures.url('http://tiny.pictures:1336/example1.jpg?test=true'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg%3Ftest%3Dtrue')
        })
        it('should append options to query string', function () {
            expect(this.tinyPictures.url('http://tiny.pictures/example1.jpg', {width: 100}))
                .toBe('https://tiny.pictures/api/demo/?width=100&source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
        })
        it('should throw if no hostname or protocol is set and no location.href is present', function () {
            expect(() => this.tinyPictures.url('/example1.jpg')).toThrow()
            expect(() => this.tinyPictures.url('//tiny.pictures/example1.jpg')).toThrow()
        })
        it('should complement with baseUrl if no hostname or protocol is set', function () {
            expect(this.tinyPictures.url('/example1.jpg', {}, null, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('example1.jpg', {}, null, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Fpath%2Fexample1.jpg')
            expect(this.tinyPictures.url('example1.jpg', {}, null, 'http://tiny.pictures/path/to/'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Fpath%2Fto%2Fexample1.jpg')
        })
        it('should respect defaultBaseUrl option', function () {
            this.tinyPictures = new TinyPictures({user: 'demo', defaultBaseUrl: 'http://tiny.pictures/path/to'})
            expect(this.tinyPictures.url('/example1.jpg')).toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
        })
        it('should respect the slashesDenoteHost parameter', function () {
            expect(this.tinyPictures.url('//tiny.pictures/example1.jpg', {}, true, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('//tiny.pictures/example1.jpg', {}, true, 'https://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo/?source=https%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('//tiny.pictures/example1.jpg', {}, false, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('//example1.jpg', {}, true, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Fexample1.jpg%2F')
            expect(this.tinyPictures.url('//example1.jpg', {}, false, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.tinyPictures.url('//example1.jpg', {}, false, 'http://tiny.pictures:1336/path/to'))
                .toBe('https://tiny.pictures/api/demo/?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg')
        })
        it('should use named sources', function () {
            const originalNamedSources = this.tinyPictures._options.namedSources
            this.tinyPictures._options.namedSources = [{name: 'main', url: 'https://tiny.pictures'}]
            expect(this.tinyPictures.url('https://tiny.pictures/example1.jpg')).toBe('https://tiny.pictures/api/demo/main/example1.jpg')
            this.tinyPictures.namedSources = [{name: 'main', url: 'https://tiny.pictures/'}]
            expect(this.tinyPictures.url('https://tiny.pictures/example1.jpg')).toBe('https://tiny.pictures/api/demo/main/example1.jpg')
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
        it('should respect overrideSources', function() {
            this.tinyPictures = new TinyPictures({
                user: 'demo',
                overrideSourcesImages: 'cats',
                overrideSourcesAlways: true
            })
            expect(this.tinyPictures.url('http://tiny.pictures/example1.jpg'))
                .toMatch(/https:\/\/tiny.pictures\/api\/demo\/\?source=http%3A%2F%2Florempixel\.com%2F1920%2F1920%2Fcats%2F\d+/)
        })
        it('should use location.href', function () {
            const baseUrl = 'http://tiny.pictures/path/to'
            this.location.href = baseUrl
            expect(this.tinyPictures.url('/example1.jpg')).toBe(this.tinyPictures.url('/example1.jpg', undefined, undefined, baseUrl))
            this.location.href = ''
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
            expect(this.tinyPictures.srcsetArray(this.url, 120, this.options)).toEqual([
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 10})) + ' 10w',
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 25})) + ' 25w',
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 50})) + ' 50w',
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 100})) + ' 100w',
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 120})) + ' 120w'
            ])
        })
        it('should build a srcset array if originalWidth matches one of ours', function () {
            expect(this.tinyPictures.srcsetArray(this.url, 100, this.options)).toEqual([
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 10})) + ' 10w',
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 25})) + ' 25w',
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 50})) + ' 50w',
                this.tinyPictures.url(this.url, Object.assign({}, this.options, {width: 100})) + ' 100w'
            ])
        })
    })

    describe('immediate', function () {
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

        it('should replace the src attribute', function () {
            this.tinyPictures.immediate(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.tinyPictures.url(this.url2, this.options))
        })
        it('should set the src attribute to data-src if no options are set', function () {
            this.options = null
            this.tinyPictures.immediate(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.url2)
        })
        it('should calculate the srcset attribute based on the source image\'s width', function () {
            this.tinyPictures.immediate(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('srcset', jasmine.anything())
        })
        it('should calculate the srcset attribute even if no options are set', function () {
            this.options = null
            this.tinyPictures.immediate(this.img)
            expect(this.img.setAttribute).toHaveBeenCalledWith('srcset', jasmine.anything())
        })
        it('should use options parameter', function () {
            const optionsOverride = {quality: 60}
            this.tinyPictures.immediate(this.img, optionsOverride)
            expect(this.img.setAttribute).toHaveBeenCalledWith('src', this.tinyPictures.url(this.url2, optionsOverride))
        })
    })

    describe('immediateAll', function () {
        beforeEach(function () {
            this.document = jsdom.jsdom(
                '<img data-src="https://tiny.pictures/example1.jpg" data-tiny.pictures=\'{"width": 200}\'>' +
                '<img data-src="https://tiny.pictures/example2.jpg">'
            )
            this.location = {
                href: ''
            }
            this.tinyPictures = new TinyPictures({
                document: this.document,
                location: this.location,
                user: 'demo'
            })
        })

        it('should set the src attribute of all images', function () {
            this.tinyPictures.immediateAll()
            const images = this.document.getElementsByTagName('img')
            expect(images[0].getAttribute('src')).toBe('https://tiny.pictures/api/demo/?width=200&source=https%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(images[1].getAttribute('src')).toBe('https://tiny.pictures/example2.jpg')
        })
    })

})
