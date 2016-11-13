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
                const srcsetArray = tinyPictures.srcsetArray(originalSrc, originalWidth, options)
                if (srcsetArray.length) {
                    img.setAttribute('srcset', srcsetArray.join(', '))
                }
            }
        },
        registerAngularModule: (angular) => {
            angular.module('tiny.pictures', []).filter('tinyPicturesUrl', () => tinyPictures.url)
        }
    }
)

tinyPictures._url = tinyPictures.url
tinyPictures.url = (...args) => tinyPictures._url(...args, typeof location == 'object' ? location.href : null)

// eslint-disable-next-line no-undef
if (typeof angular == 'object' && typeof angular.module == 'function') {
    // eslint-disable-next-line no-undef
    tinyPictures.registerAngularModule(angular)
}

module.exports = {
    pictures: tinyPictures
}
