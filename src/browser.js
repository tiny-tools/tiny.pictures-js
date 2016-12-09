const lazyload = require('vanilla-lazyload')

const tinyPictures = Object.assign(
    require('./universal.js'),
    {
        immediateAll: () => {
            var list = document.getElementsByTagName('img')
            for (var i = 0; i < list.length; i++) {
                tinyPictures.immediate(list[i])
            }
        },
        lazyload: () => {
            return new lazyload({
                data_src: 'src',
                data_srcset: 'srcset',
                callback_set: tinyPictures.immediate
            })
        },
        immediate: (img, options) => {
            if (!options) {
                const optionsString = img.getAttribute('data-tiny.pictures')
                options = optionsString ? JSON.parse(optionsString) : null
            }
            const originalSrc = img.getAttribute('data-src') || img.getAttribute('src')
            if (!originalSrc) return
            const originalWidth = +img.getAttribute('data-tiny.pictures-width')

            // src
            img.setAttribute('src', options ? tinyPictures.url(originalSrc, options) : originalSrc)

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
        },
        registerJQueryPlugin: (jQuery) => {
            jQuery.fn.tinyPictures = function (options) {
                this.filter('img[data-src]').each(function () {
                    return tinyPictures.immediate(this, options)
                })
                return this
            }
        }
    }
)

tinyPictures._url = tinyPictures.url
tinyPictures.url = (...args) => {
    args[3] = args[3] ? args[3] : typeof location == 'object' ? location.href : null
    return tinyPictures._url(...args)
}

// eslint-disable-next-line no-undef
if (typeof angular == 'object' && typeof angular.module == 'function') {
    // eslint-disable-next-line no-undef
    tinyPictures.registerAngularModule(angular)
}

// eslint-disable-next-line no-undef
if (typeof jQuery == 'function' && typeof jQuery.fn == 'object') {
    // eslint-disable-next-line no-undef
    tinyPictures.registerJQueryPlugin(jQuery)
}

module.exports = {
    pictures: tinyPictures
}
