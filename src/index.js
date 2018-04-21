const urijs = require('urijs')
const defaults = require('lodash/defaults')
const forEach = require('lodash/forEach')
const find = require('lodash/find')
const startsWith = require('lodash/startsWith')
const sample = require('lodash/sample')
const range = require('lodash/range')
const assign = require('lodash/assign')
const isPrivate = require('sync-is-private-host').isPrivate

module.exports = class TinyPicturesUniversal {
    constructor(options) {
        this._options = defaults(
            {},
            options,
            {
                user: null,
                namedSources: [],
                overrideSourcesImages: [],
                overrideSourcesAlways: false,
                customSubdomain: true,
                protocol: 'https',
                defaultBaseUrl: '',
                srcsetWidths: [
                    50,
                    75,
                    100,
                    120,
                    180,
                    360,
                    540,
                    720,
                    900,
                    1080,
                    1296,
                    1512,
                    1728,
                    1944,
                    2160,
                    2376,
                    2592,
                    2808,
                    3024
                ]
            }
        )
        this._options.lazySizesConfig = defaults(
            {},
            options && options.lazySizesConfig ? options.lazySizesConfig : {},
            {
                lazyClass: 'tp-lazyload',
                preloadClass: 'tp-lazypreload',
                loadingClass: 'tp-lazyloading',
                loadedClass: 'tp-lazyloaded',
                sizesAttr: 'data-tp-sizes',
                autosizesClass: 'tp-lazyautosizes',
                loadMode: 3,
                init: false
            }
        )

        // plausibility checks
        if (!this._options.user) {
            throw 'no user set'
        }

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
                        this._overrideSourcesImages = range(1, 11)
                            .map((number) => {
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
                    path: '/api/' + this._options.user + '/'
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
                this._apiBaseUrlObject = urijs.parse(this._options.customSubdomain + this._options.user + '/')
                break
        }
    }

    baseUrl() {
        if (this._options.defaultBaseUrl) {
            return this._options.defaultBaseUrl
        }

        return ''
    }

    url(source = '', options = {}, baseUrl = this.baseUrl()) {
        if (!source) {
            return null
        }

        let baseUrlObject = baseUrl ? urijs(baseUrl).normalize() : null
        if (source.indexOf('//') === 0 && baseUrlObject) {
            source = baseUrlObject.protocol() + ':' + source
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
        let urlObjectParams = assign({}, this._apiBaseUrlObject)
        if (namedSource) {
            urlObjectParams.path = urijs.joinPaths(
                urlObjectParams.path,
                namedSource.name,
                sourceUrl.replace(namedSource.url, '')
            )
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

    srcsetArray(originalSrc, options) {
        let srcsetArray = []
        forEach(this._options.srcsetWidths, (width) => {
            srcsetArray.push(this.url(originalSrc, assign({}, options, {width: width})) + ' ' + width + 'w')
        })
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
}
