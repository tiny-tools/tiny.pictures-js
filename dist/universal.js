'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _sample = require('lodash/sample');

var _sample2 = _interopRequireDefault(_sample);

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

var _syncIsPrivateHost = require('sync-is-private-host');

var _vanillaLazyload = require('vanilla-lazyload');

var _vanillaLazyload2 = _interopRequireDefault(_vanillaLazyload);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function TinyPictures() {
        var _this = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, TinyPictures);

        this._options = (0, _defaults2.default)({}, options, {
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
        });

        // plausibility checks
        if (!this._options.user) throw 'no user set';

        // _overrideSources
        switch (_typeof(this._options.overrideSourcesImages)) {
            case 'boolean':
            case 'string':
                switch (this._options.overrideSourcesImages) {
                    case true:
                    case 'random':
                        this._overrideSourcesImages = ['http://lorempixel.com/1920/1920'];
                        break;
                    case false:
                        this._overrideSourcesImages = [];
                        break;
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
                        this._overrideSourcesImages = (0, _range2.default)(1, 11).map(function (number) {
                            return 'http://lorempixel.com/1920/1920/' + _this._options.overrideSourcesImages + '/' + number;
                        });
                        break;
                    default:
                        this._overrideSourcesImages = [this._options.overrideSourcesImages];
                }
                break;
            default:
                this._overrideSourcesImages = this._options.overrideSourcesImages;
                break;
        }

        // _apiBaseUrlObject
        switch (this._options.customSubdomain) {
            case false:
                this._apiBaseUrlObject = {
                    protocol: this._options.protocol,
                    hostname: 'tiny.pictures',
                    port: null,
                    path: '/api/' + this._options.user + '/'
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
                this._apiBaseUrlObject = _urijs2.default.parse(this._options.customSubdomain + this._options.user + '/');
                break;
        }
    }

    _createClass(TinyPictures, [{
        key: 'baseUrl',
        value: function baseUrl() {
            if (this._options.defaultBaseUrl) {
                return this._options.defaultBaseUrl;
            } else if (this._options.location && this._options.location.href) {
                return this._options.location.href;
            } else {
                return '';
            }
        }
    }, {
        key: 'url',
        value: function url() {
            var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var slashesDenoteHost = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var baseUrl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.baseUrl();

            if (!source) return null;

            var baseUrlObject = baseUrl ? (0, _urijs2.default)(baseUrl).normalize() : null;
            if (source.indexOf('//') === 0 && baseUrlObject) {
                source = source.replace(/^\/\//, baseUrlObject.protocol() + '://' + (slashesDenoteHost ? '' : baseUrlObject.host() + '/'));
            }
            var sourceObject = (0, _urijs2.default)(source).normalize();
            if ((!sourceObject.protocol() || !sourceObject.hostname()) && baseUrl) {
                sourceObject = sourceObject.absoluteTo(baseUrl);
            }
            if (!sourceObject.protocol() || !sourceObject.hostname()) {
                throw new Error('source does not have a protocol or hostname');
            }

            // override sources
            if (this._overrideSourcesImages.length && (this._options.overrideSourcesAlways || (0, _syncIsPrivateHost.isPrivate)(sourceObject.hostname()))) {
                sourceObject = (0, _urijs2.default)((0, _sample2.default)(this._overrideSourcesImages));
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
            var _this2 = this;

            var srcsetArray = [];
            (0, _forEach2.default)(this._options.srcsetWidths, function (width) {
                if (width >= originalWidth) return false;
                srcsetArray.push(_this2.url(originalSrc, Object.assign({}, options, { width: width })) + ' ' + width + 'w');
            });
            srcsetArray.push(this.url(originalSrc, Object.assign({}, options, { width: originalWidth })) + ' ' + originalWidth + 'w');
            return srcsetArray;
        }
    }, {
        key: 'image',
        value: function image() {
            var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var originalWidth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            // src
            attributes.src = options ? this.url(source, options) : source;

            // srcset
            if (originalWidth) {
                var srcsetArray = this.srcsetArray(source, originalWidth, options);
                if (srcsetArray.length) {
                    attributes.srcset = srcsetArray.join(', ');
                }
            }

            var img = '<img';
            (0, _forEach2.default)(attributes, function (val, key) {
                img += ' ' + key + '="' + val + '"';
            });
            img += '>';
            return img;
        }
    }, {
        key: 'immediate',
        value: function immediate(img, options) {
            if (!options) {
                var optionsString = img.getAttribute('data-tiny.pictures');
                options = optionsString ? JSON.parse(optionsString) : null;
            }

            var originalSrc = img.getAttribute('data-src') || img.getAttribute('src');
            if (!originalSrc) return;
            var originalWidth = +img.getAttribute('data-tiny.pictures-width');

            // src
            img.setAttribute('src', options ? this.url(originalSrc, options) : originalSrc);

            // srcset
            if (originalWidth) {
                var srcsetArray = this.srcsetArray(originalSrc, originalWidth, options);
                if (srcsetArray.length) {
                    img.setAttribute('srcset', srcsetArray.join(', '));
                }
            }
        }
    }, {
        key: 'immediateAll',
        value: function immediateAll() {
            var document = this._options.document;
            if (!document) throw 'No document';
            var list = document.getElementsByTagName('img');
            for (var i = 0; i < list.length; i++) {
                this.immediate(list[i]);
            }
        }
    }, {
        key: 'lazyload',
        value: function lazyload() {
            return new _vanillaLazyload2.default({
                data_src: 'src',
                data_srcset: 'srcset',
                callback_set: this.immediate
            });
        }
    }, {
        key: 'registerAngularJsModule',
        value: function registerAngularJsModule(angular) {
            var _this3 = this;

            angular.module('tiny.pictures', []).filter('tinyPicturesUrl', function () {
                return _this3.url;
            });
        }
    }, {
        key: 'registerJQueryPlugin',
        value: function registerJQueryPlugin(jQuery) {
            var self = this;
            jQuery.fn.tinyPictures = function (options) {
                this.filter('img[data-src]').each(function () {
                    return self.immediate(this, options);
                });
                return this;
            };
        }
    }]);

    return TinyPictures;
}();
