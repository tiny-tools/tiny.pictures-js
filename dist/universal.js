'use strict';

var urijs = require('urijs');
var forEach = require('lodash/forEach');

var universal = {
    protocol: 'https',
    hostname: 'api.tiny.pictures',
    port: null,
    user: null,
    url: function url(source, options, slashesDenoteHost, baseUrl) {
        if (typeof options == 'undefined') options = {};
        slashesDenoteHost = !!slashesDenoteHost;

        if (!source) {
            return null;
        }

        var user = options.user || universal.user;
        if (!user) {
            throw new Error('no user set');
        }

        var baseUrlObject = baseUrl ? urijs(baseUrl).normalize() : null;
        if (source.indexOf('//') == 0 && baseUrlObject) {
            source = source.replace(/^\/\//, baseUrlObject.protocol() + '://' + (slashesDenoteHost ? '' : baseUrlObject.host() + '/'));
        }
        var sourceObject = urijs(source).normalize();
        if ((!sourceObject.protocol() || !sourceObject.hostname()) && baseUrl) {
            sourceObject = sourceObject.absoluteTo(baseUrl);
        }
        if (!sourceObject.protocol() || !sourceObject.hostname()) {
            throw new Error('source does not have a protocol or hostname');
        }

        var urlObject = urijs({
            protocol: universal.protocol,
            hostname: universal.hostname,
            port: universal.port,
            path: '/' + user
        }).normalize();
        forEach(options, function (val, key) {
            if (key != 'user') {
                urlObject.addQuery(key, val);
            }
        });
        urlObject.addQuery('source', sourceObject.toString());

        return urlObject.toString();
    },
    srcsetArray: function srcsetArray(originalSrc, originalWidth, options) {
        var srcsetArray = [];
        forEach(universal.widths, function (width) {
            if (width >= originalWidth) return false;
            srcsetArray.push(universal.url(originalSrc, Object.assign({}, options, { width: width })) + ' ' + width + 'w');
        });
        srcsetArray.push(universal.url(originalSrc, Object.assign({}, options, { width: originalWidth })) + ' ' + originalWidth + 'w');
        return srcsetArray;
    },
    widths: [10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000]
};

module.exports = universal;
