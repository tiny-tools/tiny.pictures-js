const urijs = require('urijs')
const forEach = require('lodash/forEach')

const universal = {
    protocol: 'https',
    hostname: 'tiny.pictures',
    url: (url, options) => {
        if (!options) options = {}

        let urlObject = urijs(url).normalize()

        if (!urlObject.protocol() || !urlObject.hostname()) {
            throw new Error('url does not have a protocol or hostname')
        }

        const queryObject = urlObject.query(true)
        urlObject.query('')
        const encoded = encodeURIComponent(JSON.stringify(queryObject))
        // if not empty object
        if (encoded != '%7B%7D') {
            urlObject.addQuery('query', encoded)
        }

        urlObject.addQuery('protocol', urlObject.protocol())
        urlObject.protocol(universal.protocol)

        urlObject.addQuery('hostname', urlObject.hostname())
        urlObject.hostname(universal.hostname)

        if (urlObject.port() != '' && (urlObject.hasQuery('protocol', 'http') && urlObject.port() != 80 || urlObject.hasQuery('protocol', 'https') && urlObject.port() != 443)) {
            urlObject.addQuery('port', urlObject.port())
        }
        urlObject.port('')

        urlObject.path('/api' + urlObject.path())

        forEach(options, (val, key) => {
            urlObject.addQuery(key, val)
        })

        return urlObject.toString()
    },
    srcsetArray: (originalSrc, originalWidth, options) => {
        let srcsetArray = []
        forEach(universal.widths, (width) => {
            if (width > originalWidth) return false
            srcsetArray.push(universal.url(originalSrc, Object.assign({}, options, {width: width})) + ' ' + width + 'w')
        })
        srcsetArray.push(universal.url(originalSrc, Object.assign({}, options, {width: originalWidth})) + ' ' + originalWidth + 'w')
        return srcsetArray
    },
    widths: [10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000]
}

module.exports = universal
