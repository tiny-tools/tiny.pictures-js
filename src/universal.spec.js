describe('universal.js', () => {
    let universal
    beforeAll(() => {
        universal = require('./universal.js')
    })

    describe('url', () => {
        it('should return null if no source is set', () => {
            expect(universal.url(''))
                .toBe(null)
        })
        it('should throw if no user is set', () => {
            expect(() => universal.url('http://tiny.pictures/example1.jpg'))
                .toThrow()
            expect(() => universal.url('http://tiny.pictures/example1.jpg', {}))
                .toThrow()
        })
        it('should convert urls to a tiny.pictures url', () => {
            expect(universal.url('http://tiny.pictures/example1.jpg', {user: 'demo'}))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(universal.url('http://tiny.pictures:80/example1.jpg', {user: 'demo'}))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(universal.url('http://tiny.pictures:1336/example1.jpg', {user: 'demo'}))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg')
            expect(universal.url('http://tiny.pictures:1336/example1.jpg?test=true', {user: 'demo'}))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg%3Ftest%3Dtrue')
        })
        it('should append options to query string', () => {
            expect(universal.url('http://tiny.pictures/example1.jpg', {user: 'demo', width: 100}))
                .toBe('https://api.tiny.pictures/demo?width=100&source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
        })
        it('should throw if no hostname or protocol is set and no location.href is present', () => {
            expect(() => universal.url('/example1.jpg'))
                .toThrow()
            expect(() => universal.url('//tiny.pictures/example1.jpg'))
                .toThrow()
        })
        it('should complement with location.href if no hostname or protocol is set', () => {
            expect(universal.url('/example1.jpg', {user: 'demo'}, null, 'http://tiny.pictures/path/to'))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(universal.url('example1.jpg', {user: 'demo'}, null, 'http://tiny.pictures/path/to'))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%2Fpath%2Fexample1.jpg')
            expect(universal.url('example1.jpg', {user: 'demo'}, null, 'http://tiny.pictures/path/to/'))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%2Fpath%2Fto%2Fexample1.jpg')
        })
        it('should respect the slashesDenoteHost parameter', () => {
            expect(universal.url('//tiny.pictures/example1.jpg', {user: 'demo'}, true, 'http://tiny.pictures/path/to'))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(universal.url('//tiny.pictures/example1.jpg', {user: 'demo'}, true, 'https://tiny.pictures/path/to'))
                .toBe('https://api.tiny.pictures/demo?source=https%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(universal.url('//tiny.pictures/example1.jpg', {user: 'demo'}, false, 'http://tiny.pictures/path/to'))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%2Ftiny.pictures%2Fexample1.jpg')
            expect(universal.url('//example1.jpg', {user: 'demo'}, true, 'http://tiny.pictures/path/to'))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Fexample1.jpg%2F')
            expect(universal.url('//example1.jpg', {user: 'demo'}, false, 'http://tiny.pictures/path/to'))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            expect(universal.url('//example1.jpg', {user: 'demo'}, false, 'http://tiny.pictures:1336/path/to'))
                .toBe('https://api.tiny.pictures/demo?source=http%3A%2F%2Ftiny.pictures%3A1336%2Fexample1.jpg')
        })
        it('should use custom protocol, hostname, port, and default user', () => {
            const originalProtocol = universal.protocol
            const originalHostname = universal.hostname
            const originalPort = universal.port
            const originalUser = universal.user
            universal.protocol = 'http'
            universal.hostname = 'custom.domain'
            universal.port = 1336
            universal.user = 'demo2'
            expect(universal.url('http://tiny.pictures/example1.jpg'))
                .toBe('http://custom.domain:1336/demo2?source=http%3A%2F%2Ftiny.pictures%2Fexample1.jpg')
            universal.protocol = originalProtocol
            universal.hostname = originalHostname
            universal.port = originalPort
            universal.user = originalUser
        })
        it('should use named sources', () => {
            const originalNamedSources = universal.namedSources
            universal.namedSources = [{name: 'main', url: 'https://tiny.pictures'}]
            expect(universal.url('https://tiny.pictures/example1.jpg', {user: 'demo'}))
                .toBe('https://api.tiny.pictures/demo/main/example1.jpg')
            universal.namedSources = [{name: 'main', url: 'https://tiny.pictures/'}]
            expect(universal.url('https://tiny.pictures/example1.jpg', {user: 'demo'}))
                .toBe('https://api.tiny.pictures/demo/main/example1.jpg')
            universal.namedSources = originalNamedSources
        })
    })

    describe('srcsetArray', () => {
        let url, options
        beforeEach(() => {
            url = 'http://tiny.pictures/example1.jpg'
            options = {user: 'demo', quality: 50}
        })

        it('should build a srcset array', () => {
            expect(universal.srcsetArray(url, 120, options)).toEqual([
                universal.url(url, Object.assign({}, options, {width: 10})) + ' 10w',
                universal.url(url, Object.assign({}, options, {width: 25})) + ' 25w',
                universal.url(url, Object.assign({}, options, {width: 50})) + ' 50w',
                universal.url(url, Object.assign({}, options, {width: 100})) + ' 100w',
                universal.url(url, Object.assign({}, options, {width: 120})) + ' 120w'
            ])
        })
        it('should build a srcset array if originalWidth matches one of ours', () => {
            expect(universal.srcsetArray(url, 100, options)).toEqual([
                universal.url(url, Object.assign({}, options, {width: 10})) + ' 10w',
                universal.url(url, Object.assign({}, options, {width: 25})) + ' 25w',
                universal.url(url, Object.assign({}, options, {width: 50})) + ' 50w',
                universal.url(url, Object.assign({}, options, {width: 100})) + ' 100w'
            ])
        })
    })
})
