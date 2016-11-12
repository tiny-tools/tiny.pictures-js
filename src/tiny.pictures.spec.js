describe('tiny.pictures.js', () => {
    let tiny
    beforeAll(() => {
        tiny = require('./tiny.pictures.js')
    })

    describe('url', () => {
        it('should convert http urls to a tiny.pictures url', () => {
            expect(tiny.pictures.url('http://tiny.pictures/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures')
            expect(tiny.pictures.url('http://tiny.pictures:80/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures')
            expect(tiny.pictures.url('http://tiny.pictures:1336/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=http&hostname=tiny.pictures&port=1336')
        })
        it('should convert https urls to a tiny.pictures url', () => {
            expect(tiny.pictures.url('https://tiny.pictures/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures')
            expect(tiny.pictures.url('https://tiny.pictures:443/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures')
            expect(tiny.pictures.url('https://tiny.pictures:1336/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures&port=1336')
        })
        it('should append options to query string', () => {
            expect(tiny.pictures.url('https://tiny.pictures/example1.jpg'))
                .toBe('https://tiny.pictures/api/example1.jpg?protocol=https&hostname=tiny.pictures')
        })
    })
})
