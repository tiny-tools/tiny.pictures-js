'use strict';

var urijs = require('urijs');
var forEach = require('lodash/forEach');

var tiny = {
    pictures: {
        url: function url(_url, options) {
            if (!options) options = {};

            var urlObject = urijs(_url).normalize();

            var queryObject = urlObject.query(true);
            urlObject.query('');
            var encoded = encodeURIComponent(JSON.stringify(queryObject));
            // if not empty object
            if (encoded != '%7B%7D') {
                urlObject.addQuery('query', encoded);
            }

            urlObject.addQuery('protocol', urlObject.protocol());
            urlObject.protocol('https');

            urlObject.addQuery('hostname', urlObject.hostname());
            urlObject.hostname('tiny.pictures');

            if (urlObject.port() != '' && (urlObject.hasQuery('protocol', 'http') && urlObject.port() != 80 || urlObject.hasQuery('protocol', 'https') && urlObject.port() != 443)) {
                urlObject.addQuery('port', urlObject.port());
            }
            urlObject.port('');

            urlObject.path('/api' + urlObject.path());

            forEach(options, function (val, key) {
                urlObject.addQuery(key, val);
            });

            return urlObject.toString();
        }
    }
};

module.exports = tiny;
