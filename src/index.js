const urijs = require('urijs')
const defaultsDeep = require('lodash/defaultsDeep')
const forEach = require('lodash/forEach')
const find = require('lodash/find')
const startsWith = require('lodash/startsWith')
const sample = require('lodash/sample')
const range = require('lodash/range')
const isPrivate = require('sync-is-private-host').isPrivate

class TinyPictures {
    constructor(options) {
        this._options = defaultsDeep(
            {},
            options,
            {
                window: null,
                user: null,
                namedSources: [],
                overrideSourcesImages: [],
                overrideSourcesAlways: false,
                customSubdomain: true,
                protocol: 'https',
                defaultBaseUrl: '',
                srcsetWidths: [50, 75, 100, 120, 180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 1944, 2160, 2376, 2592, 2808, 3024],
                lazySizesConfig: {
                    lazyClass: 'tp-lazyload',
                    preloadClass: 'tp-lazypreload',
                    loadingClass: 'tp-lazyloading',
                    loadedClass: 'tp-lazyloaded',
                    sizesAttr: 'data-tp-sizes',
                    loadMode: 3,
                    init: false,
                    rias: {
                        srcAttr: 'data-tp-srcset',
                    }
                }
            }
        )
        this._options.lazySizesConfig.rias.widths = this._options.srcsetWidths


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

        // lazySizes
        if (typeof window !== 'undefined') {
            const lazySizesBackup = window.lazySizes
            const lazySizesConfigBackup = window.lazySizesConfig
            window.lazySizesConfig = this._options.lazySizesConfig
            this._lazySizesRias = require('lazysizes/plugins/rias/ls.rias.js')
            this._lazySizes = require('lazysizes')
            window.lazySizes = lazySizesBackup
            window.lazySizesConfig = lazySizesConfigBackup

            this._options.window.document.addEventListener('lazyriasmodifyoptions', (event) => {
                event.detail.width = this.url(
                    event.target.getAttribute('data-tp-src'),
                    this._mergedOptions(event.target, {width: '{width}'})
                )
            })
            this._options.window.document.addEventListener('lazybeforeunveil', (event) => {
                event.target.setAttribute(
                    'data-src',
                    this.url(
                        event.target.getAttribute('data-tp-src'),
                        this._mergedOptions(event.target)
                    )
                )
                if (event.target.getAttribute('data-tp-srcset') === '{width}') {
                    event.target.setAttribute(
                        'data-srcset',
                        this.srcsetArray(
                            event.target.getAttribute('data-tp-src'),
                            this._mergedOptions(event.target)
                        ).join(', ')
                    )
                }
            })
        }
    }

    _mergedOptions(img, overrideOptions) {
        const optionsString = img.getAttribute('data-tp-options')
        const options = optionsString ? JSON.parse(optionsString) : {}
        return Object.assign({}, options, overrideOptions)
    }

    baseUrl() {
        if (this._options.defaultBaseUrl) {
            return this._options.defaultBaseUrl
        } else if (this._options.window && this._options.window.location && this._options.window.location.href) {
            return this._options.window.location.href
        } else {
            return ''
        }
    }

    url(source = '', options = {}, baseUrl = this.baseUrl()) {
        if (!source) return null

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

        return urlObject.toString().replace(/%7Bwidth%7D/gi, '{width}')
    }

    srcsetArray(originalSrc, options) {
        let srcsetArray = []
        forEach(this._options.srcsetWidths, (width) => {
            srcsetArray.push(this.url(originalSrc, Object.assign({}, options, {width: width})) + ' ' + width + 'w')
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

    unveil(img) {
        return this._lazySizes.loader.unveil(img)
    }

    unveilAll() {
        const document = this._options.window.document
        var list = document.getElementsByTagName('img')
        for (var i = 0; i < list.length; i++) {
            this.unveil(list[i])
        }
    }

    lazyload() {
        this._lazySizes.init()
    }

    registerAngularJsModule(angular) {
        angular.module('tiny.pictures', []).filter('tinyPicturesUrl', () => this.url.bind(this))
    }

    registerJQueryPlugin(jQuery) {
        const self = this
        jQuery.fn.tinyPictures = function () {
            this.filter('img').each(function () {
                return self.unveil(this)
            })
            return this
        }
    }
}

module.exports = TinyPictures
