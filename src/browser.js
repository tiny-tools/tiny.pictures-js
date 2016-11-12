const lazyload = require('vanilla-lazyload')
const forEach = require('lodash/forEach')

const tinyPictures = Object.assign(
    require('./universal.js'),
    {
        immediate: () => {
            return forEach(document.getElementsByTagName('img'), (img) => {
                if (!img.getAttribute('data-src')) return
                const src = img.getAttribute('data-src')
                if (src) {
                    img.setAttribute('src', src)
                }
                tinyPictures.replaceSourceAttributes(img)
            })
        },
        lazyload: () => {
            return new lazyload({
                data_src: 'src',
                data_srcset: 'srcset',
                callback_set: tinyPictures.replaceSourceAttributes
            })
        },
        replaceSourceAttributes: (img) => {
            const optionsString = img.getAttribute('data-tiny.pictures')
            const options = optionsString ? JSON.parse(optionsString) : null
            const originalSrc = img.getAttribute('src')
            const originalWidth = +img.getAttribute('data-tiny.pictures-width')

            // src
            if (options) {
                img.setAttribute('src', tinyPictures.url(originalSrc, options))
            }

            // srcset
            if (originalWidth) {
                let srcsetArray = []
                forEach(tinyPictures.widths, (width) => {
                    if (width > originalWidth) return false
                    srcsetArray.push(tinyPictures.url(originalSrc, Object.assign({}, options, {width: width})) + ' ' + width + 'w')
                })
                srcsetArray.push(tinyPictures.url(originalSrc, Object.assign({}, options, {width: originalWidth})) + ' ' + originalWidth + 'w')
                if (srcsetArray.length) {
                    img.setAttribute('srcset', srcsetArray.join(', '))
                }
            }
        },
        widths: [10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000]
    }
)

module.exports = {
    pictures: tinyPictures
}
