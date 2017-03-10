import urijs from 'urijs'
import defaults from 'lodash/defaults'
import forEach from 'lodash/forEach'
import find from 'lodash/find'
import startsWith from 'lodash/startsWith'
import sample from 'lodash/sample'
import range from 'lodash/range'
import { isPrivate } from 'sync-is-private-host'
import LazyLoad from 'vanilla-lazyload'

module.exports = class TinyPictures {
    constructor(options = {}) {
        this._options = defaults(
            {},
            options,
            {
                document: null,
                location: null,
                user: null,
                namedSources: [],
                overrideSourcesImages: [],
                overrideSourcesAlways: false,
                customSubdomain: false,
                protocol: 'https',
                defaultBaseUrl: '',
                srcsetWidths: [10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000]
            }
        )

        // plausibility checks
        if (!this._options.user)
            throw 'no user set'

        // _overrideSources
        switch (typeof this._options.overrideSourcesImages) {
            case 'boolean':
            case 'string':
                switch (this._options.overrideSourcesImages) {
                    case true:
                    case 'random':
                        this._overrideSourcesImages = ['http://lorempixel.com/1920/1920']
                        break
                    case false:
                        this._overrideSourcesImages = []
                        break
                    case 'abstract':
                    case 'animals':
                    case 'business':
                    case 'cats':
                    case 'city':
                    case 'food':
                    case 'nightlife':
                    case 'fashion':
                    case 'people':
                    case 'nature':
                    case 'sports':
                    case 'technics':
                    case 'transport':
                        this._overrideSourcesImages = range(1, 11).map((number) => {
                            return 'http://lorempixel.com/1920/1920/' + this._options.overrideSourcesImages + '/' + number
                        })
                        break
                    default:
                        this._overrideSourcesImages = [this._options.overrideSourcesImages]
                }
                break
            default:
                this._overrideSourcesImages = this._options.overrideSourcesImages
                break
        }

        // _apiBaseUrlObject
        switch (this._options.customSubdomain) {
            case false:
                this._apiBaseUrlObject = {
                    protocol: this._options.protocol,
                    hostname: 'tiny.pictures',
                    port: null,
                    path: '/api/' + this._options.user
                }
                break
            case true:
                this._apiBaseUrlObject = {
                    protocol: this._options.protocol,
                    hostname: this._options.user + '.tiny.pictures',
                    port: null,
                    path: '/'
                }
                break
            default:
                this._apiBaseUrlObject = urijs.parse(this._options.customSubdomain + this._options.user)
                break
        }
    }

    baseUrl() {
        if (this._options.defaultBaseUrl) {
            return this._options.defaultBaseUrl
        } else if (this._options.location && this._options.location.href) {
            return this._options.location.href
        } else {
            return ''
        }
    }

    url(source = '', options = {}, slashesDenoteHost = false, baseUrl = this.baseUrl()) {
        if (!source) return null

        let baseUrlObject = baseUrl ? urijs(baseUrl).normalize() : null
        if (source.indexOf('//') === 0 && baseUrlObject) {
            source = source.replace(/^\/\//, baseUrlObject.protocol() + '://' + (slashesDenoteHost ? '' : baseUrlObject.host() + '/'))
        }
        let sourceObject = urijs(source).normalize()
        if ((!sourceObject.protocol() || !sourceObject.hostname()) && baseUrl) {
            sourceObject = sourceObject.absoluteTo(baseUrl)
        }
        if (!sourceObject.protocol() || !sourceObject.hostname()) {
            throw new Error('source does not have a protocol or hostname')
        }

        // override sources
        if (this._overrideSourcesImages.length && (this._options.overrideSourcesAlways || isPrivate(sourceObject.hostname()))) {
            sourceObject = urijs(sample(this._overrideSourcesImages))
        }

        // use named sources if present
        const sourceUrl = sourceObject.toString()
        const namedSource = find(this._options.namedSources, (namedSource) => {
            return startsWith(sourceUrl, namedSource.url)
        })
        let urlObjectParams = Object.assign({}, this._apiBaseUrlObject)
        if (namedSource) {
            urlObjectParams.path = urijs.joinPaths(urlObjectParams.path, namedSource.name, sourceUrl.replace(namedSource.url, ''))
        }

        // build urlObject
        let urlObject = urijs(urlObjectParams).normalize()
        forEach(options, (val, key) => {
            urlObject.addQuery(key, val)
        })
        if (!namedSource) {
            urlObject.addQuery('source', sourceUrl)
        }

        return urlObject.toString()
    }

    srcsetArray(originalSrc, originalWidth, options) {
        let srcsetArray = []
        forEach(this._options.srcsetWidths, (width) => {
            if (width >= originalWidth) return false
            srcsetArray.push(this.url(originalSrc, Object.assign({}, options, {width: width})) + ' ' + width + 'w')
        })
        srcsetArray.push(this.url(originalSrc, Object.assign({}, options, {width: originalWidth})) + ' ' + originalWidth + 'w')
        return srcsetArray
    }

    image(source = '', options = {}, attributes = {}, originalWidth = null) {
        // src
        attributes.src = options ? this.url(source, options) : source

        // srcset
        if (originalWidth) {
            const srcsetArray = this.srcsetArray(source, originalWidth, options)
            if (srcsetArray.length) {
                attributes.srcset = srcsetArray.join(', ')
            }
        }

        let img = '<img'
        forEach(attributes, (val, key) => {
            img += ' ' + key + '="' + val + '"'
        })
        img += '>'
        return img
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

    immediateAll() {
        const document = this._options.document
        if (!document)
            throw 'No document'
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

    registerAngularJsModule(angular) {
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
