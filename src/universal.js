import urijs from 'urijs'
import defaults from 'lodash/defaults'
import forEach from 'lodash/forEach'
import find from 'lodash/find'
import startsWith from 'lodash/startsWith'

export default class Universal {
    constructor(options = {}) {
        this._options = defaults(
            {},
            options,
            {
                user: null,
                namedSources: [],
                devMode: false,
                customSubdomain: false,
                protocol: 'https',
                defaultBaseUrl: '',
                srcsetWidths: [10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000]
            }
        )

        // plausibility checks
        if (!this._options.user) throw new Error('no user set')

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
                this._apiBaseUrlObject = urijs.parse(this._options.customSubdomain)
                break
        }
    }

    url(source = '', options = {}, slashesDenoteHost = false, baseUrl = this._options.defaultBaseUrl) {
        if (!source) return null

        let baseUrlObject = baseUrl ? urijs(baseUrl).normalize() : null
        if (source.indexOf('//') == 0 && baseUrlObject) {
            source = source.replace(/^\/\//, baseUrlObject.protocol() + '://' + (slashesDenoteHost ? '' : baseUrlObject.host() + '/'))
        }
        let sourceObject = urijs(source).normalize()
        if ((!sourceObject.protocol() || !sourceObject.hostname()) && baseUrl) {
            sourceObject = sourceObject.absoluteTo(baseUrl)
        }
        if (!sourceObject.protocol() || !sourceObject.hostname()) {
            throw new Error('source does not have a protocol or hostname')
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
}
