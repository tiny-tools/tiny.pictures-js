// const picturefill = require('picturefill')
const assign = require('lodash/assign')

const TinyPicturesUniversal = require('./index')

module.exports = class TinyPictures extends TinyPicturesUniversal {
    constructor(options) {
        super(options)

        // lazySizes
        const lazySizesConfigBackup = window.lazySizesConfig
        window.lazySizesConfig = this._options.lazySizesConfig
        this._lazySizes = require('lazysizes') // cannot be required before config is set on window
        window.lazySizesConfig = lazySizesConfigBackup

        window.document.addEventListener('lazybeforeunveil', (event) => {
            const img = event.target
            if (!img.getAttribute('data-tp-src') && !img.getAttribute('data-tp-srcset')) {
                return
            }

            let element = img
            const elementsToReveal = [img]

            const noPicture = img.hasAttribute('tp-nopicture') || img.classList.contains('tp-nopicture') // class for legacy reasons
            if (!noPicture) {
                element = this.wrapInPicture(img)
                const sources = element.getElementsByTagName('source')
                for (let i = 0; i < sources.length; i++) {
                    elementsToReveal.unshift(sources[i])
                }
            }

            elementsToReveal.forEach((elementToReveal) => this.revealAttributes(elementToReveal))
        })
    }

    baseUrl() {
        if (this._options.defaultBaseUrl) {
            return this._options.defaultBaseUrl
        }

        return window.location.href
    }

    wrapInPicture(img) {
        if (img.parentElement.nodeName.toLowerCase() === 'picture') {
            return img.parentElement
        }

        const eventName = 'tpbeforewrapinpicture'
        const event = typeof Event === 'function' ? new Event(eventName) : document.createEvent('Event')
        event.initEvent(eventName, true, true)
        img.dispatchEvent(event)
        if (event.defaultPrevented) {
            return null
        }

        const picture = document.createElement('picture')
        img.parentNode.insertBefore(picture, img)
        img.parentNode.removeChild(img)
        picture.appendChild(img)
        // add source elements
        const ie9Start = document.createComment('[if IE 9]><video style="display: none"><![endif]')
        const ie9End = document.createComment('[if IE 9]></video><![endif]')
        picture.insertBefore(ie9Start, img)
        const webpSource = document.createElement('source')
        webpSource.setAttribute('type', 'image/webp')
        const source = document.createElement('source')
        const attributes = [
            'data-tp-src',
            'data-tp-srcset',
            'data-tp-sizes'
        ]
        const elements = [webpSource, source]
        elements.forEach((element, index) => {
            attributes.forEach((attribute) => {
                const value = img.getAttribute(attribute)
                if (value) {
                    element.setAttribute(attribute, value)
                }
            })
            const overrideOptions = index === 0 ? {format: 'webp'} : {}
            element.setAttribute('data-tp-options', JSON.stringify(this.mergedOptions(img, overrideOptions)))
            picture.insertBefore(element, img)
        })
        picture.insertBefore(ie9End, img)
        return picture
    }

    mergedOptions(img, overrideOptions) {
        const optionsString = img.getAttribute('data-tp-options')
        const options = optionsString ? JSON.parse(optionsString) : {}
        return assign({}, options, overrideOptions)
    }

    revealAttributes(element) {
        // element can be either source or img
        const isSource = element.nodeName.toLowerCase() === 'source'
        const sizes = element.getAttribute('data-tp-sizes')

        if (sizes) {
            element.setAttribute(
                'srcset',
                this.srcsetArray(
                    element.getAttribute('data-tp-src'),
                    this.mergedOptions(element)
                )
                    .join(', ')
            )

            if (sizes === 'auto') {
                this._lazySizes.autoSizer.updateElem(element)
            } else {
                element.setAttribute('sizes', sizes)
            }
        }

        if(!sizes && isSource || !isSource) {
            element.setAttribute(
                isSource ? 'srcset' : 'src',
                this.url(
                    element.getAttribute('data-tp-src'),
                    this.mergedOptions(element)
                )
            )
        }
    }

    reveal(element) {
        if (element.classList.contains('tp-lazyloading') || element.classList.contains('tp-lazyloaded')) {
            return
        }

        return this._lazySizes.loader.unveil(element)
    }

    revealAll() {
        const document = window.document
        var list = document.getElementsByTagName('img')
        for (var i = 0; i < list.length; i++) {
            this.reveal(list[i])
        }
    }

    lazyload() {
        this._lazySizes.init()
    }

    registerAngularJsModule(angular) {
        angular.module('tiny.pictures', [])
            .filter('tinyPicturesUrl', () => this.url.bind(this))
    }

    registerJQueryPlugin(jQuery) {
        const self = this
        jQuery.fn.tinyPictures = function () {
            this.filter('img')
                .each(function () {
                    return self.reveal(this)
                })
            return this
        }
    }
}
