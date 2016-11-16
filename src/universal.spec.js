describe('universal.js', () => {
    let universal
    beforeAll(() => {
        universal = require('./universal.js')
    })

    describe('url', () => {
        it('should convert http urls to a tiny.pictures url', () => {
            expect(universal.url('http://tiny.pictures/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures')
            expect(universal.url('http://tiny.pictures:80/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures')
            expect(universal.url('http://tiny.pictures:1336/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures&port=1336')
        })
        it('should convert https urls to a tiny.pictures url', () => {
            expect(universal.url('https://tiny.pictures/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures')
            expect(universal.url('https://tiny.pictures:443/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures')
            expect(universal.url('https://tiny.pictures:1336/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures&port=1336')
        })
        it('should append options to query string', () => {
            expect(universal.url('https://tiny.pictures/example1.jpg', {width: 100}))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures&width=100')
        })
        it('should throw if no hostname or protocol is set and no location.href is present', () => {
            expect(() => universal.url('/example1.jpg'))
                .toThrow()
            expect(() => universal.url('//tiny.pictures/example1.jpg'))
                .toThrow()
        })
        it('should complement with location.href if no hostname or protocol is set', () => {
            expect(universal.url('/example1.jpg', null, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures')
            expect(universal.url('//tiny.pictures/example1.jpg', null, 'http://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures')
            expect(universal.url('//tiny.pictures/example1.jpg', null, 'https://tiny.pictures/path/to'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures')
        })
        it('should use custom protocol and hostname', () => {
            const originalProtocol = universal.protocol
            const originalHostname = universal.hostname
            const originalPort = universal.port
            universal.protocol = 'http'
            universal.hostname = 'custom.domain'
            universal.port = 1336
            expect(universal.url('http://tiny.pictures/example1.jpg'))
                .toBe('http://custom.domain:1336/api/example1.jpg?protocol=http&hostname=tiny.pictures')
            universal.protocol = originalProtocol
            universal.hostname = originalHostname
            universal.port = originalPort
        })
    })

    describe('srcsetArray', () => {
        let url, options
        beforeEach(() => {
            url = 'http://tiny.pictures/example1.jpg'
            options = {quality: 50}
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
