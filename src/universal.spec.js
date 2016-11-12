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
        it('should should throw if no hostname or protocol is set', () => {
            expect(() => universal.url('/example1.jpg'))
                .toThrow()
        })
    })
})
