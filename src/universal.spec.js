import { Universal } from './universal'

describe('Universal', function () {
    describe('constructor', function () {
        it('should throw if no user is set', function () {
            expect(() => new Universal()).toThrow()
            expect(() => new Universal({})).toThrow()
        })
        it('should set _apiBaseUrlObject', function () {
            expect((new Universal({
                user: 'demo'
            }))._apiBaseUrlObject.hostname).toBe('tiny.pictures')
            expect((new Universal({
                user: 'demo',
                customSubdomain: true
            }))._apiBaseUrlObject.hostname).toBe('api.tiny.pictures')
            expect((new Universal({
                user: 'demo',
                customSubdomain: 'http://localhost:1336/'
            }))._apiBaseUrlObject.hostname).toBe('localhost')
        })
    })

    describe('url', function () {
        beforeEach(function () {
            this.universal = new Universal({user: 'demo'})
        })

        it('should return null if no source is set', function () {
            expect(this.universal.url('')).toBe(null)
        })
        it('should convert urls to a tiny.pictures url', function () {
            expect(this.universal.url('http://tiny.pictures/example1.jpg'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.universal.url('http://tiny.pictures:80/example1.jpg'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.universal.url('http://tiny.pictures:1336/example1.jpg'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg')
            expect(this.universal.url('http://tiny.pictures:1336/example1.jpg?test=true'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg%3Ftest%3Dtrue')
        })
        it('should append options to query string', function () {
            expect(this.universal.url('http://tiny.pictures/example1.jpg', {width: 100}))
                .toBe('https://tiny.pictures/api/demo?width=100&source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
        })
        it('should throw if no hostname or protocol is set and no location.href is present', function () {
            expect(() => this.universal.url('/example1.jpg')).toThrow()
            expect(() => this.universal.url('//tiny.pictures/example1.jpg')).toThrow()
        })
        it('should complement with baseUrl if no hostname or protocol is set', function () {
            expect(this.universal.url('/example1.jpg', {}, null, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.universal.url('example1.jpg', {}, null, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Fpath%2Fexample1.jpg')
            expect(this.universal.url('example1.jpg', {}, null, 'http://tiny.pictures/path/to/'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Fpath%2Fto%2Fexample1.jpg')
        })
        it('should respect defaultBaseUrl option', function () {
            this.universal = new Universal({user: 'demo', defaultBaseUrl: 'http://tiny.pictures/path/to'})
            expect(this.universal.url('/example1.jpg')).toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
        })
        it('should respect the slashesDenoteHost parameter', function () {
            expect(this.universal.url('//tiny.pictures/example1.jpg', {}, true, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.universal.url('//tiny.pictures/example1.jpg', {}, true, 'https://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo?source=https%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.universal.url('//tiny.pictures/example1.jpg', {}, false, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.universal.url('//example1.jpg', {}, true, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Fexample1.jpg%2F')
            expect(this.universal.url('//example1.jpg', {}, false, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(this.universal.url('//example1.jpg', {}, false, 'http://tiny.pictures:1336/path/to'))
                .toBe('https://tiny.pictures/api/demo?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg')
        })
        it('should use named sources', function () {
            const originalNamedSources = this.universal._options.namedSources
            this.universal._options.namedSources = [{name: 'main', url: 'https://tiny.pictures'}]
            expect(this.universal.url('https://tiny.pictures/example1.jpg')).toBe('https://tiny.pictures/api/demo/main/example1.jpg')
            this.universal.namedSources = [{name: 'main', url: 'https://tiny.pictures/'}]
            expect(this.universal.url('https://tiny.pictures/example1.jpg')).toBe('https://tiny.pictures/api/demo/main/example1.jpg')
            this.universal._options.namedSources = originalNamedSources
        })
        it('should respect overrideSources', function() {
            this.universal = new Universal({
                user: 'demo',
                overrideSourcesImages: 'cats',
                overrideSourcesAlways: true
            })
            expect(this.universal.url('http://tiny.pictures/example1.jpg'))
                .toMatch(/https:\/\/tiny.pictures\/api\/demo\?source=http%3A%2F%2Florempixel\.com%2F1920%2F1920%2Fcats%2F\d+/)
        })
    })

    describe('image', function () {
        beforeEach(function () {
            this.universal = new Universal({user: 'demo'})
            this.source = 'https://tiny.pictures/example1.jpg'
            this.options = {quality: 50}
            this.attributes = {class: 'col-xs-12 col-md-6'}
            this.originalWidth = 800
        })

        it('should create a valid image tag', function () {
            expect(this.universal.image(
                this.source,
                this.options,
                this.attributes,
                this.originalWidth
            )).toBe('<img class="col-xs-12 col-md-6" src="' + this.universal.url(this.source, this.options) + '" srcset="' + this.universal.srcsetArray(this.source, this.originalWidth, this.options).join(', ') + '">')
        })
    })

    describe('srcsetArray', function () {
        beforeEach(function () {
            this.universal = new Universal({user: 'demo'})
            this.url = 'http://tiny.pictures/example1.jpg'
            this.options = {quality: 50}
        })

        it('should build a srcset array', function () {
            expect(this.universal.srcsetArray(this.url, 120, this.options)).toEqual([
                this.universal.url(this.url, Object.assign({}, this.options, {width: 10})) + ' 10w',
                this.universal.url(this.url, Object.assign({}, this.options, {width: 25})) + ' 25w',
                this.universal.url(this.url, Object.assign({}, this.options, {width: 50})) + ' 50w',
                this.universal.url(this.url, Object.assign({}, this.options, {width: 100})) + ' 100w',
                this.universal.url(this.url, Object.assign({}, this.options, {width: 120})) + ' 120w'
            ])
        })
        it('should build a srcset array if originalWidth matches one of ours', function () {
            expect(this.universal.srcsetArray(this.url, 100, this.options)).toEqual([
                this.universal.url(this.url, Object.assign({}, this.options, {width: 10})) + ' 10w',
                this.universal.url(this.url, Object.assign({}, this.options, {width: 25})) + ' 25w',
                this.universal.url(this.url, Object.assign({}, this.options, {width: 50})) + ' 50w',
                this.universal.url(this.url, Object.assign({}, this.options, {width: 100})) + ' 100w'
            ])
        })
    })
})
