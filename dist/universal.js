'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _defaults = require('lodash/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _startsWith = require('lodash/startsWith');

var _startsWith2 = _interopRequireDefault(_startsWith);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Universal = function () {
    function Universal() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Universal);

        this._options = (0, _defaults2.default)({}, options, {
            user: null,
            namedSources: [],
            devMode: false,
            customSubdomain: false,
            protocol: 'https',
            defaultBaseUrl: '',
            srcsetWidths: [10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 4750, 5000]
        });

        // plausibility checks
        if (!this._options.user) throw new Error('no user set');

        // _apiBaseUrlObject
        switch (this._options.customSubdomain) {
            case false:
                this._apiBaseUrlObject = {
                    protocol: this._options.protocol,
                    hostname: 'tiny.pictures',
                    port: null,
                    path: '/api/' + this._options.user
                };
                break;
            case true:
                this._apiBaseUrlObject = {
                    protocol: this._options.protocol,
                    hostname: this._options.user + '.tiny.pictures',
                    port: null,
                    path: '/'
                };
                break;
            default:
                this._apiBaseUrlObject = _urijs2.default.parse(this._options.customSubdomain);
                break;
        }
    }

    _createClass(Universal, [{
        key: 'url',
        value: function url() {
            var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var slashesDenoteHost = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var baseUrl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this._options.defaultBaseUrl;

            if (!source) return null;

            var baseUrlObject = baseUrl ? (0, _urijs2.default)(baseUrl).normalize() : null;
            if (source.indexOf('//') == 0 && baseUrlObject) {
                source = source.replace(/^\/\//, baseUrlObject.protocol() + '://' + (slashesDenoteHost ? '' : baseUrlObject.host() + '/'));
            }
            var sourceObject = (0, _urijs2.default)(source).normalize();
            if ((!sourceObject.protocol() || !sourceObject.hostname()) && baseUrl) {
                sourceObject = sourceObject.absoluteTo(baseUrl);
            }
            if (!sourceObject.protocol() || !sourceObject.hostname()) {
                throw new Error('source does not have a protocol or hostname');
            }

            // use named sources if present
            var sourceUrl = sourceObject.toString();
            var namedSource = (0, _find2.default)(this._options.namedSources, function (namedSource) {
                return (0, _startsWith2.default)(sourceUrl, namedSource.url);
            });
            var urlObjectParams = Object.assign({}, this._apiBaseUrlObject);
            if (namedSource) {
                urlObjectParams.path = _urijs2.default.joinPaths(urlObjectParams.path, namedSource.name, sourceUrl.replace(namedSource.url, ''));
            }

            // build urlObject
            var urlObject = (0, _urijs2.default)(urlObjectParams).normalize();
            (0, _forEach2.default)(options, function (val, key) {
                urlObject.addQuery(key, val);
            });
            if (!namedSource) {
                urlObject.addQuery('source', sourceUrl);
            }

            return urlObject.toString();
        }
    }, {
        key: 'srcsetArray',
        value: function srcsetArray(originalSrc, originalWidth, options) {
            var _this = this;

            var srcsetArray = [];
            (0, _forEach2.default)(this._options.srcsetWidths, function (width) {
                if (width >= originalWidth) return false;
                srcsetArray.push(_this.url(originalSrc, Object.assign({}, options, { width: width })) + ' ' + width + 'w');
            });
            srcsetArray.push(this.url(originalSrc, Object.assign({}, options, { width: originalWidth })) + ' ' + originalWidth + 'w');
            return srcsetArray;
        }
    }]);

    return Universal;
}();

exports.default = Universal;
