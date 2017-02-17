import LazyLoad from 'vanilla-lazyload'

import Universal from './universal'

export class Browser extends Universal {
    url(...args) {
        args[3] = args[3] ? args[3] : typeof location === 'object' ? location.href : null
        return super.url(...args)
    }

    immediateAll() {
        var list = document.getElementsByTagName('img')
        for (var i = 0; i < list.length; i++) {
            this.immediate(list[i])
        }
    }

    lazyload() {
        return new LazyLoad({
            data_src: 'src',
            data_srcset: 'srcset',
            callback_set: this.immediate
        })
    }

    immediate(img, options) {
        if (!options) {
            const optionsString = img.getAttribute('data-tiny.pictures')
            options = optionsString ? JSON.parse(optionsString) : null
        }

        const originalSrc = img.getAttribute('data-src') || img.getAttribute('src')
        if (!originalSrc) return
        const originalWidth = +img.getAttribute('data-tiny.pictures-width')

        // src
        img.setAttribute('src', options ? this.url(originalSrc, options) : originalSrc)

        // srcset
        if (originalWidth) {
            const srcsetArray = this.srcsetArray(originalSrc, originalWidth, options)
            if (srcsetArray.length) {
                img.setAttribute('srcset', srcsetArray.join(', '))
            }
        }
    }

    registerAngularModule(angular) {
        angular.module('tiny.pictures', []).filter('tinyPicturesUrl', () => this.url)
    }

    registerJQueryPlugin(jQuery) {
        const self = this
        jQuery.fn.tinyPictures = function (options) {
            this.filter('img[data-src]').each(function () {
                return self.immediate(this, options)
            })
            return this
        }
    }
}

export {
    Browser as pictures
}
