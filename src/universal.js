const urijs = require('urijs')
const forEach = require('lodash/forEach')

const universal = {
    protocol: 'https',
    hostname: 'tiny.pictures',
    port: '',
    url: (url, options, slashesDenoteHost, baseUrl) => {
        if (typeof options == 'undefined') options = {}
        slashesDenoteHost = !!slashesDenoteHost

        let baseUrlObject = baseUrl ? urijs(baseUrl).normalize() : null
        if (url.indexOf('//') == 0 && baseUrlObject) {
            url = url.replace(/^\/\//, baseUrlObject.protocol() + '://' + (slashesDenoteHost ? '' : baseUrlObject.host() + '/'))
        }
        let urlObject = urijs(url).normalize()

        if ((!urlObject.protocol() || !urlObject.hostname()) && baseUrl) {
            urlObject = urlObject.absoluteTo(baseUrl)
        }
        if (!urlObject.protocol() || !urlObject.hostname()) {
            throw new Error('url does not have a protocol or hostname')
        }

        const queryObject = urlObject.query(true)
        urlObject.query('')
        // if not empty object
        if (encodeURIComponent(JSON.stringify(queryObject)) != '%7B%7D') {
            urlObject.addQuery('query', JSON.stringify(queryObject));
        }

        urlObject.hostname(urlObject.hostname() + '.' + universal.hostname)

        if (urlObject.port() != '' && (urlObject.protocol() == 'http' && urlObject.port() != 80 || urlObject.protocol() == 'https' && urlObject.port() != 443)) {
            urlObject.addQuery('port', urlObject.port())
        }
        urlObject.port(universal.port)

        forEach(options, (val, key) => {
            urlObject.addQuery(key, val)
        })

        return urlObject.toString()
    },
    srcsetArray: (originalSrc, originalWidth, options) => {
        let srcsetArray = []
        forEach(universal.widths, (width) => {
            if (width >= originalWidth) return false
            srcsetArray.push(universal.url(originalSrc, Object.assign({}, options, {width: width})) + ' ' + width + 'w')
        })
        srcsetArray.push(universal.url(originalSrc, Object.assign({}, options, {width: originalWidth})) + ' ' + originalWidth + 'w')
        return srcsetArray
    },
    widths: [10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000]
}

module.exports = universal
