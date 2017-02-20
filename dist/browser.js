'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Browser = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ("value" in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};

var _vanillaLazyload = require('vanilla-lazyload');

var _vanillaLazyload2 = _interopRequireDefault(_vanillaLazyload);

var _universal = require('./universal');

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var Browser = exports.Browser = function (_Universal) {
    _inherits(Browser, _Universal);

    function Browser() {
        _classCallCheck(this, Browser);

        return _possibleConstructorReturn(this, (Browser.__proto__ || Object.getPrototypeOf(Browser)).apply(this, arguments));
    }

    _createClass(Browser, [{
        key: 'url',
        value: function url() {
            var _get2;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            args[3] = args[3] ? args[3] : (typeof location === 'undefined' ? 'undefined' : _typeof(location)) === 'object' ? location.href : null;
            return (_get2 = _get(Browser.prototype.__proto__ || Object.getPrototypeOf(Browser.prototype), 'url', this)).call.apply(_get2, [this].concat(args));
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
            var _this2 = this;

            angular.module('tiny.pictures', []).filter('tinyPicturesUrl', function () {
                return _this2.url;
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

    return Browser;
}(_universal.Universal);
