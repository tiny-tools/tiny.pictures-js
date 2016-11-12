describe('browser.js', () => {
    let browser
    beforeAll(() => {
        browser = require('./browser.js').pictures
    })

    describe('replaceImageAttributes', () => {
        let url, img
        beforeEach(() => {
            url = 'https://tiny.pictures/example'
            img = jasmine.createSpyObj('img', ['getAttribute', 'setAttribute'])
            img.getAttribute.and.callFake((attribute) => {
                switch (attribute) {
                    case 'src':
                        return url
                    case 'data-tiny.pictures':
                        return JSON.stringify({quality: 50})
                    case 'data-tiny.pictures-width':
                        return '330'
                }
            })
        })

        it('should replace the src attribute', () => {
            browser.replaceSourceAttributes(img)
            expect(img.setAttribute).toHaveBeenCalledWith('src', browser.url(url, {quality: 50}))
        })
        it('should calculate the srcset attribute based on the source image\'s width', () => {
            browser.replaceSourceAttributes(img)
            expect(img.setAttribute).toHaveBeenCalledWith('srcset', browser.url(url, {quality: 50, width: 10}) + ' 10w, ' + browser.url(url, {quality: 50, width: 25}) + ' 25w, ' + browser.url(url, {quality: 50, width: 50}) + ' 50w, ' + browser.url(url, {quality: 50, width: 100}) + ' 100w, ' + browser.url(url, {quality: 50, width: 200}) + ' 200w, ' + browser.url(url, {quality: 50, width: 300}) + ' 300w, ' + browser.url(url, {quality: 50, width: 330}) + ' 330w')
        })
    })
})
