'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var urijs = require('urijs');
var defaults = require('lodash/defaults');
var forEach = require('lodash/forEach');
var find = require('lodash/find');
var startsWith = require('lodash/startsWith');
var sample = require('lodash/sample');
var range = require('lodash/range');
var isPrivate = require('sync-is-private-host').isPrivate;

var TinyPictures = function () {
    function TinyPictures(options) {
        var _this = this;

        _classCallCheck(this, TinyPictures);

        this._options = defaults({}, options, {
            window: null,
            user: null,
            namedSources: [],
            overrideSourcesImages: [],
            overrideSourcesAlways: false,
            customSubdomain: true,
            protocol: 'https',
            defaultBaseUrl: '',
            srcsetWidths: [50, 75, 100, 120, 180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 1944, 2160, 2376, 2592, 2808, 3024]
        });
        this._options.lazySizesConfig = defaults({}, options && options.lazySizesConfig ? options.lazySizesConfig : {}, {
            lazyClass: 'tp-lazyload',
            preloadClass: 'tp-lazypreload',
            loadingClass: 'tp-lazyloading',
            loadedClass: 'tp-lazyloaded',
            sizesAttr: 'data-tp-sizes',
            loadMode: 3,
            init: false
        });
        this._options.lazySizesConfig.rias = defaults({}, options && options.lazySizesConfig && options.lazySizesConfig.rias ? options.lazySizesConfig.rias : {}, {
            srcAttr: 'data-tp-srcset',
            widths: this._options.srcsetWidths
        });

        // plausibility checks
        if (!this._options.user) {
            throw 'no user set';
        }

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
                        this._overrideSourcesImages = range(1, 11).map(function (number) {
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
                this._apiBaseUrlObject = urijs.parse(this._options.customSubdomain + this._options.user + '/');
                break;
        }

        // lazySizes
        if (typeof window !== 'undefined') {
            var lazySizesBackup = window.lazySizes;
            var lazySizesConfigBackup = window.lazySizesConfig;
            window.lazySizesConfig = this._options.lazySizesConfig;
            this._lazySizesRias = require('lazysizes/plugins/rias/ls.rias.js');
            this._lazySizes = require('lazysizes');
            window.lazySizes = lazySizesBackup;
            window.lazySizesConfig = lazySizesConfigBackup;

            this._options.window.document.addEventListener('lazyriasmodifyoptions', function (event) {
                event.detail.width = _this.url(event.target.getAttribute('data-tp-src'), _this._mergedOptions(event.target, { width: '{width}' }));
            });
            this._options.window.document.addEventListener('lazybeforeunveil', function (event) {
                event.target.setAttribute('data-src', _this.url(event.target.getAttribute('data-tp-src'), _this._mergedOptions(event.target)));
                if (event.target.getAttribute('data-tp-srcset') === '{width}') {
                    event.target.setAttribute('data-srcset', _this.srcsetArray(event.target.getAttribute('data-tp-src'), _this._mergedOptions(event.target)).join(', '));
                }
            });
        }
    }

    _createClass(TinyPictures, [{
        key: '_mergedOptions',
        value: function _mergedOptions(img, overrideOptions) {
            var optionsString = img.getAttribute('data-tp-options');
            var options = optionsString ? JSON.parse(optionsString) : {};
            return Object.assign({}, options, overrideOptions);
        }
    }, {
        key: 'baseUrl',
        value: function baseUrl() {
            if (this._options.defaultBaseUrl) {
                return this._options.defaultBaseUrl;
            } else if (this._options.window && this._options.window.location && this._options.window.location.href) {
                return this._options.window.location.href;
            } else {
                return '';
            }
        }
    }, {
        key: 'url',
        value: function url() {
            var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var baseUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.baseUrl();

            if (!source) {
                return null;
            }

            var baseUrlObject = baseUrl ? urijs(baseUrl).normalize() : null;
            if (source.indexOf('//') === 0 && baseUrlObject) {
                source = baseUrlObject.protocol() + ':' + source;
            }
            var sourceObject = urijs(source).normalize();
            if ((!sourceObject.protocol() || !sourceObject.hostname()) && baseUrl) {
                sourceObject = sourceObject.absoluteTo(baseUrl);
            }
            if (!sourceObject.protocol() || !sourceObject.hostname()) {
                throw new Error('source does not have a protocol or hostname');
            }

            // override sources
            if (this._overrideSourcesImages.length && (this._options.overrideSourcesAlways || isPrivate(sourceObject.hostname()))) {
                sourceObject = urijs(sample(this._overrideSourcesImages));
            }

            // use named sources if present
            var sourceUrl = sourceObject.toString();
            var namedSource = find(this._options.namedSources, function (namedSource) {
                return startsWith(sourceUrl, namedSource.url);
            });
            var urlObjectParams = Object.assign({}, this._apiBaseUrlObject);
            if (namedSource) {
                urlObjectParams.path = urijs.joinPaths(urlObjectParams.path, namedSource.name, sourceUrl.replace(namedSource.url, ''));
            }

            // build urlObject
            var urlObject = urijs(urlObjectParams).normalize();
            forEach(options, function (val, key) {
                urlObject.addQuery(key, val);
            });
            if (!namedSource) {
                urlObject.addQuery('source', sourceUrl);
            }

            return urlObject.toString().replace(/%7Bwidth%7D/gi, '{width}');
        }
    }, {
        key: 'srcsetArray',
        value: function srcsetArray(originalSrc, options) {
            var _this2 = this;

            var srcsetArray = [];
            forEach(this._options.srcsetWidths, function (width) {
                srcsetArray.push(_this2.url(originalSrc, Object.assign({}, options, { width: width })) + ' ' + width + 'w');
            });
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
            forEach(attributes, function (val, key) {
                img += ' ' + key + '="' + val + '"';
            });
            img += '>';
            return img;
        }
    }, {
        key: 'unveil',
        value: function unveil(img) {
            var _this3 = this;

            var convertToPictureElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (convertToPictureElement && img.getAttribute('data-tp-srcset')) {
                // wrap
                var document = this._options.window.document;
                var picture = document.createElement('picture');
                img.parentNode.insertBefore(picture, img);
                img.parentNode.removeChild(img);
                picture.appendChild(img);
                // add source elements
                var ie9Start = document.createComment('[if IE 9]><video style="display: none"><![endif]');
                var ie9End = document.createComment('[if IE 9]></video><![endif]');
                picture.insertBefore(ie9Start, img);
                var webpSource = document.createElement('source');
                webpSource.setAttribute('type', 'image/webp');
                var source = document.createElement('source');
                var dataAttributes = ['tp-src', 'tp-srcset', 'tp-sizes', 'srcattr', 'widths', 'widthmap', 'modifyoptions', 'absurl', 'prefix', 'postfix'];
                var elements = [webpSource, source];
                elements.forEach(function (element, index) {
                    dataAttributes.forEach(function (dataAttribute) {
                        var value = img.getAttribute('data-' + dataAttribute);
                        if (value) {
                            element.setAttribute('data-' + dataAttribute, value);
                        }
                    });
                    var overrideOptions = index === 0 ? { format: 'webp' } : {};
                    element.setAttribute('data-tp-options', JSON.stringify(_this3._mergedOptions(img, overrideOptions)));
                    _this3._lazySizes.loader.unveil(element);
                    picture.insertBefore(element, img);
                });
                picture.insertBefore(ie9End, img);
            }
            return this._lazySizes.loader.unveil(img);
        }
    }, {
        key: 'unveilAll',
        value: function unveilAll(convertToPictureElement) {
            var document = this._options.window.document;
            var list = document.getElementsByTagName('img');
            for (var i = 0; i < list.length; i++) {
                this.unveil(list[i], convertToPictureElement);
            }
        }
    }, {
        key: 'lazyload',
        value: function lazyload() {
            this._lazySizes.init();
        }
    }, {
        key: 'registerAngularJsModule',
        value: function registerAngularJsModule(angular) {
            var _this4 = this;

            angular.module('tiny.pictures', []).filter('tinyPicturesUrl', function () {
                return _this4.url.bind(_this4);
            });
        }
    }, {
        key: 'registerJQueryPlugin',
        value: function registerJQueryPlugin(jQuery) {
            var self = this;
            jQuery.fn.tinyPictures = function () {
                this.filter('img').each(function () {
                    return self.unveil(this);
                });
                return this;
            };
        }
    }]);

    return TinyPictures;
}();

module.exports = TinyPictures;
