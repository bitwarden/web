(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.braintree || (g.braintree = {})).dropin = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
'use strict';

module.exports = function isAndroid(ua) {
  ua = ua || global.navigator.userAgent;
  return /Android/.test(ua);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
'use strict';

var isEdge = require('./is-edge');
var isSamsung = require('./is-samsung');

module.exports = function isChrome(ua) {
  ua = ua || navigator.userAgent;
  return (ua.indexOf('Chrome') !== -1 || ua.indexOf('CriOS') !== -1) && !isEdge(ua) && !isSamsung(ua);
};

},{"./is-edge":3,"./is-samsung":13}],3:[function(require,module,exports){
'use strict';

module.exports = function isEdge(ua) {
  ua = ua || navigator.userAgent;
  return ua.indexOf('Edge/') !== -1;
};

},{}],4:[function(require,module,exports){
(function (global){
'use strict';

var isIE11 = require('./is-ie11');

module.exports = function isIE(ua) {
  ua = ua || global.navigator.userAgent;
  return ua.indexOf('MSIE') !== -1 || isIE11(ua);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-ie11":6}],5:[function(require,module,exports){
'use strict';

module.exports = function isIe10(ua) {
  ua = ua || navigator.userAgent;
  return ua.indexOf('MSIE 10') !== -1;
};

},{}],6:[function(require,module,exports){
'use strict';

module.exports = function isIe11(ua) {
  ua = ua || navigator.userAgent;
  return ua.indexOf('Trident/7') !== -1;
};

},{}],7:[function(require,module,exports){
'use strict';

module.exports = function isIe9(ua) {
  ua = ua || navigator.userAgent;
  return ua.indexOf('MSIE 9') !== -1;
};

},{}],8:[function(require,module,exports){
(function (global){
'use strict';

module.exports = function isIosFirefox(ua) {
  ua = ua || global.navigator.userAgent;
  return /FxiOS/i.test(ua);
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
'use strict';

var isIos = require('./is-ios');
var webkitRegexp = /webkit/i;

function isWebkit(ua) {
  return ua.match(webkitRegexp);
}

module.exports = function isIosSafari(ua) {
  ua = ua || navigator.userAgent;

  return isIos(ua) && isWebkit(ua) && ua.indexOf('CriOS') === -1;
};

},{"./is-ios":11}],10:[function(require,module,exports){
(function (global){
'use strict';

var isIos = require('./is-ios');

// The Google Search iOS app is technically a webview and doesn't support popups.
function isGoogleSearchApp(ua) {
  return /\bGSA\b/.test(ua);
}

module.exports = function isIosWebview(ua) {
  ua = ua || global.navigator.userAgent;
  if (isIos(ua)) {
    if (isGoogleSearchApp(ua)) {
      return true;
    }
    return /.+AppleWebKit(?!.*Safari)/.test(ua);
  }
  return false;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-ios":11}],11:[function(require,module,exports){
(function (global){
'use strict';

module.exports = function isIos(ua) {
  ua = ua || global.navigator.userAgent;
  return /iPhone|iPod|iPad/i.test(ua);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
'use strict';

var isIosFirefox = require('./is-ios-firefox');

module.exports = function isMobileFirefox(ua) {
  ua = ua || global.navigator.userAgent;
  return isIosFirefox(ua) || /iPhone|iPod|iPad|Mobile|Tablet/i.test(ua) && /Firefox/i.test(ua);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-ios-firefox":8}],13:[function(require,module,exports){
(function (global){
'use strict';

module.exports = function isSamsungBrowser(ua) {
  ua = ua || global.navigator.userAgent;
  return /SamsungBrowser/i.test(ua);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(require,module,exports){
'use strict';

var setAttributes = require('./lib/set-attributes');
var defaultAttributes = require('./lib/default-attributes');
var assign = require('./lib/assign');

module.exports = function createFrame(options) {
  var iframe = document.createElement('iframe');
  var config = assign({}, defaultAttributes, options);

  if (config.style && typeof config.style !== 'string') {
    assign(iframe.style, config.style);
    delete config.style;
  }

  setAttributes(iframe, config);

  if (!iframe.getAttribute('id')) {
    iframe.id = iframe.name;
  }

  return iframe;
};

},{"./lib/assign":15,"./lib/default-attributes":16,"./lib/set-attributes":17}],15:[function(require,module,exports){
'use strict';

module.exports = function assign(target) {
  var objs = Array.prototype.slice.call(arguments, 1);

  objs.forEach(function (obj) {
    if (typeof obj !== 'object') { return; }

    Object.keys(obj).forEach(function (key) {
      target[key] = obj[key];
    });
  });

  return target;
}

},{}],16:[function(require,module,exports){
'use strict';

module.exports = {
  src: 'about:blank',
  frameBorder: 0,
  allowtransparency: true,
  scrolling: 'no'
};

},{}],17:[function(require,module,exports){
'use strict';

module.exports = function setAttributes(element, attributes) {
  var value;

  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      value = attributes[key];

      if (value == null) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, value);
      }
    }
  }
};

},{}],18:[function(require,module,exports){
'use strict';

function deferred(fn) {
  return function () {
    // IE9 doesn't support passing arguments to setTimeout so we have to emulate it.
    var args = arguments;

    setTimeout(function () {
      fn.apply(null, args);
    }, 1);
  };
}

module.exports = deferred;

},{}],19:[function(require,module,exports){
'use strict';

function once(fn) {
  var called = false;

  return function () {
    if (!called) {
      called = true;
      fn.apply(null, arguments);
    }
  };
}

module.exports = once;

},{}],20:[function(require,module,exports){
'use strict';

function promiseOrCallback(promise, callback) { // eslint-disable-line consistent-return
  if (callback) {
    promise
      .then(function (data) {
        callback(null, data);
      })
      .catch(function (err) {
        callback(err);
      });
  } else {
    return promise;
  }
}

module.exports = promiseOrCallback;

},{}],21:[function(require,module,exports){
'use strict';

var deferred = require('./lib/deferred');
var once = require('./lib/once');
var promiseOrCallback = require('./lib/promise-or-callback');

function wrapPromise(fn) {
  return function () {
    var callback;
    var args = Array.prototype.slice.call(arguments);
    var lastArg = args[args.length - 1];

    if (typeof lastArg === 'function') {
      callback = args.pop();
      callback = once(deferred(callback));
    }
    return promiseOrCallback(fn.apply(this, args), callback); // eslint-disable-line no-invalid-this
  };
}

wrapPromise.wrapPrototype = function (target, options) {
  var methods, ignoreMethods, includePrivateMethods;

  options = options || {};
  ignoreMethods = options.ignoreMethods || [];
  includePrivateMethods = options.transformPrivateMethods === true;

  methods = Object.getOwnPropertyNames(target.prototype).filter(function (method) {
    var isNotPrivateMethod;
    var isNonConstructorFunction = method !== 'constructor' &&
      typeof target.prototype[method] === 'function';
    var isNotAnIgnoredMethod = ignoreMethods.indexOf(method) === -1;

    if (includePrivateMethods) {
      isNotPrivateMethod = true;
    } else {
      isNotPrivateMethod = method.charAt(0) !== '_';
    }

    return isNonConstructorFunction &&
      isNotPrivateMethod &&
      isNotAnIgnoredMethod;
  });

  methods.forEach(function (method) {
    var original = target.prototype[method];

    target.prototype[method] = wrapPromise(original);
  });

  return target;
};

module.exports = wrapPromise;

},{"./lib/deferred":18,"./lib/once":19,"./lib/promise-or-callback":20}],22:[function(require,module,exports){
(function (global){
'use strict';

var BraintreeError = require('../lib/braintree-error');
var analytics = require('../lib/analytics');
var errors = require('./errors');
var Promise = require('../lib/promise');
var methods = require('../lib/methods');
var convertMethodsToError = require('../lib/convert-methods-to-error');
var wrapPromise = require('@braintree/wrap-promise');

/**
 * @typedef {object} ApplePay~tokenizePayload
 * @property {string} nonce The payment method nonce.
 * @property {object} details Additional details.
 * @property {string} details.cardType Type of card, ex: Visa, MasterCard.
 * @property {string} details.cardHolderName The name of the card holder.
 * @property {string} details.dpanLastTwo Last two digits of card number.
 * @property {string} description A human-readable description.
 * @property {string} type The payment method type, always `ApplePayCard`.
 * @property {object} binData Information about the card based on the bin.
 * @property {string} binData.commercial Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.countryOfIssuance The country of issuance.
 * @property {string} binData.debit Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.durbinRegulated Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.healthcare Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.issuingBank The issuing bank.
 * @property {string} binData.payroll Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.prepaid Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.productId The product id.
 */

/**
 * An Apple Pay Payment Authorization Event object.
 * @typedef {object} ApplePayPaymentAuthorizedEvent
 * @external ApplePayPaymentAuthorizedEvent
 * @see {@link https://developer.apple.com/reference/applepayjs/applepaypaymentauthorizedevent ApplePayPaymentAuthorizedEvent}
 */

/**
 * An Apple Pay Payment Request object.
 * @typedef {object} ApplePayPaymentRequest
 * @external ApplePayPaymentRequest
 * @see {@link https://developer.apple.com/reference/applepayjs/1916082-applepay_js_data_types/paymentrequest PaymentRequest}
 */

/**
 * @class
 * @param {object} options Options
 * @description <strong>You cannot use this constructor directly. Use {@link module:braintree-web/apple-pay.create|braintree.applePay.create} instead.</strong>
 * @classdesc This class represents an Apple Pay component. Instances of this class have methods for validating the merchant server and tokenizing payments.
 */
function ApplePay(options) {
  this._client = options.client;
  /**
   * @name ApplePay#merchantIdentifier
   * @description A special merchant ID which represents the merchant association with Braintree. Required when using `ApplePaySession.canMakePaymentsWithActiveCard`.
   * @example
   * var promise = ApplePaySession.canMakePaymentsWithActiveCard(applePayInstance.merchantIdentifier);
   * promise.then(function (canMakePaymentsWithActiveCard) {
   *   if (canMakePaymentsWithActiveCard) {
   *     // Set up Apple Pay buttons
   *   }
   * });
   */
  Object.defineProperty(this, 'merchantIdentifier', {
    value: this._client.getConfiguration().gatewayConfiguration.applePayWeb.merchantIdentifier,
    configurable: false,
    writable: false
  });
}

/**
 * Merges a payment request with Braintree defaults to return an {external:ApplePayPaymentRequest}.
 *
 * The following properties are assigned to `paymentRequest` if not already defined. Their default values come from the Braintree gateway.
 * - `countryCode`
 * - `currencyCode`
 * - `merchantCapabilities`
 * - `supportedNetworks`
 * @public
 * @param {external:ApplePayPaymentRequest} paymentRequest The payment request details to apply on top of those from Braintree.
 * @returns {external:ApplePayPaymentRequest} The decorated `paymentRequest` object.
 * @example
 * var applePay = require('braintree-web/apple-pay');
 *
 * applePay.create({client: clientInstance}, function (applePayErr, applePayInstance) {
 *   if (applePayErr) {
 *     // Handle error here
 *     return;
 *   }
 *
 *   var paymentRequest = applePayInstance.createPaymentRequest({
 *     total: {
 *       label: 'My Company',
 *       amount: '19.99'
 *     }
 *   });
 *
 *   var session = new ApplePaySession(2, paymentRequest);
 *
 *   // ...
 */
ApplePay.prototype.createPaymentRequest = function (paymentRequest) {
  var applePay = this._client.getConfiguration().gatewayConfiguration.applePayWeb;
  var defaults = {
    countryCode: applePay.countryCode,
    currencyCode: applePay.currencyCode,
    merchantCapabilities: applePay.merchantCapabilities || ['supports3DS'],
    supportedNetworks: applePay.supportedNetworks.map(function (network) {
      return network === 'mastercard' ? 'masterCard' : network;
    })
  };

  return Object.assign({}, defaults, paymentRequest);
};

/**
 * Validates your merchant website, as required by `ApplePaySession` before payment can be authorized.
 * @public
 * @param {object} options Options
 * @param {string} options.validationURL The validationURL fram an `ApplePayValidateMerchantEvent`.
 * @param {string} options.displayName The canonical name for your store. Use a non-localized name. This parameter should be a UTF-8 string that is a maximum of 128 characters. The system may display this name to the user.
 * @param {callback} [callback] The second argument, <code>data</code>, is the Apple Pay merchant session object. If no callback is provided, `performValidation` returns a promise.
 * Pass the merchant session to your Apple Pay session's `completeMerchantValidation` method.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * var applePay = require('braintree-web/apple-pay');
 *
 * applePay.create({client: clientInstance}, function (applePayErr, applePayInstance) {
 *   if (applePayErr) {
 *     // Handle error here
 *     return;
 *   }
 *
 *   var paymentRequest = applePayInstance.createPaymentRequest({
 *     total: {
 *       label: 'My Company',
 *       amount: '19.99'
 *     }
 *   });
 *   var session = new ApplePaySession(2, paymentRequest);
 *
 *   session.onvalidatemerchant = function (event) {
 *     applePayInstance.performValidation({
 *       validationURL: event.validationURL,
 *       displayName: 'My Great Store'
 *     }, function (validationErr, validationData) {
 *       if (validationErr) {
 *         console.error(validationErr);
 *         session.abort();
 *         return;
 *       }
 *
 *       session.completeMerchantValidation(validationData);
 *     });
 *   };
 * });
 */
ApplePay.prototype.performValidation = function (options) {
  var applePayWebSession;
  var self = this;

  if (!options || !options.validationURL) {
    return Promise.reject(new BraintreeError(errors.APPLE_PAY_VALIDATION_URL_REQUIRED));
  }

  applePayWebSession = {
    validationUrl: options.validationURL,
    domainName: options.domainName || global.location.hostname,
    merchantIdentifier: options.merchantIdentifier || this.merchantIdentifier
  };

  if (options.displayName != null) {
    applePayWebSession.displayName = options.displayName;
  }

  return this._client.request({
    method: 'post',
    endpoint: 'apple_pay_web/sessions',
    data: {
      _meta: {source: 'apple-pay'},
      applePayWebSession: applePayWebSession
    }
  }).then(function (response) {
    analytics.sendEvent(self._client, 'applepay.performValidation.succeeded');

    return Promise.resolve(response);
  }).catch(function (err) {
    analytics.sendEvent(self._client, 'applepay.performValidation.failed');

    if (err.code === 'CLIENT_REQUEST_ERROR') {
      return Promise.reject(new BraintreeError({
        type: errors.APPLE_PAY_MERCHANT_VALIDATION_FAILED.type,
        code: errors.APPLE_PAY_MERCHANT_VALIDATION_FAILED.code,
        message: errors.APPLE_PAY_MERCHANT_VALIDATION_FAILED.message,
        details: {
          originalError: err.details.originalError
        }
      }));
    }

    return Promise.reject(new BraintreeError({
      type: errors.APPLE_PAY_MERCHANT_VALIDATION_NETWORK.type,
      code: errors.APPLE_PAY_MERCHANT_VALIDATION_NETWORK.code,
      message: errors.APPLE_PAY_MERCHANT_VALIDATION_NETWORK.message,
      details: {
        originalError: err
      }
    }));
  });
};

/**
 * Tokenizes an Apple Pay payment. This will likely be called in your `ApplePaySession`'s `onpaymentauthorized` callback.
 * @public
 * @param {object} options Options
 * @param {object} options.token The `payment.token` property of an {@link external:ApplePayPaymentAuthorizedEvent}.
 * @param {callback} [callback] The second argument, <code>data</code>, is a {@link ApplePay~tokenizePayload|tokenizePayload}. If no callback is provided, `tokenize` returns a promise that resolves with a {@link ApplePay~tokenizePayload|tokenizePayload}.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * var applePay = require('braintree-web/apple-pay');
 *
 * applePay.create({client: clientInstance}, function (applePayErr, applePayInstance) {
 *   if (applePayErr) {
 *     // Handle error here
 *     return;
 *   }
 *
 *   var paymentRequest = applePayInstance.createPaymentRequest({
 *     total: {
 *       label: 'My Company',
 *       amount: '19.99'
 *     }
 *   });
 *   var session = new ApplePaySession(2, paymentRequest);
 *
 *   session.onpaymentauthorized = function (event) {
 *     applePayInstance.tokenize({
 *       token: event.payment.token
 *     }, function (tokenizeErr, tokenizedPayload) {
 *       if (tokenizeErr) {
 *         session.completePayment(ApplePaySession.STATUS_FAILURE);
 *         return;
 *       }
 *       session.completePayment(ApplePaySession.STATUS_SUCCESS);
 *
 *       // Send the tokenizedPayload to your server here!
 *     });
 *   };
 *
 *   // ...
 * });
 */
ApplePay.prototype.tokenize = function (options) {
  var self = this;

  if (!options.token) {
    return Promise.reject(new BraintreeError(errors.APPLE_PAY_PAYMENT_TOKEN_REQUIRED));
  }

  return this._client.request({
    method: 'post',
    endpoint: 'payment_methods/apple_payment_tokens',
    data: {
      _meta: {
        source: 'apple-pay'
      },
      applePaymentToken: Object.assign({}, options.token, {
        // The gateway requires this key to be base64-encoded.
        paymentData: btoa(JSON.stringify(options.token.paymentData))
      })
    }
  }).then(function (response) {
    analytics.sendEvent(self._client, 'applepay.tokenize.succeeded');

    return Promise.resolve(response.applePayCards[0]);
  }).catch(function (err) {
    analytics.sendEvent(self._client, 'applepay.tokenize.failed');

    return Promise.reject(new BraintreeError({
      type: errors.APPLE_PAY_TOKENIZATION.type,
      code: errors.APPLE_PAY_TOKENIZATION.code,
      message: errors.APPLE_PAY_TOKENIZATION.message,
      details: {
        originalError: err
      }
    }));
  });
};

/**
 * Cleanly tear down anything set up by {@link module:braintree-web/apple-pay.create|create}.
 * @public
 * @param {callback} [callback] Called once teardown is complete. No data is returned if teardown completes successfully.
 * @example
 * applePayInstance.teardown();
 * @example <caption>With callback</caption>
 * applePayInstance.teardown(function () {
 *   // teardown is complete
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
ApplePay.prototype.teardown = function () {
  convertMethodsToError(this, methods(ApplePay.prototype));

  return Promise.resolve();
};

module.exports = wrapPromise.wrapPrototype(ApplePay);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../lib/analytics":62,"../lib/braintree-error":66,"../lib/convert-methods-to-error":72,"../lib/methods":85,"../lib/promise":87,"./errors":23,"@braintree/wrap-promise":21}],23:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Apple Pay - Creation Error Codes
 * @description Errors that occur when [creating the Apple Pay component](/current/module-braintree-web_apple-pay.html#.create).
 * @property {MERCHANT} APPLE_PAY_NOT_ENABLED Occurs when the authorization used is not authorized to process Apple Pay.
 */

/**
 * @name BraintreeError.Apple Pay - performValidation Error Codes
 * @description Errors that occur when [validating](/current/ApplePay.html#performValidation).
 * @property {MERCHANT} APPLE_PAY_VALIDATION_URL_REQUIRED Occurs when the `validationURL` option is not passed in.
 * @property {MERCHANT} APPLE_PAY_MERCHANT_VALIDATION_FAILED Occurs when the website domain has not been registered in the Braintree control panel.
 * @property {NETWORK} APPLE_PAY_MERCHANT_VALIDATION_NETWORK Occurs when an unknown network error occurs.
 */

/**
 * @name BraintreeError.Apple Pay - tokenize Error Codes
 * @description Errors that occur when [tokenizing](/current/ApplePay.html#tokenize).
 * @property {MERCHANT} APPLE_PAY_PAYMENT_TOKEN_REQUIRED Occurs when the `token` option is not passed in.
 * @property {NETWORK} APPLE_PAY_TOKENIZATION Occurs when an unknown network error occurs.
 */

var BraintreeError = require('../lib/braintree-error');

module.exports = {
  APPLE_PAY_NOT_ENABLED: {
    type: BraintreeError.types.MERCHANT,
    code: 'APPLE_PAY_NOT_ENABLED',
    message: 'Apple Pay is not enabled for this merchant.'
  },
  APPLE_PAY_VALIDATION_URL_REQUIRED: {
    type: BraintreeError.types.MERCHANT,
    code: 'APPLE_PAY_VALIDATION_URL_REQUIRED',
    message: 'performValidation must be called with a validationURL.'
  },
  APPLE_PAY_MERCHANT_VALIDATION_NETWORK: {
    type: BraintreeError.types.NETWORK,
    code: 'APPLE_PAY_MERCHANT_VALIDATION_NETWORK',
    message: 'A network error occurred when validating the Apple Pay merchant.'
  },
  APPLE_PAY_MERCHANT_VALIDATION_FAILED: {
    type: BraintreeError.types.MERCHANT,
    code: 'APPLE_PAY_MERCHANT_VALIDATION_FAILED',
    message: 'Make sure you have registered your domain name in the Braintree Control Panel.'
  },
  APPLE_PAY_PAYMENT_TOKEN_REQUIRED: {
    type: BraintreeError.types.MERCHANT,
    code: 'APPLE_PAY_PAYMENT_TOKEN_REQUIRED',
    message: 'tokenize must be called with a payment token.'
  },
  APPLE_PAY_TOKENIZATION: {
    type: BraintreeError.types.NETWORK,
    code: 'APPLE_PAY_TOKENIZATION',
    message: 'A network error occurred when processing the Apple Pay payment.'
  }
};

},{"../lib/braintree-error":66}],24:[function(require,module,exports){
'use strict';

/**
 * @module braintree-web/apple-pay
 * @description Accept Apple Pay on the Web. *This component is currently in beta and is subject to change.*
 */

var BraintreeError = require('../lib/braintree-error');
var ApplePay = require('./apple-pay');
var analytics = require('../lib/analytics');
var basicComponentVerification = require('../lib/basic-component-verification');
var errors = require('./errors');
var VERSION = "3.37.0";
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');

/**
 * @static
 * @function create
 * @param {object} options Creation options:
 * @param {Client} options.client A {@link Client} instance.
 * @param {callback} [callback] The second argument, `data`, is the {@link ApplePay} instance. If no callback is provided, `create` returns a promise that resolves with the {@link ApplePay} instance.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
function create(options) {
  return basicComponentVerification.verify({
    name: 'Apple Pay',
    client: options.client
  }).then(function () {
    if (!options.client.getConfiguration().gatewayConfiguration.applePayWeb) {
      return Promise.reject(new BraintreeError(errors.APPLE_PAY_NOT_ENABLED));
    }

    analytics.sendEvent(options.client, 'applepay.initialized');

    return new ApplePay(options);
  });
}

module.exports = {
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/analytics":62,"../lib/basic-component-verification":64,"../lib/braintree-error":66,"../lib/promise":87,"./apple-pay":22,"./errors":23,"@braintree/wrap-promise":21}],25:[function(require,module,exports){
'use strict';

var isIe = require('@braintree/browser-detection/is-ie');
var isIe9 = require('@braintree/browser-detection/is-ie9');

module.exports = {
  isIe: isIe,
  isIe9: isIe9
};

},{"@braintree/browser-detection/is-ie":4,"@braintree/browser-detection/is-ie9":7}],26:[function(require,module,exports){
'use strict';

var BRAINTREE_VERSION = require('./constants').BRAINTREE_VERSION;

var GraphQL = require('./request/graphql');
var request = require('./request');
var isVerifiedDomain = require('../lib/is-verified-domain');
var BraintreeError = require('../lib/braintree-error');
var convertToBraintreeError = require('../lib/convert-to-braintree-error');
var createAuthorizationData = require('../lib/create-authorization-data');
var addMetadata = require('../lib/add-metadata');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var once = require('../lib/once');
var deferred = require('../lib/deferred');
var assign = require('../lib/assign').assign;
var analytics = require('../lib/analytics');
var constants = require('./constants');
var errors = require('./errors');
var sharedErrors = require('../lib/errors');
var VERSION = require('../lib/constants').VERSION;
var GRAPHQL_URLS = require('../lib/constants').GRAPHQL_URLS;
var methods = require('../lib/methods');
var convertMethodsToError = require('../lib/convert-methods-to-error');

/**
 * This object is returned by {@link Client#getConfiguration|getConfiguration}. This information is used extensively by other Braintree modules to properly configure themselves.
 * @typedef {object} Client~configuration
 * @property {object} client The braintree-web/client parameters.
 * @property {string} client.authorization A tokenizationKey or clientToken.
 * @property {object} gatewayConfiguration Gateway-supplied configuration.
 * @property {object} analyticsMetadata Analytics-specific data.
 * @property {string} analyticsMetadata.sessionId Uniquely identifies a browsing session.
 * @property {string} analyticsMetadata.sdkVersion The braintree.js version.
 * @property {string} analyticsMetadata.merchantAppId Identifies the merchant's web app.
 */

/**
 * @class
 * @param {Client~configuration} configuration Options
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web/client.create|braintree.client.create} instead.</strong>
 * @classdesc This class is required by many other Braintree components. It serves as the base API layer that communicates with our servers. It is also capable of being used to formulate direct calls to our servers, such as direct credit card tokenization. See {@link Client#request}.
 */
function Client(configuration) {
  var configurationJSON, gatewayConfiguration, braintreeApiConfiguration;

  configuration = configuration || {};

  configurationJSON = JSON.stringify(configuration);
  gatewayConfiguration = configuration.gatewayConfiguration;

  if (!gatewayConfiguration) {
    throw new BraintreeError(errors.CLIENT_MISSING_GATEWAY_CONFIGURATION);
  }

  [
    'assetsUrl',
    'clientApiUrl',
    'configUrl'
  ].forEach(function (property) {
    if (property in gatewayConfiguration && !isVerifiedDomain(gatewayConfiguration[property])) {
      throw new BraintreeError({
        type: errors.CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN.type,
        code: errors.CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN.code,
        message: property + ' property is on an invalid domain.'
      });
    }
  });

  /**
   * Returns a copy of the configuration values.
   * @public
   * @returns {Client~configuration} configuration
   */
  this.getConfiguration = function () {
    return JSON.parse(configurationJSON);
  };

  this._activeCache = true;
  this._request = request;
  this._configuration = this.getConfiguration();

  this._clientApiBaseUrl = gatewayConfiguration.clientApiUrl + '/v1/';

  braintreeApiConfiguration = gatewayConfiguration.braintreeApi;
  if (braintreeApiConfiguration) {
    this._braintreeApi = {
      baseUrl: braintreeApiConfiguration.url + '/',
      accessToken: braintreeApiConfiguration.accessToken
    };

    if (!isVerifiedDomain(this._braintreeApi.baseUrl)) {
      throw new BraintreeError({
        type: errors.CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN.type,
        code: errors.CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN.code,
        message: 'braintreeApi URL is on an invalid domain.'
      });
    }
  }

  if (gatewayConfiguration.graphQL) {
    this._graphQL = new GraphQL({
      graphQL: gatewayConfiguration.graphQL
    });
  }
}

/**
 * Used by other modules to formulate all network requests to the Braintree gateway. It is also capable of being used directly from your own form to tokenize credit card information. However, be sure to satisfy PCI compliance if you use direct card tokenization.
 * @public
 * @param {object} options Request options:
 * @param {string} options.method HTTP method, e.g. "get" or "post".
 * @param {string} options.endpoint Endpoint path, e.g. "payment_methods".
 * @param {object} options.data Data to send with the request.
 * @param {number} [options.timeout=60000] Set a timeout (in milliseconds) for the request.
 * @param {callback} [callback] The second argument, <code>data</code>, is the returned server data.
 * @example
 * <caption>Direct Credit Card Tokenization</caption>
 * var createClient = require('braintree-web/client').create;
 *
 * createClient({
 *   authorization: CLIENT_AUTHORIZATION
 * }, function (createErr, clientInstance) {
 *   var form = document.getElementById('my-form-id');
 *   var data = {
 *     creditCard: {
 *       number: form['cc-number'].value,
 *       cvv: form['cc-cvv'].value,
 *       expirationDate: form['cc-expiration-date'].value,
 *       billingAddress: {
 *         postalCode: form['cc-postal-code'].value
 *       },
 *       options: {
 *         validate: false
 *       }
 *     }
 *   };
 *
 *   // Warning: For a merchant to be eligible for the easiest level of PCI compliance (SAQ A),
 *   // payment fields cannot be hosted on your checkout page.
 *   // For an alternative to the following, use Hosted Fields.
 *   clientInstance.request({
 *     endpoint: 'payment_methods/credit_cards',
 *     method: 'post',
 *     data: data
 *   }, function (requestErr, response) {
 *     // More detailed example of handling API errors: https://codepen.io/braintree/pen/MbwjdM
 *     if (requestErr) { throw new Error(requestErr); }
 *
 *     console.log('Got nonce:', response.creditCards[0].nonce);
 *   });
 * });
 * @example
 * <caption>Tokenizing Fields for AVS Checks</caption>
 * var createClient = require('braintree-web/client').create;
 *
 * createClient({
 *   authorization: CLIENT_AUTHORIZATION
 * }, function (createErr, clientInstance) {
 *   var form = document.getElementById('my-form-id');
 *   var data = {
 *     creditCard: {
 *       number: form['cc-number'].value,
 *       cvv: form['cc-cvv'].value,
 *       expirationDate: form['cc-date'].value,
 *       // The billing address can be checked with AVS rules.
 *       // See: https://articles.braintreepayments.com/support/guides/fraud-tools/basic/avs-cvv-rules
 *       billingAddress: {
 *         postalCode: form['cc-postal-code'].value,
 *         streetAddress: form['cc-street-address'].value,
 *         countryName: form['cc-country-name'].value,
 *         countryCodeAlpha2: form['cc-country-alpha2'].value,
 *         countryCodeAlpha3: form['cc-country-alpha3'].value,
 *         countryCodeNumeric: form['cc-country-numeric'].value
 *       },
 *       options: {
 *         validate: false
 *       }
 *     }
 *   };
 *
 *   // Warning: For a merchant to be eligible for the easiest level of PCI compliance (SAQ A),
 *   // payment fields cannot be hosted on your checkout page.
 *   // For an alternative to the following, use Hosted Fields.
 *   clientInstance.request({
 *     endpoint: 'payment_methods/credit_cards',
 *     method: 'post',
 *     data: data
 *   }, function (requestErr, response) {
 *     // More detailed example of handling API errors: https://codepen.io/braintree/pen/MbwjdM
 *     if (requestErr) { throw new Error(requestErr); }
 *
 *     console.log('Got nonce:', response.creditCards[0].nonce);
 *   });
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
Client.prototype.request = function (options, callback) {
  var self = this; // eslint-disable-line no-invalid-this
  var requestPromise = new Promise(function (resolve, reject) {
    var optionName, api, baseUrl, requestOptions;

    if (options.api !== 'graphQLApi') {
      if (!options.method) {
        optionName = 'options.method';
      } else if (!options.endpoint) {
        optionName = 'options.endpoint';
      }
    }

    if (optionName) {
      throw new BraintreeError({
        type: errors.CLIENT_OPTION_REQUIRED.type,
        code: errors.CLIENT_OPTION_REQUIRED.code,
        message: optionName + ' is required when making a request.'
      });
    }

    if ('api' in options) {
      api = options.api;
    } else {
      api = 'clientApi';
    }

    requestOptions = {
      method: options.method,
      graphQL: self._graphQL,
      timeout: options.timeout,
      metadata: self._configuration.analyticsMetadata
    };

    if (api === 'clientApi') {
      baseUrl = self._clientApiBaseUrl;

      requestOptions.data = addMetadata(self._configuration, options.data);
    } else if (api === 'braintreeApi') {
      if (!self._braintreeApi) {
        throw new BraintreeError(sharedErrors.BRAINTREE_API_ACCESS_RESTRICTED);
      }

      baseUrl = self._braintreeApi.baseUrl;

      requestOptions.data = options.data;

      requestOptions.headers = {
        'Braintree-Version': constants.BRAINTREE_API_VERSION_HEADER,
        Authorization: 'Bearer ' + self._braintreeApi.accessToken
      };
    } else if (api === 'graphQLApi') {
      baseUrl = GRAPHQL_URLS[self._configuration.gatewayConfiguration.environment];
      options.endpoint = '';
      requestOptions.method = 'post';
      requestOptions.data = assign({
        clientSdkMetadata: {
          source: self._configuration.analyticsMetadata.source,
          integration: self._configuration.analyticsMetadata.integration,
          sessionId: self._configuration.analyticsMetadata.sessionId
        }
      }, options.data);

      requestOptions.headers = getAuthorizationHeadersForGraphQL(self._configuration.authorization);
    } else {
      throw new BraintreeError({
        type: errors.CLIENT_OPTION_INVALID.type,
        code: errors.CLIENT_OPTION_INVALID.code,
        message: 'options.api is invalid.'
      });
    }

    requestOptions.url = baseUrl + options.endpoint;
    requestOptions.sendAnalyticsEvent = function (kind) {
      analytics.sendEvent(self, kind);
    };

    self._request(requestOptions, function (err, data, status) {
      var resolvedData, requestError;

      requestError = formatRequestError(status, err);

      if (requestError) {
        reject(requestError);

        return;
      }

      if (api === 'graphQLApi' && data.errors) {
        reject(convertToBraintreeError(data.errors, {
          type: errors.CLIENT_GRAPHQL_REQUEST_ERROR.type,
          code: errors.CLIENT_GRAPHQL_REQUEST_ERROR.code,
          message: errors.CLIENT_GRAPHQL_REQUEST_ERROR.message
        }));

        return;
      }

      resolvedData = assign({_httpStatus: status}, data);

      resolve(resolvedData);
    });
  });

  if (typeof callback === 'function') {
    callback = once(deferred(callback));

    requestPromise.then(function (response) {
      callback(null, response, response._httpStatus);
    }).catch(function (err) {
      var status = err && err.details && err.details.httpStatus;

      callback(err, null, status);
    });

    return;
  }

  return requestPromise; // eslint-disable-line consistent-return
};

function formatRequestError(status, err) { // eslint-disable-line consistent-return
  var requestError;

  if (status === -1) {
    requestError = new BraintreeError(errors.CLIENT_REQUEST_TIMEOUT);
  } else if (status === 403) {
    requestError = new BraintreeError(errors.CLIENT_AUTHORIZATION_INSUFFICIENT);
  } else if (status === 429) {
    requestError = new BraintreeError(errors.CLIENT_RATE_LIMITED);
  } else if (status >= 500) {
    requestError = new BraintreeError(errors.CLIENT_GATEWAY_NETWORK);
  } else if (status < 200 || status >= 400) {
    requestError = convertToBraintreeError(err, {
      type: errors.CLIENT_REQUEST_ERROR.type,
      code: errors.CLIENT_REQUEST_ERROR.code,
      message: errors.CLIENT_REQUEST_ERROR.message
    });
  }

  if (requestError) {
    requestError.details = requestError.details || {};
    requestError.details.httpStatus = status;

    return requestError;
  }
}

Client.prototype.toJSON = function () {
  return this.getConfiguration();
};

/**
 * Returns the Client version.
 * @public
 * @returns {String} The created client's version.
 * @example
 * var createClient = require('braintree-web/client').create;
 *
 * createClient({
 *   authorization: CLIENT_AUTHORIZATION
 * }, function (createErr, clientInstance) {
 *   console.log(clientInstance.getVersion()); // Ex: 1.0.0
 * });
 * @returns {void}
 */
Client.prototype.getVersion = function () {
  return VERSION;
};

/**
 * Cleanly tear down anything set up by {@link module:braintree-web/client.create|create}.
 * @public
 * @param {callback} [callback] Called once teardown is complete. No data is returned if teardown completes successfully.
 * @example
 * clientInstance.teardown();
 * @example <caption>With callback</caption>
 * clientInstance.teardown(function () {
 *   // teardown is complete
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
Client.prototype.teardown = wrapPromise(function () {
  var self = this; // eslint-disable-line no-invalid-this

  self._activeCache = false;

  convertMethodsToError(self, methods(Client.prototype));

  return Promise.resolve();
});

function getAuthorizationHeadersForGraphQL(authorization) {
  var authAttrs = createAuthorizationData(authorization).attrs;
  var token = authAttrs.authorizationFingerprint || authAttrs.tokenizationKey;

  return {
    Authorization: 'Bearer ' + token,
    'Braintree-Version': BRAINTREE_VERSION
  };
}

module.exports = Client;

},{"../lib/add-metadata":61,"../lib/analytics":62,"../lib/assign":63,"../lib/braintree-error":66,"../lib/constants":71,"../lib/convert-methods-to-error":72,"../lib/convert-to-braintree-error":73,"../lib/create-authorization-data":74,"../lib/deferred":75,"../lib/errors":78,"../lib/is-verified-domain":83,"../lib/methods":85,"../lib/once":86,"../lib/promise":87,"./constants":27,"./errors":28,"./request":41,"./request/graphql":39,"@braintree/wrap-promise":21}],27:[function(require,module,exports){
'use strict';

module.exports = {
  BRAINTREE_API_VERSION_HEADER: '2017-04-03',
  BRAINTREE_VERSION: '2018-05-10'
};

},{}],28:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Client - Interal Error Codes
 * @ignore
 * @description These codes should never be experienced by the mechant directly.
 * @property {MERCHANT} CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN An error to prevent client creation for domains that are not allowed in the JS.
 * @property {INTERNAL} CLIENT_MISSING_GATEWAY_CONFIGURATION Occurs when the client is created without a gateway configuration. Should never happen.
 */

/**
 * @name BraintreeError.Client - Create Error Codes
 * @description Errors that may occur when [creating the client](/current/module-braintree-web_client.html#.create)
 * @property {MERCHANT} CLIENT_INVALID_AUTHORIZATION Occurs when client token cannot be parsed.
 */

/**
 * @name BraintreeError.Client - Request Error Codes
 * @description Errors that may occur when [using the request method](/current/Client.html#request)
 * @property {MERCHANT} CLIENT_OPTION_REQUIRED An option required in the request method was not provided. Usually `options.method` or `options.endpoint`
 * @property {MERCHANT} CLIENT_OPTION_INVALID The request option provided is invalid.
 * @property {MERCHANT} CLIENT_GATEWAY_NETWORK The Braintree gateway could not be contacted.
 * @property {NETWORK} CLIENT_REQUEST_TIMEOUT The request took too long to complete and timed out.
 * @property {NETWORK} CLIENT_REQUEST_ERROR The response from a request had status 400 or greater.
 * @property {NETWORK} CLIENT_GRAPHQL_REQUEST_ERROR The response from a request to GraphQL contained an error.
 * @property {MERCHANT} CLIENT_RATE_LIMITED The response from a request had a status of 429, indicating rate limiting.
 * @property {MERCHANT} CLIENT_AUTHORIZATION_INSUFFICIENT The user assocaited with the client token or tokenization key does not have permissions to make the request.
 */

var BraintreeError = require('../lib/braintree-error');

module.exports = {
  CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_GATEWAY_CONFIGURATION_INVALID_DOMAIN'
  },
  CLIENT_OPTION_REQUIRED: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_OPTION_REQUIRED'
  },
  CLIENT_OPTION_INVALID: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_OPTION_INVALID'
  },
  CLIENT_MISSING_GATEWAY_CONFIGURATION: {
    type: BraintreeError.types.INTERNAL,
    code: 'CLIENT_MISSING_GATEWAY_CONFIGURATION',
    message: 'Missing gatewayConfiguration.'
  },
  CLIENT_INVALID_AUTHORIZATION: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_INVALID_AUTHORIZATION',
    message: 'Authorization is invalid. Make sure your client token or tokenization key is valid.'
  },
  CLIENT_GATEWAY_NETWORK: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_GATEWAY_NETWORK',
    message: 'Cannot contact the gateway at this time.'
  },
  CLIENT_REQUEST_TIMEOUT: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_REQUEST_TIMEOUT',
    message: 'Request timed out waiting for a reply.'
  },
  CLIENT_REQUEST_ERROR: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_REQUEST_ERROR',
    message: 'There was a problem with your request.'
  },
  CLIENT_GRAPHQL_REQUEST_ERROR: {
    type: BraintreeError.types.NETWORK,
    code: 'CLIENT_GRAPHQL_REQUEST_ERROR',
    message: 'There was a problem with your request.'
  },
  CLIENT_RATE_LIMITED: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_RATE_LIMITED',
    message: 'You are being rate-limited; please try again in a few minutes.'
  },
  CLIENT_AUTHORIZATION_INSUFFICIENT: {
    type: BraintreeError.types.MERCHANT,
    code: 'CLIENT_AUTHORIZATION_INSUFFICIENT',
    message: 'The authorization used has insufficient privileges.'
  }
};

},{"../lib/braintree-error":66}],29:[function(require,module,exports){
(function (global){
'use strict';

var BraintreeError = require('../lib/braintree-error');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var request = require('./request');
var uuid = require('../lib/vendor/uuid');
var constants = require('../lib/constants');
var createAuthorizationData = require('../lib/create-authorization-data');
var errors = require('./errors');
var GraphQL = require('./request/graphql');
var isDateStringBeforeOrOn = require('../lib/is-date-string-before-or-on');

var BRAINTREE_VERSION = require('./constants').BRAINTREE_VERSION;

function getConfiguration(options) {
  return new Promise(function (resolve, reject) {
    var configuration, authData, attrs, configUrl, reqOptions;
    var sessionId = uuid();
    var analyticsMetadata = {
      merchantAppId: global.location.host,
      platform: constants.PLATFORM,
      sdkVersion: constants.VERSION,
      source: constants.SOURCE,
      integration: constants.INTEGRATION,
      integrationType: constants.INTEGRATION,
      sessionId: sessionId
    };

    try {
      authData = createAuthorizationData(options.authorization);
    } catch (err) {
      reject(new BraintreeError(errors.CLIENT_INVALID_AUTHORIZATION));

      return;
    }
    attrs = authData.attrs;
    configUrl = authData.configUrl;

    attrs._meta = analyticsMetadata;
    attrs.braintreeLibraryVersion = constants.BRAINTREE_LIBRARY_VERSION;
    attrs.configVersion = '3';

    reqOptions = {
      url: configUrl,
      method: 'GET',
      data: attrs
    };

    if (attrs.authorizationFingerprint && authData.graphQL) {
      if (isDateStringBeforeOrOn(authData.graphQL.date, BRAINTREE_VERSION)) {
        reqOptions.graphQL = new GraphQL({
          graphQL: {
            url: authData.graphQL.url,
            features: ['configuration']
          }
        });
      }

      reqOptions.metadata = analyticsMetadata;
    }

    request(reqOptions, function (err, response, status) {
      var errorTemplate;

      if (err) {
        if (status === 403) {
          errorTemplate = errors.CLIENT_AUTHORIZATION_INSUFFICIENT;
        } else {
          errorTemplate = errors.CLIENT_GATEWAY_NETWORK;
        }

        reject(new BraintreeError({
          type: errorTemplate.type,
          code: errorTemplate.code,
          message: errorTemplate.message,
          details: {
            originalError: err
          }
        }));

        return;
      }

      configuration = {
        authorization: options.authorization,
        authorizationType: attrs.tokenizationKey ? 'TOKENIZATION_KEY' : 'CLIENT_TOKEN',
        analyticsMetadata: analyticsMetadata,
        gatewayConfiguration: response
      };

      resolve(configuration);
    });
  });
}

module.exports = {
  getConfiguration: wrapPromise(getConfiguration)
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../lib/braintree-error":66,"../lib/constants":71,"../lib/create-authorization-data":74,"../lib/is-date-string-before-or-on":81,"../lib/promise":87,"../lib/vendor/uuid":91,"./constants":27,"./errors":28,"./request":41,"./request/graphql":39,"@braintree/wrap-promise":21}],30:[function(require,module,exports){
'use strict';

var BraintreeError = require('../lib/braintree-error');
var Client = require('./client');
var getConfiguration = require('./get-configuration').getConfiguration;
var VERSION = "3.37.0";
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var sharedErrors = require('../lib/errors');

var cachedClients = {};

/** @module braintree-web/client */

/**
 * @function create
 * @description This function is the entry point for the <code>braintree.client</code> module. It is used for creating {@link Client} instances that service communication to Braintree servers.
 * @param {object} options Object containing all {@link Client} options:
 * @param {string} options.authorization A tokenizationKey or clientToken.
 * @param {callback} [callback] The second argument, <code>data</code>, is the {@link Client} instance.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * var createClient = require('braintree-web/client').create;
 *
 * createClient({
 *   authorization: CLIENT_AUTHORIZATION
 * }, function (createErr, clientInstance) {
 *   // ...
 * });
 * @static
 */
function create(options) {
  if (!options.authorization) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INSTANTIATION_OPTION_REQUIRED.type,
      code: sharedErrors.INSTANTIATION_OPTION_REQUIRED.code,
      message: 'options.authorization is required when instantiating a client.'
    }));
  }

  if (cachedClients[options.authorization] && cachedClients[options.authorization]._activeCache) {
    return Promise.resolve(cachedClients[options.authorization]);
  }

  return getConfiguration(options).then(function (configuration) {
    var client;

    if (options.debug) {
      configuration.isDebug = true;
    }

    client = new Client(configuration);

    cachedClients[options.authorization] = client;

    return client;
  });
}

// Primarily used for testing the client create call
function clearCache() {
  cachedClients = {};
}

module.exports = {
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION,
  _clearCache: clearCache
};

},{"../lib/braintree-error":66,"../lib/errors":78,"../lib/promise":87,"./client":26,"./get-configuration":29,"@braintree/wrap-promise":21}],31:[function(require,module,exports){
'use strict';

var querystring = require('../../lib/querystring');
var browserDetection = require('../browser-detection');
var assign = require('../../lib/assign').assign;
var prepBody = require('./prep-body');
var parseBody = require('./parse-body');
var xhr = require('./xhr');
var isXHRAvailable = xhr.isAvailable;
var GraphQLRequest = require('./graphql/request');
var DefaultRequest = require('./default-request');

var MAX_TCP_RETRYCOUNT = 1;
var TCP_PRECONNECT_BUG_STATUS_CODE = 408;

function requestShouldRetry(status) {
  return (!status || status === TCP_PRECONNECT_BUG_STATUS_CODE) && browserDetection.isIe();
}

function graphQLRequestShouldRetryWithClientApi(body) {
  var errorClass = !body.data && body.errors &&
      body.errors[0] &&
      body.errors[0].extensions &&
      body.errors[0].extensions.errorClass;

  return errorClass === 'UNKNOWN' || errorClass === 'INTERNAL';
}

function _requestWithRetry(options, tcpRetryCount, cb) {
  var status, resBody, ajaxRequest, body, method, headers, parsedBody;
  var url = options.url;
  var graphQL = options.graphQL;
  var timeout = options.timeout;
  var req = xhr.getRequestObject();
  var callback = cb;
  var isGraphQLRequest = Boolean(graphQL && graphQL.isGraphQLRequest(url, options.data));

  options.headers = assign({'Content-Type': 'application/json'}, options.headers);

  if (isGraphQLRequest) {
    ajaxRequest = new GraphQLRequest(options);
  } else {
    ajaxRequest = new DefaultRequest(options);
  }

  url = ajaxRequest.getUrl();
  body = ajaxRequest.getBody();
  method = ajaxRequest.getMethod();
  headers = ajaxRequest.getHeaders();

  if (method === 'GET') {
    url = querystring.queryify(url, body);
    body = null;
  }

  if (isXHRAvailable) {
    req.onreadystatechange = function () {
      if (req.readyState !== 4) { return; }

      if (req.status === 0 && isGraphQLRequest) {
        // If a merchant experiences a connection
        // issue to the GraphQL endpoint (possibly
        // due to a Content Security Policy), retry
        // the request against the old client API.
        delete options.graphQL;
        _requestWithRetry(options, tcpRetryCount, cb);

        return;
      }

      parsedBody = parseBody(req.responseText);
      resBody = ajaxRequest.adaptResponseBody(parsedBody);
      status = ajaxRequest.determineStatus(req.status, parsedBody);

      if (status >= 400 || status < 200) {
        if (isGraphQLRequest && graphQLRequestShouldRetryWithClientApi(parsedBody)) {
          delete options.graphQL;
          _requestWithRetry(options, tcpRetryCount, cb);

          return;
        }

        if (tcpRetryCount < MAX_TCP_RETRYCOUNT && requestShouldRetry(status)) {
          tcpRetryCount++;
          _requestWithRetry(options, tcpRetryCount, cb);

          return;
        }
        callback(resBody || 'error', null, status || 500);
      } else {
        callback(null, resBody, status);
      }
    };
  } else {
    if (options.headers) {
      url = querystring.queryify(url, headers);
    }

    req.onload = function () {
      callback(null, parseBody(req.responseText), req.status);
    };

    req.onerror = function () {
      // XDomainRequest does not report a body or status for errors, so
      // hardcode to 'error' and 500, respectively
      callback('error', null, 500);
    };

    // This must remain for IE9 to work
    req.onprogress = function () {};

    req.ontimeout = function () {
      callback('timeout', null, -1);
    };
  }

  try {
    req.open(method, url, true);
  } catch (requestOpenError) {
    // If a merchant has a Content Security Policy and they have
    // not allowed our endpoints, some browsers may
    // synchronously throw an error. If it is not a GraphQL
    // request, we throw the error. If it is a GraphQL request
    // we remove the GraphQL option and try the request against
    // the old client API.
    if (!isGraphQLRequest) {
      throw requestOpenError;
    }

    delete options.graphQL;

    _requestWithRetry(options, tcpRetryCount, cb);

    return;
  }

  req.timeout = timeout;

  if (isXHRAvailable) {
    Object.keys(headers).forEach(function (headerKey) {
      req.setRequestHeader(headerKey, headers[headerKey]);
    });
  }

  try {
    req.send(prepBody(method, body));
  } catch (e) { /* ignored */ }
}

function request(options, cb) {
  _requestWithRetry(options, 0, cb);
}

module.exports = {
  request: request
};

},{"../../lib/assign":63,"../../lib/querystring":88,"../browser-detection":25,"./default-request":32,"./graphql/request":40,"./parse-body":44,"./prep-body":45,"./xhr":46}],32:[function(require,module,exports){
'use strict';

function DefaultRequest(options) {
  this._url = options.url;
  this._data = options.data;
  this._method = options.method;
  this._headers = options.headers;
}

DefaultRequest.prototype.getUrl = function () {
  return this._url;
};

DefaultRequest.prototype.getBody = function () {
  return this._data;
};

DefaultRequest.prototype.getMethod = function () {
  return this._method;
};

DefaultRequest.prototype.getHeaders = function () {
  return this._headers;
};

DefaultRequest.prototype.adaptResponseBody = function (parsedBody) {
  return parsedBody;
};

DefaultRequest.prototype.determineStatus = function (status) {
  return status;
};

module.exports = DefaultRequest;

},{}],33:[function(require,module,exports){
(function (global){
'use strict';

module.exports = function getUserAgent() {
  return global.navigator.userAgent;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],34:[function(require,module,exports){
'use strict';

var errorResponseAdapter = require('./error');
var assign = require('../../../../lib/assign').assign;

/* eslint-disable camelcase */
var cardTypeTransforms = {
  creditCard: {
    AMERICAN_EXPRESS: 'American Express',
    DISCOVER: 'Discover',
    INTERNATIONAL_MAESTRO: 'Maestro',
    JCB: 'JCB',
    MASTERCARD: 'MasterCard',
    SOLO: 'Solo',
    UK_MAESTRO: 'UK Maestro',
    UNION_PAY: 'UnionPay',
    VISA: 'Visa'
  },
  applePayWeb: {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    DISCOVER: 'discover',
    AMERICAN_EXPRESS: 'amex'
  },
  visaCheckout: {
    VISA: 'Visa',
    MASTERCARD: 'MasterCard',
    DISCOVER: 'Discover',
    AMERICAN_EXPRESS: 'American Express'
  },
  googlePay: {
    VISA: 'visa',
    MASTERCARD: 'mastercard',
    DISCOVER: 'discover',
    AMERICAN_EXPRESS: 'amex'
  },
  masterpass: {
    VISA: 'visa',
    MASTERCARD: 'master',
    DISCOVER: 'discover',
    AMERICAN_EXPRESS: 'amex',
    DINERS: 'diners',
    INTERNATIONAL_MAESTRO: 'maestro',
    JCB: 'jcb'
  }
};
/* eslint-enable camelcase */

function configurationResponseAdapter(responseBody, ctx) {
  var adaptedResponse;

  if (responseBody.data && !responseBody.errors) {
    adaptedResponse = adaptConfigurationResponseBody(responseBody, ctx);
  } else {
    adaptedResponse = errorResponseAdapter(responseBody);
  }

  return adaptedResponse;
}

function adaptConfigurationResponseBody(body, ctx) {
  var configuration = body.data.clientConfiguration;
  var response;

  response = {
    environment: configuration.environment.toLowerCase(),
    clientApiUrl: configuration.clientApiUrl,
    assetsUrl: configuration.assetsUrl,
    analytics: {
      url: configuration.analyticsUrl
    },
    merchantId: configuration.merchantId,
    venmo: 'off'
  };

  if (configuration.supportedFeatures) {
    response.graphQL = {
      url: ctx._graphQL._config.url,
      features: configuration.supportedFeatures.map(function (feature) {
        return feature.toLowerCase();
      })
    };
  }

  if (configuration.braintreeApi) {
    response.braintreeApi = configuration.braintreeApi;
  }

  if (configuration.applePayWeb) {
    response.applePayWeb = configuration.applePayWeb;
    response.applePayWeb.supportedNetworks = mapCardTypes(configuration.applePayWeb.supportedCardBrands, cardTypeTransforms.applePayWeb);

    delete response.applePayWeb.supportedCardBrands;
  }

  if (configuration.ideal) {
    response.ideal = configuration.ideal;
  }

  if (configuration.kount) {
    response.kount = {
      kountMerchantId: configuration.kount.merchantId
    };
  }

  if (configuration.creditCard) {
    response.challenges = configuration.creditCard.challenges.map(function (challenge) {
      return challenge.toLowerCase();
    });

    response.creditCards = {
      supportedCardTypes: mapCardTypes(configuration.creditCard.supportedCardBrands, cardTypeTransforms.creditCard)
    };
    response.threeDSecureEnabled = configuration.creditCard.threeDSecureEnabled;
  } else {
    response.challenges = [];
    response.creditCards = {
      supportedCardTypes: []
    };
    response.threeDSecureEnabled = false;
  }

  if (configuration.googlePay) {
    response.androidPay = {
      displayName: configuration.googlePay.displayName,
      enabled: true,
      environment: configuration.googlePay.environment.toLowerCase(),
      googleAuthorizationFingerprint: configuration.googlePay.googleAuthorization,
      supportedNetworks: mapCardTypes(configuration.googlePay.supportedCardBrands, cardTypeTransforms.googlePay)
    };
  }

  if (configuration.venmo) {
    response.payWithVenmo = {
      merchantId: configuration.venmo.merchantId,
      accessToken: configuration.venmo.accessToken,
      environment: configuration.venmo.environment.toLowerCase()
    };
  }

  if (configuration.paypal) {
    response.paypalEnabled = true;
    response.paypal = assign({}, configuration.paypal);
    response.paypal.currencyIsoCode = response.paypal.currencyCode;
    response.paypal.environment = response.paypal.environment.toLowerCase();

    delete response.paypal.currencyCode;
  } else {
    response.paypalEnabled = false;
  }

  if (configuration.unionPay) {
    response.unionPay = {
      enabled: true,
      merchantAccountId: configuration.unionPay.merchantAccountId
    };
  }

  if (configuration.visaCheckout) {
    response.visaCheckout = {
      apikey: configuration.visaCheckout.apiKey,
      externalClientId: configuration.visaCheckout.externalClientId,
      supportedCardTypes: mapCardTypes(configuration.visaCheckout.supportedCardBrands, cardTypeTransforms.visaCheckout)
    };
  }

  if (configuration.masterpass) {
    response.masterpass = {
      merchantCheckoutId: configuration.masterpass.merchantCheckoutId,
      supportedNetworks: mapCardTypes(configuration.masterpass.supportedCardBrands, cardTypeTransforms.masterpass)
    };
  }

  if (configuration.usBankAccount) {
    response.usBankAccount = {
      routeId: configuration.usBankAccount.routeId,
      plaid: {
        publicKey: configuration.usBankAccount.plaidPublicKey
      }
    };
  }

  return response;
}

function mapCardTypes(cardTypes, cardTypeTransformMap) {
  return cardTypes.reduce(function (acc, type) {
    if (cardTypeTransformMap.hasOwnProperty(type)) {
      return acc.concat(cardTypeTransformMap[type]);
    }

    return acc;
  }, []);
}

module.exports = configurationResponseAdapter;

},{"../../../../lib/assign":63,"./error":36}],35:[function(require,module,exports){
'use strict';

var errorResponseAdapter = require('./error');

var CARD_BRAND_MAP = {
  /* eslint-disable camelcase */
  AMERICAN_EXPRESS: 'American Express',
  DINERS: 'Discover',
  DISCOVER: 'Discover',
  INTERNATIONAL_MAESTRO: 'Maestro',
  JCB: 'JCB',
  MASTERCARD: 'MasterCard',
  UK_MAESTRO: 'Maestro',
  UNION_PAY: 'Union Pay',
  VISA: 'Visa'
  /* eslint-enable camelcase */
};

var BIN_DATA_MAP = {
  YES: 'Yes',
  NO: 'No',
  UNKNOWN: 'Unknown'
};

function creditCardTokenizationResponseAdapter(responseBody) {
  var adaptedResponse;

  if (responseBody.data && !responseBody.errors) {
    adaptedResponse = adaptTokenizeCreditCardResponseBody(responseBody);
  } else {
    adaptedResponse = errorResponseAdapter(responseBody);
  }

  return adaptedResponse;
}

function adaptTokenizeCreditCardResponseBody(body) {
  var data = body.data.tokenizeCreditCard;
  var creditCard = data.creditCard;
  var lastTwo = creditCard.last4 ? creditCard.last4.substr(2, 4) : '';
  var binData = creditCard.binData;
  var response;

  if (binData) {
    ['commercial', 'debit', 'durbinRegulated', 'healthcare', 'payroll', 'prepaid'].forEach(function (key) {
      if (binData[key]) {
        binData[key] = BIN_DATA_MAP[binData[key]];
      } else {
        binData[key] = 'Unknown';
      }
    });

    ['issuingBank', 'countryOfIssuance', 'productId'].forEach(function (key) {
      if (!binData[key]) { binData[key] = 'Unknown'; }
    });
  }

  response = {
    creditCards: [
      {
        binData: binData,
        consumed: false,
        description: lastTwo ? 'ending in ' + lastTwo : '',
        nonce: data.token,
        details: {
          cardType: CARD_BRAND_MAP[creditCard.brandCode] || 'Unknown',
          lastFour: creditCard.last4 || '',
          lastTwo: lastTwo
        },
        type: 'CreditCard',
        threeDSecureInfo: null
      }
    ]
  };

  return response;
}

module.exports = creditCardTokenizationResponseAdapter;

},{"./error":36}],36:[function(require,module,exports){
'use strict';

function errorResponseAdapter(responseBody) {
  var response;
  var errorClass = responseBody.errors &&
    responseBody.errors[0] &&
    responseBody.errors[0].extensions &&
    responseBody.errors[0].extensions.errorClass;

  if (errorClass === 'VALIDATION') {
    response = userErrorResponseAdapter(responseBody);
  } else if (errorClass) {
    response = errorWithClassResponseAdapter(responseBody);
  } else {
    response = {error: {message: 'There was a problem serving your request'}, fieldErrors: []};
  }

  return response;
}

function errorWithClassResponseAdapter(responseBody) {
  return {error: {message: responseBody.errors[0].message}, fieldErrors: []};
}

function userErrorResponseAdapter(responseBody) {
  var fieldErrors = buildFieldErrors(responseBody.errors);

  return {error: {message: getLegacyMessage(fieldErrors)}, fieldErrors: fieldErrors};
}

function buildFieldErrors(errors) {
  var fieldErrors = [];

  errors.forEach(function (error) {
    addFieldError(error.extensions.inputPath.slice(1), error, fieldErrors);
  });

  return fieldErrors;
}

function addFieldError(inputPath, errorDetail, fieldErrors) {
  var fieldError;
  var legacyCode = errorDetail.extensions.legacyCode;
  var inputField = inputPath[0];

  if (inputPath.length === 1) {
    fieldErrors.push({
      code: legacyCode,
      field: inputField,
      message: errorDetail.message
    });

    return;
  }

  fieldErrors.forEach(function (candidate) {
    if (candidate.field === inputField) {
      fieldError = candidate;
    }
  });

  if (!fieldError) {
    fieldError = {field: inputField, fieldErrors: []};
    fieldErrors.push(fieldError);
  }

  addFieldError(inputPath.slice(1), errorDetail, fieldError.fieldErrors);
}

function getLegacyMessage(errors) {
  var legacyMessages = {
    creditCard: 'Credit card is invalid'
  };

  var field = errors[0].field;

  return legacyMessages[field];
}

module.exports = errorResponseAdapter;

},{}],37:[function(require,module,exports){
'use strict';

var CONFIGURATION_QUERY = 'query ClientConfiguration { ' +
'  clientConfiguration { ' +
'    analyticsUrl ' +
'    environment ' +
'    merchantId ' +
'    assetsUrl ' +
'    clientApiUrl ' +
'    creditCard { ' +
'      supportedCardBrands ' +
'      challenges ' +
'      threeDSecureEnabled ' +
'    } ' +
'    applePayWeb { ' +
'      countryCode ' +
'      currencyCode ' +
'      merchantIdentifier ' +
'      supportedCardBrands ' +
'    } ' +
'    googlePay { ' +
'      displayName ' +
'      supportedCardBrands ' +
'      environment ' +
'      googleAuthorization ' +
'    } ' +
'    ideal { ' +
'      routeId ' +
'      assetsUrl ' +
'    } ' +
'    kount { ' +
'      merchantId ' +
'    } ' +
'    masterpass { ' +
'      merchantCheckoutId ' +
'      supportedCardBrands ' +
'    } ' +
'    paypal { ' +
'      displayName ' +
'      clientId ' +
'      privacyUrl ' +
'      userAgreementUrl ' +
'      assetsUrl ' +
'      environment ' +
'      environmentNoNetwork ' +
'      unvettedMerchant ' +
'      braintreeClientId ' +
'      billingAgreementsEnabled ' +
'      merchantAccountId ' +
'      currencyCode ' +
'      payeeEmail ' +
'    } ' +
'    unionPay { ' +
'      merchantAccountId ' +
'    } ' +
'    usBankAccount { ' +
'      routeId ' +
'      plaidPublicKey ' +
'    } ' +
'    venmo { ' +
'      merchantId ' +
'      accessToken ' +
'      environment ' +
'    } ' +
'    visaCheckout { ' +
'      apiKey ' +
'      externalClientId ' +
'      supportedCardBrands ' +
'    } ' +
'    braintreeApi { ' +
'      accessToken ' +
'      url ' +
'    } ' +
'    supportedFeatures ' +
'  } ' +
'}';

function configuration() {
  return {
    query: CONFIGURATION_QUERY,
    operationName: 'ClientConfiguration'
  };
}

module.exports = configuration;

},{}],38:[function(require,module,exports){
'use strict';

var assign = require('../../../../lib/assign').assign;

var CREDIT_CARD_TOKENIZATION_MUTATION = 'mutation TokenizeCreditCard($input: TokenizeCreditCardInput!) { ' +
'  tokenizeCreditCard(input: $input) { ' +
'    token ' +
'    creditCard { ' +
'      brandCode ' +
'      last4 ' +
'      binData { ' +
'        prepaid ' +
'        healthcare ' +
'        debit ' +
'        durbinRegulated ' +
'        commercial ' +
'        payroll ' +
'        issuingBank ' +
'        countryOfIssuance ' +
'        productId ' +
'      } ' +
'    } ' +
'  } ' +
'}';

function createCreditCardTokenizationBody(body) {
  var cc = body.creditCard;
  var billingAddress = cc && cc.billingAddress;
  var expDate = cc && cc.expirationDate;
  var expirationMonth = cc && (cc.expirationMonth || (expDate && expDate.split('/')[0].trim()));
  var expirationYear = cc && (cc.expirationYear || (expDate && expDate.split('/')[1].trim()));
  var variables = {
    input: {
      creditCard: {
        number: cc && cc.number,
        expirationMonth: expirationMonth,
        expirationYear: expirationYear,
        cvv: cc && cc.cvv,
        cardholderName: cc && cc.cardholderName
      },
      options: {}
    }
  };

  if (billingAddress) {
    variables.input.creditCard.billingAddress = billingAddress;
  }

  variables.input = addValidationRule(body, variables.input);

  return variables;
}

function addValidationRule(body, input) {
  var validate;

  if (body.creditCard && body.creditCard.options && typeof body.creditCard.options.validate === 'boolean') {
    validate = body.creditCard.options.validate;
  } else if ((body.authorizationFingerprint && body.tokenizationKey) || body.authorizationFingerprint) {
    validate = true;
  } else if (body.tokenizationKey) {
    validate = false;
  }

  if (typeof validate === 'boolean') {
    input.options = assign({
      validate: validate
    }, input.options);
  }

  return input;
}

function creditCardTokenization(body) {
  return {
    query: CREDIT_CARD_TOKENIZATION_MUTATION,
    variables: createCreditCardTokenizationBody(body),
    operationName: 'TokenizeCreditCard'
  };
}

module.exports = creditCardTokenization;

},{"../../../../lib/assign":63}],39:[function(require,module,exports){
'use strict';

var browserDetection = require('../../browser-detection');

var features = {
  tokenize_credit_cards: 'payment_methods/credit_cards', // eslint-disable-line camelcase
  configuration: 'configuration'
};

var disallowedInputPaths = [
  'creditCard.options.unionPayEnrollment'
];

function GraphQL(config) {
  this._config = config.graphQL;
}

GraphQL.prototype.getGraphQLEndpoint = function () {
  return this._config.url;
};

GraphQL.prototype.isGraphQLRequest = function (url, body) {
  var featureEnabled;
  var path = this.getClientApiPath(url);

  if (!this._isGraphQLEnabled() || !path || browserDetection.isIe9()) {
    return false;
  }

  featureEnabled = this._config.features.some(function (feature) {
    return features[feature] === path;
  });

  if (containsDisallowedlistedKeys(body)) {
    return false;
  }

  return featureEnabled;
};

GraphQL.prototype.getClientApiPath = function (url) {
  var path;
  var clientApiPrefix = '/client_api/v1/';
  var pathParts = url.split(clientApiPrefix);

  if (pathParts.length > 1) {
    path = pathParts[1].split('?')[0];
  }

  return path;
};

GraphQL.prototype._isGraphQLEnabled = function () {
  return Boolean(this._config);
};

function containsDisallowedlistedKeys(body) {
  return disallowedInputPaths.some(function (keys) {
    var value = keys.split('.').reduce(function (accumulator, key) {
      return accumulator && accumulator[key];
    }, body);

    return value !== undefined; // eslint-disable-line no-undefined
  });
}

module.exports = GraphQL;

},{"../../browser-detection":25}],40:[function(require,module,exports){
'use strict';

var BRAINTREE_VERSION = require('../../constants').BRAINTREE_VERSION;

var assign = require('../../../lib/assign').assign;

var creditCardTokenizationBodyGenerator = require('./generators/credit-card-tokenization');
var creditCardTokenizationResponseAdapter = require('./adapters/credit-card-tokenization');

var configurationBodyGenerator = require('./generators/configuration');
var configurationResponseAdapter = require('./adapters/configuration');

var generators = {
  'payment_methods/credit_cards': creditCardTokenizationBodyGenerator,
  configuration: configurationBodyGenerator
};
var adapters = {
  'payment_methods/credit_cards': creditCardTokenizationResponseAdapter,
  configuration: configurationResponseAdapter
};

function GraphQLRequest(options) {
  var clientApiPath = options.graphQL.getClientApiPath(options.url);

  this._graphQL = options.graphQL;
  this._data = options.data;
  this._method = options.method;
  this._headers = options.headers;
  this._clientSdkMetadata = {
    source: options.metadata.source,
    integration: options.metadata.integration,
    sessionId: options.metadata.sessionId
  };
  this._sendAnalyticsEvent = options.sendAnalyticsEvent || Function.prototype;

  this._generator = generators[clientApiPath];
  this._adapter = adapters[clientApiPath];

  this._sendAnalyticsEvent('graphql.init');
}

GraphQLRequest.prototype.getUrl = function () {
  return this._graphQL.getGraphQLEndpoint();
};

GraphQLRequest.prototype.getBody = function () {
  var formattedBody = formatBodyKeys(this._data);
  var generatedBody = this._generator(formattedBody);
  var body = assign({clientSdkMetadata: this._clientSdkMetadata}, generatedBody);

  return JSON.stringify(body);
};

GraphQLRequest.prototype.getMethod = function () {
  return 'POST';
};

GraphQLRequest.prototype.getHeaders = function () {
  var authorization, headers;

  if (this._data.authorizationFingerprint) {
    this._sendAnalyticsEvent('graphql.authorization-fingerprint');
    authorization = this._data.authorizationFingerprint;
  } else {
    this._sendAnalyticsEvent('graphql.tokenization-key');
    authorization = this._data.tokenizationKey;
  }

  headers = {
    Authorization: 'Bearer ' + authorization,
    'Braintree-Version': BRAINTREE_VERSION
  };

  return assign({}, this._headers, headers);
};

GraphQLRequest.prototype.adaptResponseBody = function (parsedBody) {
  return this._adapter(parsedBody, this);
};

GraphQLRequest.prototype.determineStatus = function (httpStatus, parsedResponse) {
  var status, errorClass;

  if (httpStatus === 200) {
    errorClass = parsedResponse.errors &&
      parsedResponse.errors[0] &&
      parsedResponse.errors[0].extensions &&
      parsedResponse.errors[0].extensions.errorClass;

    if (parsedResponse.data && !parsedResponse.errors) {
      status = 200;
    } else if (errorClass === 'VALIDATION') {
      status = 422;
    } else if (errorClass === 'AUTHORIZATION') {
      status = 403;
    } else if (errorClass === 'AUTHENTICATION') {
      status = 401;
    } else if (isGraphQLError(errorClass, parsedResponse)) {
      status = 403;
    } else {
      status = 500;
    }
  } else if (!httpStatus) {
    status = 500;
  } else {
    status = httpStatus;
  }

  this._sendAnalyticsEvent('graphql.status.' + httpStatus);
  this._sendAnalyticsEvent('graphql.determinedStatus.' + status);

  return status;
};

function isGraphQLError(errorClass, parsedResponse) {
  return !errorClass && parsedResponse.errors[0].message;
}

function snakeCaseToCamelCase(snakeString) {
  if (snakeString.indexOf('_') === -1) {
    return snakeString;
  }

  return snakeString.toLowerCase().replace(/(\_\w)/g, function (match) {
    return match[1].toUpperCase();
  });
}

function formatBodyKeys(originalBody) {
  var body = {};

  Object.keys(originalBody).forEach(function (key) {
    var camelCaseKey = snakeCaseToCamelCase(key);

    if (typeof originalBody[key] === 'object') {
      body[camelCaseKey] = formatBodyKeys(originalBody[key]);
    } else if (typeof originalBody[key] === 'number') {
      body[camelCaseKey] = String(originalBody[key]);
    } else {
      body[camelCaseKey] = originalBody[key];
    }
  });

  return body;
}

module.exports = GraphQLRequest;

},{"../../../lib/assign":63,"../../constants":27,"./adapters/configuration":34,"./adapters/credit-card-tokenization":35,"./generators/configuration":37,"./generators/credit-card-tokenization":38}],41:[function(require,module,exports){
'use strict';

var ajaxIsAvaliable;
var once = require('../../lib/once');
var JSONPDriver = require('./jsonp-driver');
var AJAXDriver = require('./ajax-driver');
var getUserAgent = require('./get-user-agent');
var isHTTP = require('./is-http');

function isAjaxAvailable() {
  if (ajaxIsAvaliable == null) {
    ajaxIsAvaliable = !(isHTTP() && /MSIE\s(8|9)/.test(getUserAgent()));
  }

  return ajaxIsAvaliable;
}

module.exports = function (options, cb) {
  cb = once(cb || Function.prototype);
  options.method = (options.method || 'GET').toUpperCase();
  options.timeout = options.timeout == null ? 60000 : options.timeout;
  options.data = options.data || {};

  if (isAjaxAvailable()) {
    AJAXDriver.request(options, cb);
  } else {
    JSONPDriver.request(options, cb);
  }
};

},{"../../lib/once":86,"./ajax-driver":31,"./get-user-agent":33,"./is-http":42,"./jsonp-driver":43}],42:[function(require,module,exports){
(function (global){
'use strict';

module.exports = function () {
  return global.location.protocol === 'http:';
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],43:[function(require,module,exports){
(function (global){
'use strict';

var head;
var uuid = require('../../lib/vendor/uuid');
var querystring = require('../../lib/querystring');
var timeouts = {};

function _removeScript(script) {
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

function _createScriptTag(url, callbackName) {
  var script = document.createElement('script');
  var done = false;

  script.src = url;
  script.async = true;
  script.onerror = function () {
    global[callbackName]({message: 'error', status: 500});
  };

  script.onload = script.onreadystatechange = function () {
    if (done) { return; }

    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      done = true;
      script.onload = script.onreadystatechange = null;
    }
  };

  return script;
}

function _cleanupGlobal(callbackName) {
  try {
    delete global[callbackName];
  } catch (_) {
    global[callbackName] = null;
  }
}

function _setupTimeout(timeout, callbackName) {
  timeouts[callbackName] = setTimeout(function () {
    timeouts[callbackName] = null;

    global[callbackName]({
      error: 'timeout',
      status: -1
    });

    global[callbackName] = function () {
      _cleanupGlobal(callbackName);
    };
  }, timeout);
}

function _setupGlobalCallback(script, callback, callbackName) {
  global[callbackName] = function (response) {
    var status = response.status || 500;
    var err = null;
    var data = null;

    delete response.status;

    if (status >= 400 || status < 200) {
      err = response;
    } else {
      data = response;
    }

    _cleanupGlobal(callbackName);
    _removeScript(script);

    clearTimeout(timeouts[callbackName]);
    callback(err, data, status);
  };
}

function request(options, callback) {
  var script;
  var callbackName = 'callback_json_' + uuid().replace(/-/g, '');
  var url = options.url;
  var attrs = options.data;
  var method = options.method;
  var timeout = options.timeout;

  url = querystring.queryify(url, attrs);
  url = querystring.queryify(url, {
    _method: method,
    callback: callbackName
  });

  script = _createScriptTag(url, callbackName);
  _setupGlobalCallback(script, callback, callbackName);
  _setupTimeout(timeout, callbackName);

  if (!head) {
    head = document.getElementsByTagName('head')[0];
  }

  head.appendChild(script);
}

module.exports = {
  request: request
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../lib/querystring":88,"../../lib/vendor/uuid":91}],44:[function(require,module,exports){
'use strict';

module.exports = function (body) {
  try {
    body = JSON.parse(body);
  } catch (e) { /* ignored */ }

  return body;
};

},{}],45:[function(require,module,exports){
'use strict';

module.exports = function (method, body) {
  if (typeof method !== 'string') {
    throw new Error('Method must be a string');
  }

  if (method.toLowerCase() !== 'get' && body != null) {
    body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return body;
};

},{}],46:[function(require,module,exports){
(function (global){
'use strict';

var isXHRAvailable = global.XMLHttpRequest && 'withCredentials' in new global.XMLHttpRequest();

function getRequestObject() {
  return isXHRAvailable ? new XMLHttpRequest() : new XDomainRequest();
}

module.exports = {
  isAvailable: isXHRAvailable,
  getRequestObject: getRequestObject
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],47:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Google Payment - Creation Error Codes
 * @description Errors that occur when [creating the Google Payment component](/current/module-braintree-web_google-payment.html#.create).
 * @property {MERCHANT} GOOGLE_PAYMENT_NOT_ENABLED Occurs when Google Pay is not enabled on the Braintree control panel.
 */

/**
 * @name BraintreeError.Google Payment - parseResponse Error Codes
 * @description Errors that occur when [parsing the response from Google](/current/GooglePayment.html#parseResponse).
 * @property {UNKNOWN} GOOGLE_PAYMENT_GATEWAY_ERROR Occurs when Google Pay could not be tokenized.
 */

var BraintreeError = require('../lib/braintree-error');

module.exports = {
  GOOGLE_PAYMENT_NOT_ENABLED: {
    type: BraintreeError.types.MERCHANT,
    code: 'GOOGLE_PAYMENT_NOT_ENABLED',
    message: 'Google Pay is not enabled for this merchant.'
  },
  GOOGLE_PAYMENT_GATEWAY_ERROR: {
    code: 'GOOGLE_PAYMENT_GATEWAY_ERROR',
    message: 'There was an error when tokenizing the Google Pay payment method.',
    type: BraintreeError.types.UNKNOWN
  }
};

},{"../lib/braintree-error":66}],48:[function(require,module,exports){
'use strict';

var analytics = require('../lib/analytics');
var assign = require('../lib/assign').assign;
var convertMethodsToError = require('../lib/convert-methods-to-error');
var generateGooglePayConfiguration = require('../lib/generate-google-pay-configuration');
var BraintreeError = require('../lib/braintree-error');
var errors = require('./errors');
var methods = require('../lib/methods');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');

/**
 * @typedef {object} GooglePayment~tokenizePayload
 * @property {string} nonce The payment method nonce.
 * @property {object} details Additional account details.
 * @property {string} details.cardType Type of card, ex: Visa, MasterCard.
 * @property {string} details.lastFour Last four digits of card number.
 * @property {string} details.lastTwo Last two digits of card number.
 * @property {string} description A human-readable description.
 * @property {string} type The payment method type, `CreditCard` or `AndroidPayCard`.
 * @property {object} binData Information about the card based on the bin.
 * @property {string} binData.commercial Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.countryOfIssuance The country of issuance.
 * @property {string} binData.debit Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.durbinRegulated Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.healthcare Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.issuingBank The issuing bank.
 * @property {string} binData.payroll Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.prepaid Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.productId The product id.
 */

/**
 * @class GooglePayment
 * @param {object} options Google Payment {@link module:braintree-web/google-payment.create create} options.
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web/google-payment.create|braintree-web.google-payment.create} instead.</strong>
 * @classdesc This class represents a Google Payment component produced by {@link module:braintree-web/google-payment.create|braintree-web/google-payment.create}. Instances of this class have methods for initializing the Google Pay flow.
 */
function GooglePayment(options) {
  this._client = options.client;

  this._braintreeGeneratedPaymentRequestConfiguration = generateGooglePayConfiguration(this._client.getConfiguration());
}

/**
 * Create a configuration object for use in the `loadPaymentData` method.
 * @public
 * @param {object} overrides The supplied parameters for creating the PaymentDataRequest object. Only required parameters are the `merchantId` provided by Google and a `transactionInfo` object, but any of the parameters in the PaymentDataRequest can be overwritten. See https://developers.google.com/pay/api/web/reference/object#PaymentDataRequest
 * @param {string} merchantId The merchant id provided by registering with Google.
 * @param {object} transactionInfo See https://developers.google.com/pay/api/web/reference/object#TransactionInfo for more information.
 * @example
 * var configuration = googlePaymentInstance.createPaymentDataRequest({
 *   merchantId: 'my-merchant-id-from-google',
 *   transactionInfo: {
 *     currencyCode: 'USD',
 *     totalPriceStatus: 'FINAL',
 *     totalPrice: '100.00'
 *   }
 * });
 * var paymentsClient = new google.payments.api.PaymentsClient({
 *   environment: 'TEST' // or 'PRODUCTION'
 * })
 *
 * paymentsClient.loadPaymentData(paymentDataRequest).then(function (response) {
 *   // handle response with googlePaymentInstance.parseResponse
 *   // (see below)
 * });
 * @returns {object} Returns a configuration object for Google PaymentDataRequest.
 */
GooglePayment.prototype.createPaymentDataRequest = function (overrides) {
  var overrideCardNetworks = overrides && overrides.cardRequirements && overrides.cardRequirements.allowedCardNetworks;
  var defaultCardNetworks = this._braintreeGeneratedPaymentRequestConfiguration.cardRequirements.allowedCardNetworks;
  var allowedCardNetworks = overrideCardNetworks || defaultCardNetworks;
  var paymentDataRequest = assign({}, this._braintreeGeneratedPaymentRequestConfiguration, overrides);

  // this way we can preserve allowedCardNetworks from default integration
  // if merchant did not pass any in `cardRequirements`
  paymentDataRequest.cardRequirements.allowedCardNetworks = allowedCardNetworks;

  analytics.sendEvent(this._client, 'google-payment.createPaymentDataRequest');

  return paymentDataRequest;
};

/**
 * Parse the response from the tokenization.
 * @public
 * @param {object} response The response back from the Google Pay tokenization.
 * @param {callback} [callback] The second argument, <code>data</code>, is a {@link GooglePay~tokenizePayload|tokenizePayload}. If no callback is provided, `parseResponse` returns a promise that resolves with a {@link GooglePayment~tokenizePayload|tokenizePayload}.
 * @example with callback
 * var paymentsClient = new google.payments.api.PaymentsClient({
 *   environment: 'TEST' // or 'PRODUCTION'
 * })
 *
 * paymentsClient.loadPaymentData(paymentDataRequestFromCreatePaymentDataRequest).then(function (response) {
 *   googlePaymentInstance.parseResponse(response, function (err, data) {
 *     if (err) {
 *       // handle errors
 *     }
 *     // send parsedResponse.nonce to your server
 *   });
 * });
 * @example with promise
 * var paymentsClient = new google.payments.api.PaymentsClient({
 *   environment: 'TEST' // or 'PRODUCTION'
 * })
 *
 * paymentsClient.loadPaymentData(paymentDataRequestFromCreatePaymentDataRequest).then(function (response) {
 *   return googlePaymentInstance.parseResponse(response);
 * }).then(function (parsedResponse) {
 *   // send parsedResponse.nonce to your server
 * }).catch(function (err) {
 *   // handle errors
 * });
 * @returns {Promise|void} Returns a promise that resolves the parsed response if no callback is provided.
 */
GooglePayment.prototype.parseResponse = function (response) {
  var client = this._client;

  return Promise.resolve().then(function () {
    var payload;
    var parsedResponse = JSON.parse(response.paymentMethodToken.token);
    var error = parsedResponse.error;

    if (error) {
      return Promise.reject(error);
    }

    payload = parsedResponse.androidPayCards[0];
    analytics.sendEvent(client, 'google-payment.parseResponse.succeeded');

    return Promise.resolve({
      nonce: payload.nonce,
      type: payload.type,
      description: payload.description,
      details: {
        cardType: payload.details.cardType,
        lastFour: payload.details.lastFour,
        lastTwo: payload.details.lastTwo
      },
      binData: payload.binData
    });
  }).catch(function (error) {
    analytics.sendEvent(client, 'google-payment.parseResponse.failed');

    return Promise.reject(new BraintreeError({
      code: errors.GOOGLE_PAYMENT_GATEWAY_ERROR.code,
      message: errors.GOOGLE_PAYMENT_GATEWAY_ERROR.message,
      type: errors.GOOGLE_PAYMENT_GATEWAY_ERROR.type,
      details: {
        originalError: error
      }
    }));
  });
};

/**
 * Cleanly tear down anything set up by {@link module:braintree-web/google-payment.create|create}.
 * @public
 * @param {callback} [callback] Called once teardown is complete. No data is returned if teardown completes successfully.
 * @example
 * googlePaymentInstance.teardown();
 * @example <caption>With callback</caption>
 * googlePaymentInstance.teardown(function () {
 *   // teardown is complete
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
GooglePayment.prototype.teardown = function () {
  convertMethodsToError(this, methods(GooglePayment.prototype));

  return Promise.resolve();
};

module.exports = wrapPromise.wrapPrototype(GooglePayment);

},{"../lib/analytics":62,"../lib/assign":63,"../lib/braintree-error":66,"../lib/convert-methods-to-error":72,"../lib/generate-google-pay-configuration":80,"../lib/methods":85,"../lib/promise":87,"./errors":47,"@braintree/wrap-promise":21}],49:[function(require,module,exports){
'use strict';
/**
 * @module braintree-web/google-payment
 * @description A component to integrate with Google Pay. The majority of the integration uses [Google's pay.js JavaScript file](https://pay.google.com/gp/p/js/pay.js). The Braintree component generates the configuration object necessary for Google Pay to initiate the Payment Request and parse the returned data to retrieve the payment method nonce which is used to process the transaction on the server.
 */

var basicComponentVerification = require('../lib/basic-component-verification');
var BraintreeError = require('../lib/braintree-error');
var errors = require('./errors');
var GooglePayment = require('./google-payment');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var VERSION = "3.37.0";

/**
 * @static
 * @function create
 * @param {object} options Creation options:
 * @param {Client} options.client A {@link Client} instance.
 * @param {callback} [callback] The second argument, `data`, is the {@link GooglePayment} instance. If no callback is provided, `create` returns a promise that resolves with the {@link GooglePayment} instance.
 * @example <caption>Simple Example</caption>
 * // include https://pay.google.com/gp/p/js/pay.js in a script tag
 * // on your page to load the `google.payments.api.PaymentsClient` global object.
 *
 * var paymentButton = document.querySelector('#google-pay-button');
 * var paymentsClient = new google.payments.api.PaymentsClient({
 *   environment: 'TEST' // or 'PRODUCTION'
 * });
 *
 * braintree.client.create({
 *   authorization: 'tokenization-key-or-client-token'
 * }).then(function (clientInstance) {
 *   return braintree.googlePayment.create({
 *     client: clientInstance
 *   });
 * }).then(function (googlePaymentInstance) {
 *   paymentButton.addEventListener('click', function (event) {
 *     var paymentDataRequest;
 *
 *     event.preventDefault();
 *
 *     paymentDataRequest = googlePaymentInstance.createPaymentDataRequest({
 *       merchantId: 'your-merchant-id-from-google',
 *       transactionInfo: {
 *         currencyCode: 'USD',
 *         totalPriceStatus: 'FINAL',
 *         totalPrice: '100.00'
 *       }
 *     });
 *
 *     paymentsClient.loadPaymentData(paymentDataRequest).then(function (paymentData) {
 *       return googlePaymentInstance.parseResponse(paymentData);
 *     }).then(function (result) {
 *       // send result.nonce to your server
 *     }).catch(function (err) {
 *       // handle err
 *     });
 *   });
 * });
 * @example <caption>Check Browser and Customer Compatibility</caption>
 * var paymentsClient = new google.payments.api.PaymentsClient({
 *   environment: 'TEST' // or 'PRODUCTION'
 * });
 *
 * function setupGooglePayButton(googlePaymentInstance) {
 *   var button = document.createElement('button');
 *
 *   button.id = 'google-pay';
 *   button.appendChild(document.createTextNode('Google Pay'));
 *   button.addEventListener('click', function (event) {
 *     var paymentRequestData;
 *
 *     event.preventDefault();
 *
 *     paymentDataRequest = googlePaymentInstance.createPaymentDataRequest({
 *       merchantId: 'your-merchant-id-from-google',
 *       transactionInfo: {
 *         currencyCode: 'USD',
 *         totalPriceStatus: 'FINAL',
 *         totalPrice: '100.00' // your amount
 *       }
 *     });
 *
 *     paymentsClient.loadPaymentData(paymentDataRequest).then(function (paymentData) {
 *       return googlePaymentInstance.parseResponse(paymentData);
*       }).then(function (result) {
 *       // send result.nonce to your server
 *     }).catch(function (err) {
 *       // handle errors
 *     });
 *   });
 *
 *   document.getElementById('container').appendChild(button);
 * }
 *
 * braintree.client.create({
 *   authorization: 'tokenization-key-or-client-token'
 * }).then(function (clientInstance) {
 *   return braintree.googlePayment.create({
 *     client: clientInstance
 *   });
 * }).then(function (googlePaymentInstance) {
 *   return paymentsClient.isReadyToPay({
 *     allowedPaymentMethods: googlePaymentInstance.createPaymentDataRequest().allowedPaymentMethods
 *   });
 * }).then(function (response) {
 *   if (response.result) {
 *     setupGooglePayButton(googlePaymentInstance);
 *   }
 * }).catch(function (err) {
 *   // handle setup errors
 * });
 *
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
function create(options) {
  return basicComponentVerification.verify({
    name: 'Google Pay',
    client: options.client
  }).then(function () {
    if (!options.client.getConfiguration().gatewayConfiguration.androidPay) {
      return Promise.reject(new BraintreeError(errors.GOOGLE_PAYMENT_NOT_ENABLED));
    }

    return new GooglePayment(options);
  });
}

module.exports = {
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/basic-component-verification":64,"../lib/braintree-error":66,"../lib/promise":87,"./errors":47,"./google-payment":48,"@braintree/wrap-promise":21}],50:[function(require,module,exports){
'use strict';

var BraintreeError = require('../../lib/braintree-error');
var errors = require('../shared/errors');
var allowedAttributes = require('../shared/constants').allowedAttributes;

function attributeValidationError(attribute, value) {
  var err;

  if (!allowedAttributes.hasOwnProperty(attribute)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED.type,
      code: errors.HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED.code,
      message: 'The "' + attribute + '" attribute is not supported in Hosted Fields.'
    });
  } else if (value != null && !_isValid(attribute, value)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED.type,
      code: errors.HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED.code,
      message: 'Value "' + value + '" is not allowed for "' + attribute + '" attribute.'
    });
  }

  return err;
}

function _isValid(attribute, value) {
  if (allowedAttributes[attribute] === 'string') {
    return typeof value === 'string' || typeof value === 'number';
  } else if (allowedAttributes[attribute] === 'boolean') {
    return String(value) === 'true' || String(value) === 'false';
  }

  return false;
}

module.exports = attributeValidationError;

},{"../../lib/braintree-error":66,"../shared/constants":57,"../shared/errors":58}],51:[function(require,module,exports){
'use strict';

var constants = require('../shared/constants');
var useMin = require('../../lib/use-min');

module.exports = function composeUrl(assetsUrl, componentId, isDebug) {
  return assetsUrl +
    '/web/' +
    constants.VERSION +
    '/html/hosted-fields-frame' + useMin(isDebug) + '.html#' +
    componentId;
};

},{"../../lib/use-min":89,"../shared/constants":57}],52:[function(require,module,exports){
(function (global){
'use strict';

var allowedStyles = require('../shared/constants').allowedStyles;

module.exports = function getStylesFromClass(cssClass) {
  var element = document.createElement('input');
  var styles = {};
  var computedStyles;

  if (cssClass[0] === '.') {
    cssClass = cssClass.substring(1);
  }

  element.className = cssClass;
  element.style.display = 'none !important';
  element.style.position = 'fixed !important';
  element.style.left = '-99999px !important';
  element.style.top = '-99999px !important';
  global.document.body.appendChild(element);

  computedStyles = global.getComputedStyle(element);

  allowedStyles.forEach(function (style) {
    var value = computedStyles[style];

    if (value) {
      styles[style] = value;
    }
  });

  global.document.body.removeChild(element);

  return styles;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../shared/constants":57}],53:[function(require,module,exports){
'use strict';

var assign = require('../../lib/assign').assign;
var Destructor = require('../../lib/destructor');
var classlist = require('../../lib/classlist');
var iFramer = require('@braintree/iframer');
var Bus = require('../../lib/bus');
var BraintreeError = require('../../lib/braintree-error');
var composeUrl = require('./compose-url');
var getStylesFromClass = require('./get-styles-from-class');
var constants = require('../shared/constants');
var errors = require('../shared/errors');
var INTEGRATION_TIMEOUT_MS = require('../../lib/constants').INTEGRATION_TIMEOUT_MS;
var uuid = require('../../lib/vendor/uuid');
var findParentTags = require('../shared/find-parent-tags');
var browserDetection = require('../shared/browser-detection');
var events = constants.events;
var EventEmitter = require('../../lib/event-emitter');
var injectFrame = require('./inject-frame');
var analytics = require('../../lib/analytics');
var allowedFields = constants.allowedFields;
var methods = require('../../lib/methods');
var convertMethodsToError = require('../../lib/convert-methods-to-error');
var sharedErrors = require('../../lib/errors');
var getCardTypes = require('../shared/get-card-types');
var attributeValidationError = require('./attribute-validation-error');
var Promise = require('../../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');

/**
 * @typedef {object} HostedFields~tokenizePayload
 * @property {string} nonce The payment method nonce.
 * @property {object} details Additional account details.
 * @property {string} details.cardType Type of card, ex: Visa, MasterCard.
 * @property {string} details.lastFour Last four digits of card number.
 * @property {string} details.lastTwo Last two digits of card number.
 * @property {string} description A human-readable description.
 * @property {string} type The payment method type, always `CreditCard`.
 * @property {object} binData Information about the card based on the bin.
 * @property {string} binData.commercial Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.countryOfIssuance The country of issuance.
 * @property {string} binData.debit Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.durbinRegulated Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.healthcare Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.issuingBank The issuing bank.
 * @property {string} binData.payroll Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.prepaid Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.productId The product id.
 */

/**
 * @typedef {object} HostedFields~stateObject
 * @description The event payload sent from {@link HostedFields#on|on} or {@link HostedFields#getState|getState}.
 * @property {HostedFields~hostedFieldsCard[]} cards
 * This will return an array of potential {@link HostedFields~hostedFieldsCard|cards}. If the card type has been determined, the array will contain only one card.
 * Internally, Hosted Fields uses <a href="https://github.com/braintree/credit-card-type">credit-card-type</a>,
 * an open-source card detection library.
 * @property {string} emittedBy
 * The name of the field associated with an event. This will not be included if returned by {@link HostedFields#getState|getState}. It will be one of the following strings:<br>
 * - `"number"`
 * - `"cvv"`
 * - `"expirationDate"`
 * - `"expirationMonth"`
 * - `"expirationYear"`
 * - `"postalCode"`
 * @property {object} fields
 * @property {?HostedFields~hostedFieldsFieldData} fields.number {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the number field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.cvv {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the CVV field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.expirationDate {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the expiration date field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.expirationMonth {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the expiration month field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.expirationYear {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the expiration year field, if it is present.
 * @property {?HostedFields~hostedFieldsFieldData} fields.postalCode {@link HostedFields~hostedFieldsFieldData|hostedFieldsFieldData} for the postal code field, if it is present.
 */

/**
 * @typedef {object} HostedFields~hostedFieldsFieldData
 * @description Data about Hosted Fields fields, sent in {@link HostedFields~stateObject|stateObjects}.
 * @property {HTMLElement} container Reference to the container DOM element on your page associated with the current event.
 * @property {boolean} isFocused Whether or not the input is currently focused.
 * @property {boolean} isEmpty Whether or not the user has entered a value in the input.
 * @property {boolean} isPotentiallyValid
 * A determination based on the future validity of the input value.
 * This is helpful when a user is entering a card number and types <code>"41"</code>.
 * While that value is not valid for submission, it is still possible for
 * it to become a fully qualified entry. However, if the user enters <code>"4x"</code>
 * it is clear that the card number can never become valid and isPotentiallyValid will
 * return false.
 * @property {boolean} isValid Whether or not the value of the associated input is <i>fully</i> qualified for submission.
 */

/**
 * @typedef {object} HostedFields~hostedFieldsCard
 * @description Information about the card type, sent in {@link HostedFields~stateObject|stateObjects}.
 * @property {string} type The code-friendly representation of the card type. It will be one of the following strings:
 * - `american-express`
 * - `diners-club`
 * - `discover`
 * - `jcb`
 * - `maestro`
 * - `master-card`
 * - `unionpay`
 * - `visa`
 * @property {string} niceType The pretty-printed card type. It will be one of the following strings:
 * - `American Express`
 * - `Diners Club`
 * - `Discover`
 * - `JCB`
 * - `Maestro`
 * - `MasterCard`
 * - `UnionPay`
 * - `Visa`
 * @property {object} code
 * This object contains data relevant to the security code requirements of the card brand.
 * For example, on a Visa card there will be a <code>CVV</code> of 3 digits, whereas an
 * American Express card requires a 4-digit <code>CID</code>.
 * @property {string} code.name <code>"CVV"</code> <code>"CID"</code> <code>"CVC"</code>
 * @property {number} code.size The expected length of the security code. Typically, this is 3 or 4.
 */

/**
 * @name HostedFields#on
 * @function
 * @param {string} event The name of the event to which you are subscribing.
 * @param {function} handler A callback to handle the event.
 * @description Subscribes a handler function to a named event. `event` should be {@link HostedFields#event:blur|blur}, {@link HostedFields#event:focus|focus}, {@link HostedFields#event:empty|empty}, {@link HostedFields#event:notEmpty|notEmpty}, {@link HostedFields#event:cardTypeChange|cardTypeChange}, or {@link HostedFields#event:validityChange|validityChange}. Events will emit a {@link HostedFields~stateObject|stateObject}.
 * @example
 * <caption>Listening to a Hosted Field event, in this case 'focus'</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('focus', function (event) {
 *     console.log(event.emittedBy, 'has been focused');
 *   });
 * });
 * @returns {void}
 */

/**
 * This event is emitted when the user requests submission of an input field, such as by pressing the Enter or Return key on their keyboard, or mobile equivalent.
 * @event HostedFields#inputSubmitRequest
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Clicking a submit button upon hitting Enter (or equivalent) within a Hosted Field</caption>
 * var hostedFields = require('braintree-web/hosted-fields');
 * var submitButton = document.querySelector('input[type="submit"]');
 *
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('inputSubmitRequest', function () {
 *     // User requested submission, e.g. by pressing Enter or equivalent
 *     submitButton.click();
 *   });
 * });
 */

/**
 * This event is emitted when a field transitions from having data to being empty.
 * @event HostedFields#empty
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to an empty event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('empty', function (event) {
 *     console.log(event.emittedBy, 'is now empty');
 *   });
 * });
 */

/**
 * This event is emitted when a field transitions from being empty to having data.
 * @event HostedFields#notEmpty
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to an notEmpty event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('notEmpty', function (event) {
 *     console.log(event.emittedBy, 'is now not empty');
 *   });
 * });
 */

/**
 * This event is emitted when a field loses focus.
 * @event HostedFields#blur
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to a blur event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('blur', function (event) {
 *     console.log(event.emittedBy, 'lost focus');
 *   });
 * });
 */

/**
 * This event is emitted when a field gains focus.
 * @event HostedFields#focus
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to a focus event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('focus', function (event) {
 *     console.log(event.emittedBy, 'gained focus');
 *   });
 * });
 */

/**
 * This event is emitted when activity within the number field has changed such that the possible card type has changed.
 * @event HostedFields#cardTypeChange
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to a cardTypeChange event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('cardTypeChange', function (event) {
 *     if (event.cards.length === 1) {
 *       console.log(event.cards[0].type);
 *     } else {
 *       console.log('Type of card not yet known');
 *     }
 *   });
 * });
 */

/**
 * This event is emitted when the validity of a field has changed. Validity is represented in the {@link HostedFields~stateObject|stateObject} as two booleans: `isValid` and `isPotentiallyValid`.
 * @event HostedFields#validityChange
 * @type {HostedFields~stateObject}
 * @example
 * <caption>Listening to a validityChange event</caption>
 * hostedFields.create({ ... }, function (createErr, hostedFieldsInstance) {
 *   hostedFieldsInstance.on('validityChange', function (event) {
 *     var field = event.fields[event.emittedBy];
 *
 *     if (field.isValid) {
 *       console.log(event.emittedBy, 'is fully valid');
 *     } else if (field.isPotentiallyValid) {
 *       console.log(event.emittedBy, 'is potentially valid');
 *     } else {
 *       console.log(event.emittedBy, 'is not valid');
 *     }
 *   });
 * });
 */

function createInputEventHandler(fields) {
  return function (eventData) {
    var field;
    var merchantPayload = eventData.merchantPayload;
    var emittedBy = merchantPayload.emittedBy;
    var container = fields[emittedBy].containerElement;

    Object.keys(merchantPayload.fields).forEach(function (key) {
      merchantPayload.fields[key].container = fields[key].containerElement;
    });

    field = merchantPayload.fields[emittedBy];

    if (eventData.type === 'blur') {
      performBlurFixForIos(container);
    }

    classlist.toggle(container, constants.externalClasses.FOCUSED, field.isFocused);
    classlist.toggle(container, constants.externalClasses.VALID, field.isValid);
    classlist.toggle(container, constants.externalClasses.INVALID, !field.isPotentiallyValid);

    this._state = { // eslint-disable-line no-invalid-this
      cards: merchantPayload.cards,
      fields: merchantPayload.fields
    };

    this._emit(eventData.type, merchantPayload); // eslint-disable-line no-invalid-this
  };
}

// iOS Safari has a bug where inputs in iframes
// will not dismiss the keyboard when they lose
// focus. We create a hidden button input that we
// can focus on and blur to force the keyboard to
// dismiss. See #229
function performBlurFixForIos(container) {
  var hiddenInput;

  if (!browserDetection.isIos()) {
    return;
  }

  if (document.activeElement === document.body) {
    hiddenInput = container.querySelector('input');

    if (!hiddenInput) {
      hiddenInput = document.createElement('input');

      hiddenInput.type = 'button';
      hiddenInput.style.height = '0px';
      hiddenInput.style.width = '0px';
      hiddenInput.style.opacity = '0';
      hiddenInput.style.padding = '0';
      hiddenInput.style.position = 'absolute';
      hiddenInput.style.left = '-200%';
      hiddenInput.style.top = '0px';

      container.insertBefore(hiddenInput, container.firstChild);
    }

    hiddenInput.focus();
    hiddenInput.blur();
  }
}

/**
 * @class HostedFields
 * @param {object} options The Hosted Fields {@link module:braintree-web/hosted-fields.create create} options.
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web/hosted-fields.create|braintree-web.hosted-fields.create} instead.</strong>
 * @classdesc This class represents a Hosted Fields component produced by {@link module:braintree-web/hosted-fields.create|braintree-web/hosted-fields.create}. Instances of this class have methods for interacting with the input fields within Hosted Fields' iframes.
 */
function HostedFields(options) {
  var failureTimeout, clientConfig, hostedFieldsUrl;
  var self = this;
  var fields = {};
  var busOptions = assign({}, options);
  var fieldCount = 0;
  var componentId = uuid();

  clientConfig = options.client.getConfiguration();
  hostedFieldsUrl = composeUrl(clientConfig.gatewayConfiguration.assetsUrl, componentId, clientConfig.isDebug);

  if (!options.fields || Object.keys(options.fields).length === 0) {
    throw new BraintreeError({
      type: sharedErrors.INSTANTIATION_OPTION_REQUIRED.type,
      code: sharedErrors.INSTANTIATION_OPTION_REQUIRED.code,
      message: 'options.fields is required when instantiating Hosted Fields.'
    });
  }

  EventEmitter.call(this);

  this._injectedNodes = [];
  this._destructor = new Destructor();
  this._fields = fields;
  this._state = {
    fields: {},
    cards: getCardTypes('')
  };

  this._bus = new Bus({
    channel: componentId,
    merchantUrl: location.href
  });

  this._destructor.registerFunctionForTeardown(function () {
    self._bus.teardown();
  });

  this._client = options.client;

  analytics.sendEvent(this._client, 'custom.hosted-fields.initialized');

  Object.keys(options.fields).forEach(function (key) {
    var field, container, frame;

    if (!constants.allowedFields.hasOwnProperty(key)) {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_INVALID_FIELD_KEY.type,
        code: errors.HOSTED_FIELDS_INVALID_FIELD_KEY.code,
        message: '"' + key + '" is not a valid field.'
      });
    }

    field = options.fields[key];

    container = document.querySelector(field.selector);

    if (!container) {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_INVALID_FIELD_SELECTOR.type,
        code: errors.HOSTED_FIELDS_INVALID_FIELD_SELECTOR.code,
        message: errors.HOSTED_FIELDS_INVALID_FIELD_SELECTOR.message,
        details: {
          fieldSelector: field.selector,
          fieldKey: key
        }
      });
    } else if (container.querySelector('iframe[name^="braintree-"]')) {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME.type,
        code: errors.HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME.code,
        message: errors.HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME.message,
        details: {
          fieldSelector: field.selector,
          fieldKey: key
        }
      });
    }

    if (field.maxlength && typeof field.maxlength !== 'number') {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.type,
        code: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.code,
        message: 'The value for maxlength must be a number.',
        details: {
          fieldKey: key
        }
      });
    }

    if (field.minlength && typeof field.minlength !== 'number') {
      throw new BraintreeError({
        type: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.type,
        code: errors.HOSTED_FIELDS_FIELD_PROPERTY_INVALID.code,
        message: 'The value for minlength must be a number.',
        details: {
          fieldKey: key
        }
      });
    }

    frame = iFramer({
      type: key,
      name: 'braintree-hosted-field-' + key,
      style: constants.defaultIFrameStyle,
      title: 'Secure Credit Card Frame - ' + constants.allowedFields[key].label
    });

    this._injectedNodes = this._injectedNodes.concat(injectFrame(frame, container));
    this._setupLabelFocus(key, container);
    fields[key] = {
      frameElement: frame,
      containerElement: container
    };
    fieldCount++;

    this._state.fields[key] = {
      isEmpty: true,
      isValid: false,
      isPotentiallyValid: true,
      isFocused: false,
      container: container
    };

    setTimeout(function () {
      // Edge has an intermittent issue where
      // the iframes load, but the JavaScript
      // can't message out to the parent page.
      // We can fix this by setting the src
      // to about:blank first followed by
      // the actual source. Both instances
      // of setting the src need to be in a
      // setTimeout to work.
      if (browserDetection.isIE() || browserDetection.isEdge()) {
        frame.src = 'about:blank';
        setTimeout(function () {
          frame.src = hostedFieldsUrl;
        }, 0);
      } else {
        frame.src = hostedFieldsUrl;
      }
    }, 0);
  }.bind(this));

  // TODO rejecting unsupported cards should be the default behavior after the next major revision
  if (options.fields.number && options.fields.number.rejectUnsupportedCards) {
    busOptions.supportedCardTypes = clientConfig.gatewayConfiguration.creditCards.supportedCardTypes;
  }

  if (busOptions.styles) {
    Object.keys(busOptions.styles).forEach(function (selector) {
      var className = busOptions.styles[selector];

      if (typeof className === 'string') {
        busOptions.styles[selector] = getStylesFromClass(className);
      }
    });
  }

  failureTimeout = setTimeout(function () {
    analytics.sendEvent(self._client, 'custom.hosted-fields.load.timed-out');
    self._emit('timeout');
  }, INTEGRATION_TIMEOUT_MS);

  this._bus.on(events.FRAME_READY, function (reply) {
    fieldCount--;
    if (fieldCount === 0) {
      clearTimeout(failureTimeout);
      reply(busOptions);
      self._emit('ready');
    }
  });

  this._bus.on(
    events.INPUT_EVENT,
    createInputEventHandler(fields).bind(this)
  );

  this._destructor.registerFunctionForTeardown(function () {
    var j, node, parent;

    for (j = 0; j < self._injectedNodes.length; j++) {
      node = self._injectedNodes[j];
      parent = node.parentNode;

      parent.removeChild(node);

      classlist.remove(
        parent,
        constants.externalClasses.FOCUSED,
        constants.externalClasses.INVALID,
        constants.externalClasses.VALID
      );
    }
  });

  this._destructor.registerFunctionForTeardown(function () {
    var methodNames = methods(HostedFields.prototype).concat(methods(EventEmitter.prototype));

    convertMethodsToError(self, methodNames);
  });
}

HostedFields.prototype = Object.create(EventEmitter.prototype, {
  constructor: HostedFields
});

HostedFields.prototype._setupLabelFocus = function (type, container) {
  var labels, i;
  var shouldSkipLabelFocus = browserDetection.isIos();
  var bus = this._bus;

  if (shouldSkipLabelFocus) { return; }
  if (container.id == null) { return; }

  function triggerFocus() {
    bus.emit(events.TRIGGER_INPUT_FOCUS, type);
  }

  labels = Array.prototype.slice.call(document.querySelectorAll('label[for="' + container.id + '"]'));
  labels = labels.concat(findParentTags(container, 'label'));

  for (i = 0; i < labels.length; i++) {
    labels[i].addEventListener('click', triggerFocus, false);
  }

  this._destructor.registerFunctionForTeardown(function () {
    for (i = 0; i < labels.length; i++) {
      labels[i].removeEventListener('click', triggerFocus, false);
    }
  });
};

HostedFields.prototype._attachInvalidFieldContainersToError = function (err) {
  if (!(err.details && err.details.invalidFieldKeys && err.details.invalidFieldKeys.length > 0)) {
    return;
  }
  err.details.invalidFields = {};
  err.details.invalidFieldKeys.forEach(function (field) {
    err.details.invalidFields[field] = this._fields[field].containerElement;
  }.bind(this));
};

/**
 * Cleanly remove anything set up by {@link module:braintree-web/hosted-fields.create|create}.
 * @public
 * @param {callback} [callback] Called on completion, containing an error if one occurred. No data is returned if teardown completes successfully. If no callback is provided, `teardown` returns a promise.
 * @example
 * hostedFieldsInstance.teardown(function (teardownErr) {
 *   if (teardownErr) {
 *     console.error('Could not tear down Hosted Fields!');
 *   } else {
 *     console.info('Hosted Fields has been torn down!');
 *   }
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
HostedFields.prototype.teardown = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    self._destructor.teardown(function (err) {
      analytics.sendEvent(self._client, 'custom.hosted-fields.teardown-completed');

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Tokenizes fields and returns a nonce payload.
 * @public
 * @param {object} [options] All tokenization options for the Hosted Fields component.
 * @param {boolean} [options.vault=false] When true, will vault the tokenized card. Cards will only be vaulted when using a client created with a client token that includes a customer ID.
 * @param {string} [options.cardholderName] When supplied, the cardholder name to be tokenized with the contents of the fields.
 * @param {string} [options.billingAddress.postalCode] When supplied, this postal code will be tokenized along with the contents of the fields. If a postal code is provided as part of the Hosted Fields configuration, the value of the field will be tokenized and this value will be ignored.
 * @param {string} [options.billingAddress.firstName] When supplied, this customer first name will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.lastName] When supplied, this customer last name will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.company] When supplied, this company name will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.streetAddress] When supplied, this street address will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.extendedAddress] When supplied, this extended address will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.locality] When supplied, this locality (the city) will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.region] When supplied, this region (the state) will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.countryCodeNumeric] When supplied, this numeric country code will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.countryCodeAlpha2] When supplied, this alpha 2 representation of a country will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.countryCodeAlpha3] When supplied, this alpha 3 representation of a country will be tokenized along with the contents of the fields.
 * @param {string} [options.billingAddress.countryName] When supplied, this country name will be tokenized along with the contents of the fields.
 *
 * @param {callback} [callback] The second argument, <code>data</code>, is a {@link HostedFields~tokenizePayload|tokenizePayload}. If no callback is provided, `tokenize` returns a function that resolves with a {@link HostedFields~tokenizePayload|tokenizePayload}.
 * @example <caption>Tokenize a card</caption>
 * hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     switch (tokenizeErr.code) {
 *       case 'HOSTED_FIELDS_FIELDS_EMPTY':
 *         // occurs when none of the fields are filled in
 *         console.error('All fields are empty! Please fill out the form.');
 *         break;
 *       case 'HOSTED_FIELDS_FIELDS_INVALID':
 *         // occurs when certain fields do not pass client side validation
 *         console.error('Some fields are invalid:', tokenizeErr.details.invalidFieldKeys);
 *
 *         // you can also programtically access the field containers for the invalid fields
 *         tokenizeErr.details.invalidFields.forEach(function (fieldContainer) {
 *           fieldContainer.className = 'invalid';
 *         });
 *         break;
 *       case 'HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE':
 *         // occurs when:
 *         //   * the client token used for client authorization was generated
 *         //     with a customer ID and the fail on duplicate payment method
 *         //     option is set to true
 *         //   * the card being tokenized has previously been vaulted (with any customer)
 *         // See: https://developers.braintreepayments.com/reference/request/client-token/generate/#options.fail_on_duplicate_payment_method
 *         console.error('This payment method already exists in your vault.');
 *         break;
 *       case 'HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED':
 *         // occurs when:
 *         //   * the client token used for client authorization was generated
 *         //     with a customer ID and the verify card option is set to true
 *         //     and you have credit card verification turned on in the Braintree
 *         //     control panel
 *         //   * the cvv does not pass verfication (https://developers.braintreepayments.com/reference/general/testing/#avs-and-cvv/cid-responses)
 *         // See: https://developers.braintreepayments.com/reference/request/client-token/generate/#options.verify_card
 *         console.error('CVV did not pass verification');
 *         break;
 *       case 'HOSTED_FIELDS_FAILED_TOKENIZATION':
 *         // occurs for any other tokenization error on the server
 *         console.error('Tokenization failed server side. Is the card valid?');
 *         break;
 *       case 'HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR':
 *         // occurs when the Braintree gateway cannot be contacted
 *         console.error('Network error occurred when tokenizing.');
 *         break;
 *       default:
 *         console.error('Something bad happened!', tokenizeErr);
 *     }
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Tokenize and vault a card</caption>
 * hostedFieldsInstance.tokenize({
 *   vault: true
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Tokenize a card with cardholder name</caption>
 * hostedFieldsInstance.tokenize({
 *   cardholderName: 'First Last'
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Tokenize a card with the postal code option</caption>
 * hostedFieldsInstance.tokenize({
 *   billingAddress: {
 *     postalCode: '11111'
 *   }
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @example <caption>Tokenize a card with additional billing address options</caption>
 * hostedFieldsInstance.tokenize({
 *   billingAddress: {
 *     firstName: 'First',
 *     lastName: 'Last',
 *     company: 'Company',
 *     streetAddress: '123 Street',
 *     extendedAddress: 'Unit 1',
 *     // passing just one of the country options is sufficient to
 *     // associate the card details with a particular country
 *     // valid country names and codes can be found here:
 *     // https://developers.braintreepayments.com/reference/general/countries/ruby#list-of-countries
 *     countryName: 'United States',
 *     countryCodeAlpha2: 'US',
 *     countryCodeAlpha3: 'USA',
 *     countryCodeNumeric: '840'
 *   }
 * }, function (tokenizeErr, payload) {
 *   if (tokenizeErr) {
 *     console.error(tokenizeErr);
 *   } else {
 *     console.log('Got nonce:', payload.nonce);
 *   }
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
HostedFields.prototype.tokenize = function (options) {
  var self = this;

  if (!options) {
    options = {};
  }

  return new Promise(function (resolve, reject) {
    self._bus.emit(events.TOKENIZATION_REQUEST, options, function (response) {
      var err = response[0];
      var payload = response[1];

      if (err) {
        self._attachInvalidFieldContainersToError(err);
        reject(new BraintreeError(err));
      } else {
        resolve(payload);
      }
    });
  });
};

/**
 * Add a class to a {@link module:braintree-web/hosted-fields~field field}. Useful for updating field styles when events occur elsewhere in your checkout.
 * @public
 * @param {string} field The field you wish to add a class to. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} classname The class to be added.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the class is added successfully.
 *
 * @example
 * hostedFieldsInstance.addClass('number', 'custom-class', function (addClassErr) {
 *   if (addClassErr) {
 *     console.error(addClassErr);
 *   }
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
HostedFields.prototype.addClass = function (field, classname) {
  var err;

  if (!allowedFields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + field + '" is not a valid field. You must use a valid field option when adding a class.'
    });
  } else if (!this._fields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot add class to "' + field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    this._bus.emit(events.ADD_CLASS, field, classname);
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Removes a class to a {@link module:braintree-web/hosted-fields~field field}. Useful for updating field styles when events occur elsewhere in your checkout.
 * @public
 * @param {string} field The field you wish to remove a class from. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} classname The class to be removed.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the class is removed successfully.
 *
 * @example
 * hostedFieldsInstance.addClass('number', 'custom-class', function (addClassErr) {
 *   if (addClassErr) {
 *     console.error(addClassErr);
 *     return;
 *   }
 *
 *   // some time later...
 *   hostedFieldsInstance.removeClass('number', 'custom-class');
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
HostedFields.prototype.removeClass = function (field, classname) {
  var err;

  if (!allowedFields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + field + '" is not a valid field. You must use a valid field option when removing a class.'
    });
  } else if (!this._fields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot remove class from "' + field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    this._bus.emit(events.REMOVE_CLASS, field, classname);
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Sets an attribute of a {@link module:braintree-web/hosted-fields~field field}.
 * Supported attributes are `aria-invalid`, `aria-required`, `disabled`, and `placeholder`.
 *
 * @public
 * @param {object} options The options for the attribute you wish to set.
 * @param {string} options.field The field to which you wish to add an attribute. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} options.attribute The name of the attribute you wish to add to the field.
 * @param {string} options.value The value for the attribute.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the attribute is set successfully.
 *
 * @example <caption>Set the placeholder attribute of a field</caption>
 * hostedFieldsInstance.setAttribute({
 *   field: 'number',
 *   attribute: 'placeholder',
 *   value: '1111 1111 1111 1111'
 * }, function (attributeErr) {
 *   if (attributeErr) {
 *     console.error(attributeErr);
 *   }
 * });
 *
 * @example <caption>Set the aria-required attribute of a field</caption>
 * hostedFieldsInstance.setAttribute({
 *   field: 'number',
 *   attribute: 'aria-required',
 *   value: true
 * }, function (attributeErr) {
 *   if (attributeErr) {
 *     console.error(attributeErr);
 *   }
 * });
 *
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
HostedFields.prototype.setAttribute = function (options) {
  var attributeErr, err;

  if (!allowedFields.hasOwnProperty(options.field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + options.field + '" is not a valid field. You must use a valid field option when setting an attribute.'
    });
  } else if (!this._fields.hasOwnProperty(options.field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot set attribute for "' + options.field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    attributeErr = attributeValidationError(options.attribute, options.value);

    if (attributeErr) {
      err = attributeErr;
    } else {
      this._bus.emit(events.SET_ATTRIBUTE, options.field, options.attribute, options.value);
    }
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Sets a visually hidden message (for screenreaders) on a {@link module:braintree-web/hosted-fields~field field}.
 *
 * @public
 * @param {object} options The options for the attribute you wish to set.
 * @param {string} options.field The field to which you wish to add an attribute. Must be a valid {@link module:braintree-web/hosted-fields~field field}.
 * @param {string} options.message The message to set.
 *
 * @example <caption>Set an error message on a field</caption>
 * hostedFieldsInstance.setMessage({
 *   field: 'number',
 *   message: 'Invalid card number'
 * });
 *
 * @example <caption>Remove the message on a field</caption>
 * hostedFieldsInstance.setMessage({
 *   field: 'number',
 *   message: ''
 * });
 *
 * @returns {void}
 */
HostedFields.prototype.setMessage = function (options) {
  this._bus.emit(events.SET_MESSAGE, options.field, options.message);
};

/**
 * Removes a supported attribute from a {@link module:braintree-web/hosted-fields~field field}.
 *
 * @public
 * @param {object} options The options for the attribute you wish to remove.
 * @param {string} options.field The field from which you wish to remove an attribute. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} options.attribute The name of the attribute you wish to remove from the field.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the attribute is removed successfully.
 *
 * @example <caption>Remove the placeholder attribute of a field</caption>
 * hostedFieldsInstance.removeAttribute({
 *   field: 'number',
 *   attribute: 'placeholder'
 * }, function (attributeErr) {
 *   if (attributeErr) {
 *     console.error(attributeErr);
 *   }
 * });
 *
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
HostedFields.prototype.removeAttribute = function (options) {
  var attributeErr, err;

  if (!allowedFields.hasOwnProperty(options.field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + options.field + '" is not a valid field. You must use a valid field option when removing an attribute.'
    });
  } else if (!this._fields.hasOwnProperty(options.field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot remove attribute for "' + options.field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    attributeErr = attributeValidationError(options.attribute);

    if (attributeErr) {
      err = attributeErr;
    } else {
      this._bus.emit(events.REMOVE_ATTRIBUTE, options.field, options.attribute);
    }
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * @deprecated since version 3.8.0. Use {@link HostedFields#setAttribute|setAttribute} instead.
 *
 * @public
 * @param {string} field The field whose placeholder you wish to change. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {string} placeholder Will be used as the `placeholder` attribute of the input.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the placeholder updated successfully.
 *
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
HostedFields.prototype.setPlaceholder = function (field, placeholder) {
  return this.setAttribute({
    field: field,
    attribute: 'placeholder',
    value: placeholder
  });
};

/**
 * Clear the value of a {@link module:braintree-web/hosted-fields~field field}.
 * @public
 * @param {string} field The field you wish to clear. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the field cleared successfully.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * hostedFieldsInstance.clear('number', function (clearErr) {
 *   if (clearErr) {
 *     console.error(clearErr);
 *   }
 * });
 *
 * @example <caption>Clear several fields</caption>
 * hostedFieldsInstance.clear('number');
 * hostedFieldsInstance.clear('cvv');
 * hostedFieldsInstance.clear('expirationDate');
 */
HostedFields.prototype.clear = function (field) {
  var err;

  if (!allowedFields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + field + '" is not a valid field. You must use a valid field option when clearing a field.'
    });
  } else if (!this._fields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot clear "' + field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    this._bus.emit(events.CLEAR_FIELD, field);
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Programmatically focus a {@link module:braintree-web/hosted-fields~field field}.
 * @public
 * @param {string} field The field you want to focus. Must be a valid {@link module:braintree-web/hosted-fields~fieldOptions fieldOption}.
 * @param {callback} [callback] Callback executed on completion, containing an error if one occurred. No data is returned if the field focused successfully.
 * @returns {void}
 * @example
 * hostedFieldsInstance.focus('number', function (focusErr) {
 *   if (focusErr) {
 *     console.error(focusErr);
 *   }
 * });
 * @example <caption>Using an event listener</caption>
 * myElement.addEventListener('click', function (e) {
 *   // In Firefox, the focus method can be suppressed
 *   //   if the element has a tabindex property or the element
 *   //   is an anchor link with an href property.
 *   // In Mobile Safari, the focus method is unable to
 *   //   programatically open the keyboard, as only
 *   //   touch events are allowed to do so.
 *   e.preventDefault();
 *   hostedFieldsInstance.focus('number');
 * });
 */
HostedFields.prototype.focus = function (field) {
  var err;

  if (!allowedFields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_INVALID.type,
      code: errors.HOSTED_FIELDS_FIELD_INVALID.code,
      message: '"' + field + '" is not a valid field. You must use a valid field option when focusing a field.'
    });
  } else if (!this._fields.hasOwnProperty(field)) {
    err = new BraintreeError({
      type: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.type,
      code: errors.HOSTED_FIELDS_FIELD_NOT_PRESENT.code,
      message: 'Cannot focus "' + field + '" field because it is not part of the current Hosted Fields options.'
    });
  } else {
    this._bus.emit(events.TRIGGER_INPUT_FOCUS, field);
  }

  if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

/**
 * Returns an {@link HostedFields~stateObject|object} that includes the state of all fields and possible card types.
 * @public
 * @returns {object} {@link HostedFields~stateObject|stateObject}
 * @example <caption>Check if all fields are valid</caption>
 * var state = hostedFieldsInstance.getState();
 *
 * var formValid = Object.keys(state.fields).every(function (key) {
 *   return state.fields[key].isValid;
 * });
 */
HostedFields.prototype.getState = function () {
  return this._state;
};

module.exports = wrapPromise.wrapPrototype(HostedFields);

},{"../../lib/analytics":62,"../../lib/assign":63,"../../lib/braintree-error":66,"../../lib/bus":69,"../../lib/classlist":70,"../../lib/constants":71,"../../lib/convert-methods-to-error":72,"../../lib/destructor":76,"../../lib/errors":78,"../../lib/event-emitter":79,"../../lib/methods":85,"../../lib/promise":87,"../../lib/vendor/uuid":91,"../shared/browser-detection":56,"../shared/constants":57,"../shared/errors":58,"../shared/find-parent-tags":59,"../shared/get-card-types":60,"./attribute-validation-error":50,"./compose-url":51,"./get-styles-from-class":52,"./inject-frame":54,"@braintree/iframer":14,"@braintree/wrap-promise":21}],54:[function(require,module,exports){
'use strict';

module.exports = function injectFrame(frame, container) {
  var clearboth = document.createElement('div');
  var fragment = document.createDocumentFragment();

  clearboth.style.clear = 'both';

  fragment.appendChild(frame);
  fragment.appendChild(clearboth);

  container.appendChild(fragment);

  return [frame, clearboth];
};

},{}],55:[function(require,module,exports){
'use strict';
/** @module braintree-web/hosted-fields */

var HostedFields = require('./external/hosted-fields');
var basicComponentVerification = require('../lib/basic-component-verification');
var errors = require('./shared/errors');
var supportsInputFormatting = require('restricted-input/supports-input-formatting');
var wrapPromise = require('@braintree/wrap-promise');
var BraintreeError = require('../lib/braintree-error');
var Promise = require('../lib/promise');
var VERSION = "3.37.0";

/**
 * Fields used in {@link module:braintree-web/hosted-fields~fieldOptions fields options}
 * @typedef {object} field
 * @property {string} selector A CSS selector to find the container where the hosted field will be inserted.
 * @property {string} [placeholder] Will be used as the `placeholder` attribute of the input. If `placeholder` is not natively supported by the browser, it will be polyfilled.
 * @property {string} [type] Will be used as the `type` attribute of the input. To mask `cvv` input, for instance, `type: "password"` can be used.
 * @property {boolean} [formatInput=true] Enable or disable automatic formatting on this field.
 * @property {object|boolean} [maskInput=false] Enable or disable input masking when input is not focused. If set to `true` instead of an object, the defaults for the `maskInput` parameters will be used.
 * @property {string} [maskInput.character=•] The character to use when masking the input. The default character ('•') uses a unicode symbol, so the webpage must support UTF-8 characters when using the default.
 * @property {Boolean} [maskInput.showLastFour=false] Only applicable for the credit card field. Whether or not to show the last 4 digits of the card when masking.
 * @property {object|boolean} [select] If truthy, this field becomes a `<select>` dropdown list. This can only be used for `expirationMonth` and `expirationYear` fields. If you do not use a `placeholder` property for the field, the current month/year will be the default selected value.
 * @property {string[]} [select.options] An array of 12 strings, one per month. This can only be used for the `expirationMonth` field. For example, the array can look like `['01 - January', '02 - February', ...]`.
 * @property {number} [maxlength] This option applies only to the CVV and postal code fields. Will be used as the `maxlength` attribute of the input if it is less than the default. The primary use cases for the `maxlength` option are: limiting the length of the CVV input for CVV-only verifications when the card type is known and limiting the length of the postal code input when cards are coming from a known region.
 * @property {number} [minlength=3] This option applies only to the cvv and postal code fields. Will be used as the `minlength` attribute of the input.
 * For postal code fields, the default value is 3, representing the Icelandic postal code length. This option's primary use case is to increase the `minlength`, e.g. for US customers, the postal code `minlength` can be set to 5.
 * For cvv fields, the default value is 3. The `minlength` attribute only applies to integrations capturing a cvv without a number field.
 * @property {string} [prefill] A value to prefill the field with. For example, when creating an update card form, you can prefill the expiration date fields with the old expiration date data.
 * @property {boolean} [rejectUnsupportedCards=false] Only allow card types that your merchant account is able to process. Unsupported card types will invalidate the card form. e.g. if you only process Visa cards, a customer entering a American Express card would get an invalid card field. This can only be used for the `number` field.
 */

/**
 * An object that has {@link module:braintree-web/hosted-fields~field field objects} for each field. Used in {@link module:braintree-web/hosted-fields~create create}.
 * @typedef {object} fieldOptions
 * @property {field} [number] A field for card number.
 * @property {field} [expirationDate] A field for expiration date in `MM/YYYY` format. This should not be used with the `expirationMonth` and `expirationYear` properties.
 * @property {field} [expirationMonth] A field for expiration month in `MM` format. This should be used with the `expirationYear` property.
 * @property {field} [expirationYear] A field for expiration year in `YYYY` format. This should be used with the `expirationMonth` property.
 * @property {field} [cvv] A field for 3 or 4 digit card verification code (like CVV or CID). If you wish to create a CVV-only payment method nonce to verify a card already stored in your Vault, omit all other fields to only collect CVV.
 * @property {field} [postalCode] A field for postal or region code.
 */

/**
 * An object that represents CSS that will be applied in each hosted field. This object looks similar to CSS. Typically, these styles involve fonts (such as `font-family` or `color`).
 *
 * You may also pass the name of a class on your site that contains the styles you would like to apply. The style properties will be automatically pulled off the class and applied to the Hosted Fields inputs. Note: this is recomended for `input` elements only. If using a `select` for the expiration date, unexpected styling may occur.
 *
 * These are the CSS properties that Hosted Fields supports. Any other CSS should be specified on your page and outside of any Braintree configuration. Trying to set unsupported properties will fail and put a warning in the console.
 *
 * Supported CSS properties are:
 * `appearance`
 * `color`
 * `direction`
 * `font-family`
 * `font-size-adjust`
 * `font-size`
 * `font-stretch`
 * `font-style`
 * `font-variant-alternates`
 * `font-variant-caps`
 * `font-variant-east-asian`
 * `font-variant-ligatures`
 * `font-variant-numeric`
 * `font-variant`
 * `font-weight`
 * `font`
 * `letter-spacing`
 * `line-height`
 * `opacity`
 * `outline`
 * `padding`
 * `text-shadow`
 * `transition`
 * `-moz-appearance`
 * `-moz-osx-font-smoothing`
 * `-moz-tap-highlight-color`
 * `-moz-transition`
 * `-webkit-appearance`
 * `-webkit-font-smoothing`
 * `-webkit-tap-highlight-color`
 * `-webkit-transition`
 * @typedef {object} styleOptions
 */

/**
 * @static
 * @function create
 * @param {object} options Creation options:
 * @param {Client} options.client A {@link Client} instance.
 * @param {fieldOptions} options.fields A {@link module:braintree-web/hosted-fields~fieldOptions set of options for each field}.
 * @param {styleOptions} [options.styles] {@link module:braintree-web/hosted-fields~styleOptions Styles} applied to each field.
 * @param {callback} [callback] The second argument, `data`, is the {@link HostedFields} instance. If no callback is provided, `create` returns a promise that resolves with the {@link HostedFields} instance.
 * @returns {void}
 * @example
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   styles: {
 *     'input': {
 *       'font-size': '16pt',
 *       'color': '#3A3A3A'
 *     },
 *     '.number': {
 *       'font-family': 'monospace'
 *     },
 *     '.valid': {
 *       'color': 'green'
 *     }
 *   },
 *   fields: {
 *     number: {
 *       selector: '#card-number'
 *     },
 *     cvv: {
 *       selector: '#cvv',
 *       placeholder: '•••'
 *     },
 *     expirationDate: {
 *       selector: '#expiration-date',
 *       type: 'month'
 *     }
 *   }
 * }, callback);
 * @example <caption>Applying styles with a class name</caption>
 * // in document head
 * <style>
 *   .braintree-input-class {
 *     color: black;
 *   }
 *   .braintree-valid-class {
 *     color: green;
 *   }
 *   .braintree-invalid-class {
 *     color: red;
 *   }
 * </style>
 * // in a script tag
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   styles: {
 *     'input': 'braintree-input-class',
 *     '.invalid': 'braintree-invalid-class',
 *     '.valid': {
 *       // you can also use the object syntax alongside
 *       // the class name syntax
 *       color: green;
 *     }
 *   },
 *   fields: {
 *     number: {
 *       selector: '#card-number'
 *     },
 *     // etc...
 *   }
 * }, callback);
 * @example <caption>Right to Left Language Support</caption>
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   styles: {
 *     'input': {
 *       // other styles
 *       direction: 'rtl'
 *     },
 *   },
 *   fields: {
 *     number: {
 *       selector: '#card-number',
 *       // Credit card formatting is not currently supported
 *       // with RTL languages, so we need to turn it off for the number input
 *       formatInput: false
 *     },
 *     cvv: {
 *       selector: '#cvv',
 *       placeholder: '•••'
 *     },
 *     expirationDate: {
 *       selector: '#expiration-date',
 *       type: 'month'
 *     }
 *   }
 * }, callback);
 * @example <caption>Setting up Hosted Fields to tokenize CVV only</caption>
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   fields: {
 *     // Only add the `cvv` option.
 *     cvv: {
 *       selector: '#cvv',
 *       placeholder: '•••'
 *     }
 *   }
 * }, callback);
 * @example <caption>Creating an expiration date update form with prefilled data</caption>
 * var storedCreditCardInformation = {
 *   // get this info from your server
 *   // with a payment method lookup
 *   month: '09',
 *   year: '2017'
 * };
 *
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   fields: {
 *     expirationMonth: {
 *       selector: '#expiration-month',
 *       prefill: storedCreditCardInformation.month
 *     },
 *     expirationYear: {
 *       selector: '#expiration-year',
 *       prefill: storedCreditCardInformation.year
 *     }
 *   }
 * }, callback);
 * @example <caption>Validate the card form for supported card types</caption>
 * braintree.hostedFields.create({
 *   client: clientInstance,
 *   fields: {
 *     number: {
 *       selector: '#card-number',
 *       rejectUnsupportedCards: true
 *     },
 *     cvv: {
 *       selector: '#cvv',
 *       placeholder: '•••'
 *     },
 *     expirationDate: {
 *       selector: '#expiration-date',
 *       type: 'month'
 *     }
 *   },
 * }, callback);
 */
function create(options) {
  return basicComponentVerification.verify({
    name: 'Hosted Fields',
    client: options.client
  }).then(function () {
    var integration = new HostedFields(options);

    return new Promise(function (resolve, reject) {
      integration.on('ready', function () {
        resolve(integration);
      });
      integration.on('timeout', function () {
        reject(new BraintreeError(errors.HOSTED_FIELDS_TIMEOUT));
      });
    });
  });
}

module.exports = {
  /**
   * @static
   * @function supportsInputFormatting
   * @description Returns false if input formatting will be automatically disabled due to browser incompatibility. Otherwise, returns true. For a list of unsupported browsers, [go here](https://github.com/braintree/restricted-input/blob/master/README.md#browsers-where-formatting-is-turned-off-automatically).
   * @returns {Boolean} Returns false if input formatting will be automatically disabled due to browser incompatibility. Otherwise, returns true.
   * @example
   * <caption>Conditionally choosing split expiration date inputs if formatting is unavailable</caption>
   * var canFormat = braintree.hostedFields.supportsInputFormatting();
   * var fields = {
   *   number: {
   *     selector: '#card-number'
   *   },
   *   cvv: {
   *     selector: '#cvv'
   *   }
   * };
   *
   * if (canFormat) {
   *   fields.expirationDate = {
   *     selection: '#expiration-date'
   *   };
   *   functionToCreateAndInsertExpirationDateDivToForm();
   * } else {
   *   fields.expirationMonth = {
   *     selection: '#expiration-month'
   *   };
   *   fields.expirationYear = {
   *     selection: '#expiration-year'
   *   };
   *   functionToCreateAndInsertExpirationMonthAndYearDivsToForm();
   * }
   *
   * braintree.hostedFields.create({
   *   client: clientInstance,
   *   styles: {
   *     // Styles
   *   },
   *   fields: fields
   * }, callback);
   */
  supportsInputFormatting: supportsInputFormatting,
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/basic-component-verification":64,"../lib/braintree-error":66,"../lib/promise":87,"./external/hosted-fields":53,"./shared/errors":58,"@braintree/wrap-promise":21,"restricted-input/supports-input-formatting":115}],56:[function(require,module,exports){
'use strict';

module.exports = {
  isIE: require('@braintree/browser-detection/is-ie'),
  isEdge: require('@braintree/browser-detection/is-edge'),
  isIe9: require('@braintree/browser-detection/is-ie9'),
  isIos: require('@braintree/browser-detection/is-ios'),
  isIosWebview: require('@braintree/browser-detection/is-ios-webview')
};

},{"@braintree/browser-detection/is-edge":3,"@braintree/browser-detection/is-ie":4,"@braintree/browser-detection/is-ie9":7,"@braintree/browser-detection/is-ios":11,"@braintree/browser-detection/is-ios-webview":10}],57:[function(require,module,exports){
'use strict';
/* eslint-disable no-reserved-keys */

var enumerate = require('../../lib/enumerate');
var errors = require('./errors');
var VERSION = "3.37.0";

var constants = {
  VERSION: VERSION,
  maxExpirationYearAge: 19,
  externalEvents: {
    FOCUS: 'focus',
    BLUR: 'blur',
    EMPTY: 'empty',
    NOT_EMPTY: 'notEmpty',
    VALIDITY_CHANGE: 'validityChange',
    CARD_TYPE_CHANGE: 'cardTypeChange'
  },
  defaultMaxLengths: {
    number: 19,
    postalCode: 8,
    expirationDate: 7,
    expirationMonth: 2,
    expirationYear: 4,
    cvv: 3
  },
  externalClasses: {
    FOCUSED: 'braintree-hosted-fields-focused',
    INVALID: 'braintree-hosted-fields-invalid',
    VALID: 'braintree-hosted-fields-valid'
  },
  defaultIFrameStyle: {
    border: 'none',
    width: '100%',
    height: '100%',
    'float': 'left'
  },
  tokenizationErrorCodes: {
    81724: errors.HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE,
    81736: errors.HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED
  },
  allowedStyles: [
    '-moz-appearance',
    '-moz-osx-font-smoothing',
    '-moz-tap-highlight-color',
    '-moz-transition',
    '-webkit-appearance',
    '-webkit-font-smoothing',
    '-webkit-tap-highlight-color',
    '-webkit-transition',
    'appearance',
    'color',
    'direction',
    'font',
    'font-family',
    'font-size',
    'font-size-adjust',
    'font-stretch',
    'font-style',
    'font-variant',
    'font-variant-alternates',
    'font-variant-caps',
    'font-variant-east-asian',
    'font-variant-ligatures',
    'font-variant-numeric',
    'font-weight',
    'letter-spacing',
    'line-height',
    'padding',
    'opacity',
    'outline',
    'text-shadow',
    'transition'
  ],
  allowedFields: {
    number: {
      name: 'credit-card-number',
      label: 'Credit Card Number'
    },
    cvv: {
      name: 'cvv',
      label: 'CVV'
    },
    expirationDate: {
      name: 'expiration',
      label: 'Expiration Date'
    },
    expirationMonth: {
      name: 'expiration-month',
      label: 'Expiration Month'
    },
    expirationYear: {
      name: 'expiration-year',
      label: 'Expiration Year'
    },
    postalCode: {
      name: 'postal-code',
      label: 'Postal Code'
    }
  },
  allowedAttributes: {
    'aria-invalid': 'boolean',
    'aria-required': 'boolean',
    disabled: 'boolean',
    placeholder: 'string'
  },
  autocompleteMappings: {
    'credit-card-number': 'cc-number',
    expiration: 'cc-exp',
    'expiration-month': 'cc-exp-month',
    'expiration-year': 'cc-exp-year',
    cvv: 'cc-csc',
    'postal-code': 'billing postal-code'
  }
};

constants.events = enumerate([
  'FRAME_READY',
  'VALIDATE_STRICT',
  'CONFIGURATION',
  'TOKENIZATION_REQUEST',
  'INPUT_EVENT',
  'TRIGGER_INPUT_FOCUS',
  'ADD_CLASS',
  'REMOVE_CLASS',
  'SET_ATTRIBUTE',
  'REMOVE_ATTRIBUTE',
  'CLEAR_FIELD',
  'AUTOFILL_EXPIRATION_DATE',
  'SET_MESSAGE'
], 'hosted-fields:');

module.exports = constants;

},{"../../lib/enumerate":77,"./errors":58}],58:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Hosted Fields - Creation Error Codes
 * @description Errors that occur when [creating the Hosted Fields component](/current/module-braintree-web_hosted-fields.html#.create).
 * @property {UNKNOWN} HOSTED_FIELDS_TIMEOUT Occurs when Hosted Fields does not finish setting up within 60 seconds.
 * @property {MERCHANT} HOSTED_FIELDS_INVALID_FIELD_KEY Occurs when Hosted Fields is instantated with an invalid Field option.
 * @property {MERCHANT} HOSTED_FIELDS_INVALID_FIELD_SELECTOR Occurs when Hosted Fields given a field selector that is not valid.
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME Occurs when Hosted Fields given a field selector that already contains an iframe.
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_PROPERTY_INVALID Occurs when a field configuration option is not valid.
 */

/**
 * @name BraintreeError.Hosted Fields - Field Manipulation Error Codes
 * @description Errors that occur when modifying fields through [`addClass`](/current/HostedFields.html#addClass), [`removeClass`](/current/HostedFields.html#removeClass), [`setAttribute`](/current/HostedFields.html#setAttribute), [`removeAttribute`](/current/HostedFields.html#removeAttribute), [`clear`](/current/HostedFields.html#clear), and [`focus`](/current/HostedFields.html#focus).
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_INVALID Occurs when attempting to modify a field that is not a valid Hosted Fields option.
 * @property {MERCHANT} HOSTED_FIELDS_FIELD_NOT_PRESENT Occurs when attempting to modify a field that is not configured with Hosted Fields.
 */

/**
 * @name BraintreeError.Hosted Fields - Set Attribtue Error Codes
 * @description Errors that occur when using the [`setAttribtue` method](/current/HostedFields.html#setAttribute)
 * @property {MERCHANT} HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED Occurs when trying to set an attribtue that is not supported to be set.
 * @property {MERCHANT} HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED Occurs when the type of value for an attribue is not allowed to be set.
 */

/**
 * @name BraintreeError.Hosted Fields - Tokenize Error Codes
 * @description Errors that occur when [tokenizing the card details with Hosted Fields](/current/HostedFields.html#tokenize).
 * @property {NETWORK} HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR Occurs when the Braintree gateway cannot be contacted.
 * @property {CUSTOMER} HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE Occurs when attempting to vault a card, but the client token being used is configured to fail if the card already exists in the vault.
 * @property {CUSTOMER} HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED Occurs when cvv verification is turned on in the Braintree control panel.
 * @property {CUSTOMER} HOSTED_FIELDS_FAILED_TOKENIZATION Occurs when the credit card details were sent to Braintree, but failed to tokenize.
 * @property {CUSTOMER} HOSTED_FIELDS_FIELDS_EMPTY Occurs when all the Hosted Fields inputs are empty.
 * @property {CUSTOMER} HOSTED_FIELDS_FIELDS_INVALID Occurs when one ore more fields are invalid.
 */

var BraintreeError = require('../../lib/braintree-error');

module.exports = {
  HOSTED_FIELDS_TIMEOUT: {
    type: BraintreeError.types.UNKNOWN,
    code: 'HOSTED_FIELDS_TIMEOUT',
    message: 'Hosted Fields timed out when attempting to set up.'
  },
  HOSTED_FIELDS_INVALID_FIELD_KEY: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_INVALID_FIELD_KEY'
  },
  HOSTED_FIELDS_INVALID_FIELD_SELECTOR: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_INVALID_FIELD_SELECTOR',
    message: 'Selector does not reference a valid DOM node.'
  },
  HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME',
    message: 'Element already contains a Braintree iframe.'
  },
  HOSTED_FIELDS_FIELD_INVALID: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_FIELD_INVALID'
  },
  HOSTED_FIELDS_FIELD_NOT_PRESENT: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_FIELD_NOT_PRESENT'
  },
  HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR: {
    type: BraintreeError.types.NETWORK,
    code: 'HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR',
    message: 'A tokenization network error occurred.'
  },
  HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE',
    message: 'This credit card already exists in the merchant\'s vault.'
  },
  HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED',
    message: 'CVV verification failed during tokenization.'
  },
  HOSTED_FIELDS_FAILED_TOKENIZATION: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_FAILED_TOKENIZATION',
    message: 'The supplied card data failed tokenization.'
  },
  HOSTED_FIELDS_FIELDS_EMPTY: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_FIELDS_EMPTY',
    message: 'All fields are empty. Cannot tokenize empty card fields.'
  },
  HOSTED_FIELDS_FIELDS_INVALID: {
    type: BraintreeError.types.CUSTOMER,
    code: 'HOSTED_FIELDS_FIELDS_INVALID',
    message: 'Some payment input fields are invalid. Cannot tokenize invalid card fields.'
  },
  HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_ATTRIBUTE_NOT_SUPPORTED'
  },
  HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED'
  },
  HOSTED_FIELDS_FIELD_PROPERTY_INVALID: {
    type: BraintreeError.types.MERCHANT,
    code: 'HOSTED_FIELDS_FIELD_PROPERTY_INVALID'
  }
};

},{"../../lib/braintree-error":66}],59:[function(require,module,exports){
'use strict';

function findParentTags(element, tag) {
  var parent = element.parentNode;
  var parents = [];

  while (parent != null) {
    if (parent.tagName != null && parent.tagName.toLowerCase() === tag) {
      parents.push(parent);
    }

    parent = parent.parentNode;
  }

  return parents;
}

module.exports = findParentTags;

},{}],60:[function(require,module,exports){
'use strict';

var creditCardType = require('credit-card-type');

module.exports = function (number) {
  var results = creditCardType(number);

  results.forEach(function (card) {
    // TODO credit-card-type fixed the mastercard enum
    // but we still pass master-card in the braintree API
    // in a major version bump, we can remove this and
    // this will be mastercard instead of master-card
    if (card.type === 'mastercard') {
      card.type = 'master-card';
    }
  });

  return results;
};

},{"credit-card-type":110}],61:[function(require,module,exports){
'use strict';

var createAuthorizationData = require('./create-authorization-data');
var jsonClone = require('./json-clone');
var constants = require('./constants');

function addMetadata(configuration, data) {
  var key;
  var attrs = data ? jsonClone(data) : {};
  var authAttrs = createAuthorizationData(configuration.authorization).attrs;
  var _meta = jsonClone(configuration.analyticsMetadata);

  attrs.braintreeLibraryVersion = constants.BRAINTREE_LIBRARY_VERSION;

  for (key in attrs._meta) {
    if (attrs._meta.hasOwnProperty(key)) {
      _meta[key] = attrs._meta[key];
    }
  }

  attrs._meta = _meta;

  if (authAttrs.tokenizationKey) {
    attrs.tokenizationKey = authAttrs.tokenizationKey;
  } else {
    attrs.authorizationFingerprint = authAttrs.authorizationFingerprint;
  }

  return attrs;
}

module.exports = addMetadata;

},{"./constants":71,"./create-authorization-data":74,"./json-clone":84}],62:[function(require,module,exports){
'use strict';

var constants = require('./constants');
var addMetadata = require('./add-metadata');

function _millisToSeconds(millis) {
  return Math.floor(millis / 1000);
}

function sendAnalyticsEvent(client, kind, callback) {
  var configuration = client.getConfiguration();
  var request = client._request;
  var timestamp = _millisToSeconds(Date.now());
  var url = configuration.gatewayConfiguration.analytics.url;
  var data = {
    analytics: [{
      kind: constants.ANALYTICS_PREFIX + kind,
      timestamp: timestamp
    }]
  };

  request({
    url: url,
    method: 'post',
    data: addMetadata(configuration, data),
    timeout: constants.ANALYTICS_REQUEST_TIMEOUT_MS
  }, callback);
}

module.exports = {
  sendEvent: sendAnalyticsEvent
};

},{"./add-metadata":61,"./constants":71}],63:[function(require,module,exports){
'use strict';

var assignNormalized = typeof Object.assign === 'function' ? Object.assign : assignPolyfill;

function assignPolyfill(destination) {
  var i, source, key;

  for (i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        destination[key] = source[key];
      }
    }
  }

  return destination;
}

module.exports = {
  assign: assignNormalized,
  _assign: assignPolyfill
};

},{}],64:[function(require,module,exports){
'use strict';

var BraintreeError = require('./braintree-error');
var Promise = require('./promise');
var sharedErrors = require('./errors');
var VERSION = "3.37.0";

function basicComponentVerification(options) {
  var client, clientVersion, name;

  if (!options) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INVALID_USE_OF_INTERNAL_FUNCTION.type,
      code: sharedErrors.INVALID_USE_OF_INTERNAL_FUNCTION.code,
      message: 'Options must be passed to basicComponentVerification function.'
    }));
  }

  name = options.name;
  client = options.client;

  if (client == null) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INSTANTIATION_OPTION_REQUIRED.type,
      code: sharedErrors.INSTANTIATION_OPTION_REQUIRED.code,
      message: 'options.client is required when instantiating ' + name + '.'
    }));
  }

  clientVersion = client.getVersion();

  if (clientVersion !== VERSION) {
    return Promise.reject(new BraintreeError({
      type: sharedErrors.INCOMPATIBLE_VERSIONS.type,
      code: sharedErrors.INCOMPATIBLE_VERSIONS.code,
      message: 'Client (version ' + clientVersion + ') and ' + name + ' (version ' + VERSION + ') components must be from the same SDK version.'
    }));
  }

  return Promise.resolve();
}

module.exports = {
  verify: basicComponentVerification
};

},{"./braintree-error":66,"./errors":78,"./promise":87}],65:[function(require,module,exports){
'use strict';

var once = require('./once');

function call(fn, callback) {
  var isSync = fn.length === 0;

  if (isSync) {
    fn();
    callback(null);
  } else {
    fn(callback);
  }
}

module.exports = function (functions, cb) {
  var i;
  var length = functions.length;
  var remaining = length;
  var callback = once(cb);

  if (length === 0) {
    callback(null);

    return;
  }

  function finish(err) {
    if (err) {
      callback(err);

      return;
    }

    remaining -= 1;
    if (remaining === 0) {
      callback(null);
    }
  }

  for (i = 0; i < length; i++) {
    call(functions[i], finish);
  }
};

},{"./once":86}],66:[function(require,module,exports){
'use strict';

var enumerate = require('./enumerate');

/**
 * @class
 * @global
 * @param {object} options Construction options
 * @classdesc This class is used to report error conditions, frequently as the first parameter to callbacks throughout the Braintree SDK.
 * @description <strong>You cannot use this constructor directly. Interact with instances of this class through {@link callback callbacks}.</strong>
 */
function BraintreeError(options) {
  if (!BraintreeError.types.hasOwnProperty(options.type)) {
    throw new Error(options.type + ' is not a valid type.');
  }

  if (!options.code) {
    throw new Error('Error code required.');
  }

  if (!options.message) {
    throw new Error('Error message required.');
  }

  this.name = 'BraintreeError';

  /**
   * @type {string}
   * @description A code that corresponds to specific errors.
   */
  this.code = options.code;

  /**
   * @type {string}
   * @description A short description of the error.
   */
  this.message = options.message;

  /**
   * @type {BraintreeError.types}
   * @description The type of error.
   */
  this.type = options.type;

  /**
   * @type {object=}
   * @description Additional information about the error, such as an underlying network error response.
   */
  this.details = options.details;
}

BraintreeError.prototype = Object.create(Error.prototype);
BraintreeError.prototype.constructor = BraintreeError;

/**
 * Enum for {@link BraintreeError} types.
 * @name BraintreeError.types
 * @enum
 * @readonly
 * @memberof BraintreeError
 * @property {string} CUSTOMER An error caused by the customer.
 * @property {string} MERCHANT An error that is actionable by the merchant.
 * @property {string} NETWORK An error due to a network problem.
 * @property {string} INTERNAL An error caused by Braintree code.
 * @property {string} UNKNOWN An error where the origin is unknown.
 */
BraintreeError.types = enumerate([
  'CUSTOMER',
  'MERCHANT',
  'NETWORK',
  'INTERNAL',
  'UNKNOWN'
]);

BraintreeError.findRootError = function (err) {
  if (err instanceof BraintreeError && err.details && err.details.originalError) {
    return BraintreeError.findRootError(err.details.originalError);
  }

  return err;
};

module.exports = BraintreeError;

},{"./enumerate":77}],67:[function(require,module,exports){
'use strict';

var isVerifiedDomain = require('../is-verified-domain');

function checkOrigin(postMessageOrigin, merchantUrl) {
  var merchantOrigin, merchantHost;
  var a = document.createElement('a');

  a.href = merchantUrl;

  if (a.protocol === 'https:') {
    merchantHost = a.host.replace(/:443$/, '');
  } else if (a.protocol === 'http:') {
    merchantHost = a.host.replace(/:80$/, '');
  } else {
    merchantHost = a.host;
  }

  merchantOrigin = a.protocol + '//' + merchantHost;

  if (merchantOrigin === postMessageOrigin) { return true; }

  a.href = postMessageOrigin;

  return isVerifiedDomain(postMessageOrigin);
}

module.exports = {
  checkOrigin: checkOrigin
};

},{"../is-verified-domain":83}],68:[function(require,module,exports){
'use strict';

var enumerate = require('../enumerate');

module.exports = enumerate([
  'CONFIGURATION_REQUEST'
], 'bus:');

},{"../enumerate":77}],69:[function(require,module,exports){
'use strict';

var bus = require('framebus');
var events = require('./events');
var checkOrigin = require('./check-origin').checkOrigin;
var BraintreeError = require('../braintree-error');

function BraintreeBus(options) {
  options = options || {};

  this.channel = options.channel;
  if (!this.channel) {
    throw new BraintreeError({
      type: BraintreeError.types.INTERNAL,
      code: 'MISSING_CHANNEL_ID',
      message: 'Channel ID must be specified.'
    });
  }

  this.merchantUrl = options.merchantUrl;

  this._isDestroyed = false;
  this._isVerbose = false;

  this._listeners = [];

  this._log('new bus on channel ' + this.channel, [location.href]);
}

BraintreeBus.prototype.on = function (eventName, originalHandler) {
  var namespacedEvent, args;
  var handler = originalHandler;
  var self = this;

  if (this._isDestroyed) { return; }

  if (this.merchantUrl) {
    handler = function () {
      /* eslint-disable no-invalid-this */
      if (checkOrigin(this.origin, self.merchantUrl)) {
        originalHandler.apply(this, arguments);
      }
      /* eslint-enable no-invalid-this */
    };
  }

  namespacedEvent = this._namespaceEvent(eventName);
  args = Array.prototype.slice.call(arguments);
  args[0] = namespacedEvent;
  args[1] = handler;

  this._log('on', args);
  bus.on.apply(bus, args);

  this._listeners.push({
    eventName: eventName,
    handler: handler,
    originalHandler: originalHandler
  });
};

BraintreeBus.prototype.emit = function (eventName) {
  var args;

  if (this._isDestroyed) { return; }

  args = Array.prototype.slice.call(arguments);
  args[0] = this._namespaceEvent(eventName);

  this._log('emit', args);
  bus.emit.apply(bus, args);
};

BraintreeBus.prototype._offDirect = function (eventName) {
  var args = Array.prototype.slice.call(arguments);

  if (this._isDestroyed) { return; }

  args[0] = this._namespaceEvent(eventName);

  this._log('off', args);
  bus.off.apply(bus, args);
};

BraintreeBus.prototype.off = function (eventName, originalHandler) {
  var i, listener;
  var handler = originalHandler;

  if (this._isDestroyed) { return; }

  if (this.merchantUrl) {
    for (i = 0; i < this._listeners.length; i++) {
      listener = this._listeners[i];

      if (listener.originalHandler === originalHandler) {
        handler = listener.handler;
      }
    }
  }

  this._offDirect(eventName, handler);
};

BraintreeBus.prototype._namespaceEvent = function (eventName) {
  return ['braintree', this.channel, eventName].join(':');
};

BraintreeBus.prototype.teardown = function () {
  var listener, i;

  for (i = 0; i < this._listeners.length; i++) {
    listener = this._listeners[i];
    this._offDirect(listener.eventName, listener.handler);
  }

  this._listeners.length = 0;

  this._isDestroyed = true;
};

BraintreeBus.prototype._log = function (functionName, args) {
  if (this._isVerbose) {
    console.log(functionName, args); // eslint-disable-line no-console
  }
};

BraintreeBus.events = events;

module.exports = BraintreeBus;

},{"../braintree-error":66,"./check-origin":67,"./events":68,"framebus":111}],70:[function(require,module,exports){
'use strict';

function _classesOf(element) {
  return element.className.trim().split(/\s+/);
}

function add(element) {
  var toAdd = Array.prototype.slice.call(arguments, 1);
  var className = _classesOf(element).filter(function (classname) {
    return toAdd.indexOf(classname) === -1;
  }).concat(toAdd).join(' ');

  element.className = className;
}

function remove(element) {
  var toRemove = Array.prototype.slice.call(arguments, 1);
  var className = _classesOf(element).filter(function (classname) {
    return toRemove.indexOf(classname) === -1;
  }).join(' ');

  element.className = className;
}

function toggle(element, classname, adding) {
  if (adding) {
    add(element, classname);
  } else {
    remove(element, classname);
  }
}

module.exports = {
  add: add,
  remove: remove,
  toggle: toggle
};

},{}],71:[function(require,module,exports){
'use strict';

var VERSION = "3.37.0";
var PLATFORM = 'web';

var CLIENT_API_URLS = {
  production: 'https://api.braintreegateway.com:443',
  sandbox: 'https://api.sandbox.braintreegateway.com:443'
};

var GRAPHQL_URLS = {
  production: 'https://payments.braintree-api.com/graphql',
  sandbox: 'https://payments.sandbox.braintree-api.com/graphql'
};

module.exports = {
  ANALYTICS_PREFIX: PLATFORM + '.',
  ANALYTICS_REQUEST_TIMEOUT_MS: 2000,
  CLIENT_API_URLS: CLIENT_API_URLS,
  GRAPHQL_URLS: GRAPHQL_URLS,
  INTEGRATION_TIMEOUT_MS: 60000,
  VERSION: VERSION,
  INTEGRATION: 'custom',
  SOURCE: 'client',
  PLATFORM: PLATFORM,
  BRAINTREE_LIBRARY_VERSION: 'braintree/' + PLATFORM + '/' + VERSION
};

},{}],72:[function(require,module,exports){
'use strict';

var BraintreeError = require('./braintree-error');
var sharedErrors = require('./errors');

module.exports = function (instance, methodNames) {
  methodNames.forEach(function (methodName) {
    instance[methodName] = function () {
      throw new BraintreeError({
        type: sharedErrors.METHOD_CALLED_AFTER_TEARDOWN.type,
        code: sharedErrors.METHOD_CALLED_AFTER_TEARDOWN.code,
        message: methodName + ' cannot be called after teardown.'
      });
    };
  });
};

},{"./braintree-error":66,"./errors":78}],73:[function(require,module,exports){
'use strict';

var BraintreeError = require('./braintree-error');

function convertToBraintreeError(originalErr, btErrorObject) {
  if (originalErr instanceof BraintreeError) {
    return originalErr;
  }

  return new BraintreeError({
    type: btErrorObject.type,
    code: btErrorObject.code,
    message: btErrorObject.message,
    details: {
      originalError: originalErr
    }
  });
}

module.exports = convertToBraintreeError;

},{"./braintree-error":66}],74:[function(require,module,exports){
'use strict';

var atob = require('../lib/vendor/polyfill').atob;
var CLIENT_API_URLS = require('../lib/constants').CLIENT_API_URLS;

function _isTokenizationKey(str) {
  return /^[a-zA-Z0-9]+_[a-zA-Z0-9]+_[a-zA-Z0-9_]+$/.test(str);
}

function _parseTokenizationKey(tokenizationKey) {
  var tokens = tokenizationKey.split('_');
  var environment = tokens[0];
  var merchantId = tokens.slice(2).join('_');

  return {
    merchantId: merchantId,
    environment: environment
  };
}

function createAuthorizationData(authorization) {
  var parsedClientToken, parsedTokenizationKey;
  var data = {
    attrs: {},
    configUrl: ''
  };

  if (_isTokenizationKey(authorization)) {
    parsedTokenizationKey = _parseTokenizationKey(authorization);
    data.attrs.tokenizationKey = authorization;
    data.configUrl = CLIENT_API_URLS[parsedTokenizationKey.environment] + '/merchants/' + parsedTokenizationKey.merchantId + '/client_api/v1/configuration';
  } else {
    parsedClientToken = JSON.parse(atob(authorization));
    data.attrs.authorizationFingerprint = parsedClientToken.authorizationFingerprint;
    data.configUrl = parsedClientToken.configUrl;
    data.graphQL = parsedClientToken.graphQL;
  }

  return data;
}

module.exports = createAuthorizationData;

},{"../lib/constants":71,"../lib/vendor/polyfill":90}],75:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
  return function () {
    // IE9 doesn't support passing arguments to setTimeout so we have to emulate it.
    var args = arguments;

    setTimeout(function () {
      fn.apply(null, args);
    }, 1);
  };
};

},{}],76:[function(require,module,exports){
'use strict';

var batchExecuteFunctions = require('./batch-execute-functions');

function Destructor() {
  this._teardownRegistry = [];

  this._isTearingDown = false;
}

Destructor.prototype.registerFunctionForTeardown = function (fn) {
  if (typeof fn === 'function') {
    this._teardownRegistry.push(fn);
  }
};

Destructor.prototype.teardown = function (callback) {
  if (this._isTearingDown) {
    callback(new Error('Destructor is already tearing down'));

    return;
  }

  this._isTearingDown = true;

  batchExecuteFunctions(this._teardownRegistry, function (err) {
    this._teardownRegistry = [];
    this._isTearingDown = false;

    if (typeof callback === 'function') {
      callback(err);
    }
  }.bind(this));
};

module.exports = Destructor;

},{"./batch-execute-functions":65}],77:[function(require,module,exports){
'use strict';

function enumerate(values, prefix) {
  prefix = prefix == null ? '' : prefix;

  return values.reduce(function (enumeration, value) {
    enumeration[value] = prefix + value;

    return enumeration;
  }, {});
}

module.exports = enumerate;

},{}],78:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Shared Interal Error Codes
 * @ignore
 * @description These codes should never be experienced by the mechant directly.
 * @property {INTERNAL} INVALID_USE_OF_INTERNAL_FUNCTION Occurs when the client is created without a gateway configuration. Should never happen.
 */

/**
 * @name BraintreeError.Shared Errors - Component Creation Error Codes
 * @description Errors that occur when creating components.
 * @property {MERCHANT} INSTANTIATION_OPTION_REQUIRED Occurs when a compoennt is created that is missing a required option.
 * @property {MERCHANT} INCOMPATIBLE_VERSIONS Occurs when a component is created with a client with a different version than the component.
 */

/**
 * @name BraintreeError.Shared Errors - Component Instance Error Codes
 * @description Errors that occur when using instances of components.
 * @property {MERCHANT} METHOD_CALLED_AFTER_TEARDOWN Occurs when a method is called on a component instance after it has been torn down.
 * @property {MERCHANT} BRAINTREE_API_ACCESS_RESTRICTED Occurs when the client token or tokenization key does not have the correct permissions.
 */

var BraintreeError = require('./braintree-error');

module.exports = {
  INVALID_USE_OF_INTERNAL_FUNCTION: {
    type: BraintreeError.types.INTERNAL,
    code: 'INVALID_USE_OF_INTERNAL_FUNCTION'
  },
  INSTANTIATION_OPTION_REQUIRED: {
    type: BraintreeError.types.MERCHANT,
    code: 'INSTANTIATION_OPTION_REQUIRED'
  },
  INCOMPATIBLE_VERSIONS: {
    type: BraintreeError.types.MERCHANT,
    code: 'INCOMPATIBLE_VERSIONS'
  },
  METHOD_CALLED_AFTER_TEARDOWN: {
    type: BraintreeError.types.MERCHANT,
    code: 'METHOD_CALLED_AFTER_TEARDOWN'
  },
  BRAINTREE_API_ACCESS_RESTRICTED: {
    type: BraintreeError.types.MERCHANT,
    code: 'BRAINTREE_API_ACCESS_RESTRICTED',
    message: 'Your access is restricted and cannot use this part of the Braintree API.'
  }
};

},{"./braintree-error":66}],79:[function(require,module,exports){
'use strict';

function EventEmitter() {
  this._events = {};
}

EventEmitter.prototype.on = function (event, callback) {
  if (this._events[event]) {
    this._events[event].push(callback);
  } else {
    this._events[event] = [callback];
  }
};

EventEmitter.prototype._emit = function (event) {
  var i, args;
  var callbacks = this._events[event];

  if (!callbacks) { return; }

  args = Array.prototype.slice.call(arguments, 1);

  for (i = 0; i < callbacks.length; i++) {
    callbacks[i].apply(null, args);
  }
};

module.exports = EventEmitter;

},{}],80:[function(require,module,exports){
'use strict';

var VERSION = "3.37.0";

module.exports = function (configuration) {
  var isProduction = configuration.gatewayConfiguration.environment === 'production';
  var androidPayConfiguration = configuration.gatewayConfiguration.androidPay;
  var metadata = configuration.analyticsMetadata;
  var data = {
    environment: isProduction ? 'PRODUCTION' : 'TEST',
    allowedPaymentMethods: ['CARD', 'TOKENIZED_CARD'],
    paymentMethodTokenizationParameters: {
      tokenizationType: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'braintree',
        'braintree:merchantId': configuration.gatewayConfiguration.merchantId,
        'braintree:authorizationFingerprint': androidPayConfiguration.googleAuthorizationFingerprint,
        'braintree:apiVersion': 'v1',
        'braintree:sdkVersion': VERSION,
        'braintree:metadata': JSON.stringify({
          source: metadata.source,
          integration: metadata.integration,
          sessionId: metadata.sessionId,
          version: VERSION,
          platform: metadata.platform
        })
      }
    },
    cardRequirements: {
      allowedCardNetworks: androidPayConfiguration.supportedNetworks.map(function (card) { return card.toUpperCase(); })
    }
  };

  if (configuration.authorizationType === 'TOKENIZATION_KEY') {
    data.paymentMethodTokenizationParameters.parameters['braintree:clientKey'] = configuration.authorization;
  }

  return data;
};

},{}],81:[function(require,module,exports){
'use strict';

function convertDateStringToDate(dateString) {
  var splitDate = dateString.split('-');

  return new Date(splitDate[0], splitDate[1], splitDate[2]);
}

function isDateStringBeforeOrOn(firstDate, secondDate) {
  return convertDateStringToDate(firstDate) <= convertDateStringToDate(secondDate);
}

module.exports = isDateStringBeforeOrOn;

},{}],82:[function(require,module,exports){
(function (global){
'use strict';

function isHTTPS(protocol) {
  protocol = protocol || global.location.protocol;

  return protocol === 'https:';
}

module.exports = {
  isHTTPS: isHTTPS
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],83:[function(require,module,exports){
'use strict';

var parser;
var legalHosts = {
  'paypal.com': 1,
  'braintreepayments.com': 1,
  'braintreegateway.com': 1,
  'braintree-api.com': 1
};

function stripSubdomains(domain) {
  return domain.split('.').slice(-2).join('.');
}

function isVerifiedDomain(url) {
  var mainDomain;

  url = url.toLowerCase();

  if (!/^https:/.test(url)) {
    return false;
  }

  parser = parser || document.createElement('a');
  parser.href = url;
  mainDomain = stripSubdomains(parser.hostname);

  return legalHosts.hasOwnProperty(mainDomain);
}

module.exports = isVerifiedDomain;

},{}],84:[function(require,module,exports){
'use strict';

module.exports = function (value) {
  return JSON.parse(JSON.stringify(value));
};

},{}],85:[function(require,module,exports){
'use strict';

module.exports = function (obj) {
  return Object.keys(obj).filter(function (key) {
    return typeof obj[key] === 'function';
  });
};

},{}],86:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"dup":19}],87:[function(require,module,exports){
(function (global){
'use strict';

var Promise = global.Promise || require('promise-polyfill');

module.exports = Promise;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"promise-polyfill":113}],88:[function(require,module,exports){
(function (global){
'use strict';

function _notEmpty(obj) {
  var key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) { return true; }
  }

  return false;
}

/* eslint-disable no-mixed-operators */
function _isArray(value) {
  return value && typeof value === 'object' && typeof value.length === 'number' &&
    Object.prototype.toString.call(value) === '[object Array]' || false;
}
/* eslint-enable no-mixed-operators */

function parse(url) {
  var query, params;

  url = url || global.location.href;

  if (!/\?/.test(url)) {
    return {};
  }

  query = url.replace(/#.*$/, '').replace(/^.*\?/, '').split('&');

  params = query.reduce(function (toReturn, keyValue) {
    var parts = keyValue.split('=');
    var key = decodeURIComponent(parts[0]);
    var value = decodeURIComponent(parts[1]);

    toReturn[key] = value;

    return toReturn;
  }, {});

  return params;
}

function stringify(params, namespace) {
  var k, v, p;
  var query = [];

  for (p in params) {
    if (!params.hasOwnProperty(p)) {
      continue;
    }

    v = params[p];

    if (namespace) {
      if (_isArray(params)) {
        k = namespace + '[]';
      } else {
        k = namespace + '[' + p + ']';
      }
    } else {
      k = p;
    }
    if (typeof v === 'object') {
      query.push(stringify(v, k));
    } else {
      query.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
  }

  return query.join('&');
}

function queryify(url, params) {
  url = url || '';

  if (params != null && typeof params === 'object' && _notEmpty(params)) {
    url += url.indexOf('?') === -1 ? '?' : '';
    url += url.indexOf('=') !== -1 ? '&' : '';
    url += stringify(params);
  }

  return url;
}

module.exports = {
  parse: parse,
  stringify: stringify,
  queryify: queryify
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],89:[function(require,module,exports){
'use strict';

function useMin(isDebug) {
  return isDebug ? '' : '.min';
}

module.exports = useMin;

},{}],90:[function(require,module,exports){
(function (global){
'use strict';

var atobNormalized = typeof global.atob === 'function' ? global.atob : atob;

function atob(base64String) {
  var a, b, c, b1, b2, b3, b4, i;
  var base64Matcher = new RegExp('^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})([=]{1,2})?$');
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var result = '';

  if (!base64Matcher.test(base64String)) {
    throw new Error('Non base64 encoded input passed to window.atob polyfill');
  }

  i = 0;
  do {
    b1 = characters.indexOf(base64String.charAt(i++));
    b2 = characters.indexOf(base64String.charAt(i++));
    b3 = characters.indexOf(base64String.charAt(i++));
    b4 = characters.indexOf(base64String.charAt(i++));

    a = (b1 & 0x3F) << 2 | b2 >> 4 & 0x3;
    b = (b2 & 0xF) << 4 | b3 >> 2 & 0xF;
    c = (b3 & 0x3) << 6 | b4 & 0x3F;

    result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : '') + (c ? String.fromCharCode(c) : '');
  } while (i < base64String.length);

  return result;
}

module.exports = {
  atob: function (base64String) {
    return atobNormalized.call(global, base64String);
  },
  _atob: atob
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],91:[function(require,module,exports){
'use strict';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;

    return v.toString(16);
  });
}

module.exports = uuid;

},{}],92:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.PayPal Checkout - Creation Error Codes
 * @description Errors that occur when [creating the PayPal Checkout component](/current/module-braintree-web_paypal-checkout.html#.create).
 * @property {MERCHANT} PAYPAL_NOT_ENABLED Occurs when PayPal is not enabled on the Braintree control panel.
 * @property {MERCHANT} PAYPAL_SANDBOX_ACCOUNT_NOT_LINKED Occurs only when testing in Sandbox, when a PayPal sandbox account is not linked to the merchant account in the Braintree control panel.
 */

/**
 * @name BraintreeError.PayPal Checkout - createPayment Error Codes
 * @description Errors that occur when using the [`createPayment` method](/current/PayPalCheckout.html#createPayment).
 * @property {MERCHANT} PAYPAL_FLOW_OPTION_REQUIRED Occurs when a required option is missing.
 * @property {MERCHANT} PAYPAL_INVALID_PAYMENT_OPTION Occurs when an option contains an invalid value.
 * @property {NETWORK} PAYPAL_FLOW_FAILED Occurs when something goes wrong when initializing the flow.
 */

/**
 * @name BraintreeError.PayPal Checkout - tokenizePayment Error Codes
 * @description Errors that occur when using the [`tokenizePayment` method](/current/PayPalCheckout.html#tokenizePayment).
 * @property {NETWORK} PAYPAL_ACCOUNT_TOKENIZATION_FAILED Occurs when PayPal account could not be tokenized.
 */

var BraintreeError = require('../lib/braintree-error');

module.exports = {
  PAYPAL_NOT_ENABLED: {
    type: BraintreeError.types.MERCHANT,
    code: 'PAYPAL_NOT_ENABLED',
    message: 'PayPal is not enabled for this merchant.'
  },
  PAYPAL_SANDBOX_ACCOUNT_NOT_LINKED: {
    type: BraintreeError.types.MERCHANT,
    code: 'PAYPAL_SANDBOX_ACCOUNT_NOT_LINKED',
    message: 'A linked PayPal Sandbox account is required to use PayPal Checkout in Sandbox. See https://developers.braintreepayments.com/guides/paypal/testing-go-live/#linked-paypal-testing for details on linking your PayPal sandbox with Braintree.'
  },
  PAYPAL_ACCOUNT_TOKENIZATION_FAILED: {
    type: BraintreeError.types.NETWORK,
    code: 'PAYPAL_ACCOUNT_TOKENIZATION_FAILED',
    message: 'Could not tokenize user\'s PayPal account.'
  },
  PAYPAL_FLOW_FAILED: {
    type: BraintreeError.types.NETWORK,
    code: 'PAYPAL_FLOW_FAILED',
    message: 'Could not initialize PayPal flow.'
  },
  PAYPAL_FLOW_OPTION_REQUIRED: {
    type: BraintreeError.types.MERCHANT,
    code: 'PAYPAL_FLOW_OPTION_REQUIRED',
    message: 'PayPal flow property is invalid or missing.'
  },
  PAYPAL_INVALID_PAYMENT_OPTION: {
    type: BraintreeError.types.MERCHANT,
    code: 'PAYPAL_INVALID_PAYMENT_OPTION',
    message: 'PayPal payment options are invalid.'
  }
};

},{"../lib/braintree-error":66}],93:[function(require,module,exports){
'use strict';
/**
 * @module braintree-web/paypal-checkout
 * @description A component to integrate with the [PayPal Checkout.js library](https://github.com/paypal/paypal-checkout).
 */

var BraintreeError = require('../lib/braintree-error');
var analytics = require('../lib/analytics');
var basicComponentVerification = require('../lib/basic-component-verification');
var errors = require('./errors');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var PayPalCheckout = require('./paypal-checkout');
var VERSION = "3.37.0";

/**
 * @static
 * @function create
 * @description There are two ways to integrate the PayPal Checkout component. See the [PayPal Checkout constructor documentation](PayPalCheckout.html#PayPalCheckout) for more information and examples.
 *
 * @param {object} options Creation options:
 * @param {Client} options.client A {@link Client} instance.
 * @param {callback} [callback] The second argument, `data`, is the {@link PayPalCheckout} instance.
 * @example
 * braintree.client.create({
 *   authorization: 'authorization'
 * }).then(function (clientInstance) {
 *   return braintree.paypalCheckout.create({
 *     client: clientInstance
 *   });
 * }).then(function (paypalCheckoutInstance) {
 *   // set up checkout.js
 * }).catch(function (err) {
 *   console.error('Error!', err);
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
function create(options) {
  return basicComponentVerification.verify({
    name: 'PayPal Checkout',
    client: options.client
  }).then(function () {
    var config = options.client.getConfiguration();

    if (!config.gatewayConfiguration.paypalEnabled) {
      return Promise.reject(new BraintreeError(errors.PAYPAL_NOT_ENABLED));
    }

    if (config.gatewayConfiguration.paypal.environmentNoNetwork === true) {
      return Promise.reject(new BraintreeError(errors.PAYPAL_SANDBOX_ACCOUNT_NOT_LINKED));
    }

    analytics.sendEvent(options.client, 'paypal-checkout.initialized');

    return new PayPalCheckout(options);
  });
}

/**
 * @static
 * @function isSupported
 * @description Returns true if PayPal Checkout [supports this browser](index.html#browser-support-webviews).
 * @deprecated Previously, this method checked for Popup support in the browser. Checkout.js now falls back to a modal if popups are not supported.
 * @returns {Boolean} Returns true if PayPal Checkout supports this browser.
 */
function isSupported() {
  return true;
}

module.exports = {
  create: wrapPromise(create),
  isSupported: isSupported,
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/analytics":62,"../lib/basic-component-verification":64,"../lib/braintree-error":66,"../lib/promise":87,"./errors":92,"./paypal-checkout":94,"@braintree/wrap-promise":21}],94:[function(require,module,exports){
'use strict';

var analytics = require('../lib/analytics');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');
var BraintreeError = require('../lib/braintree-error');
var convertToBraintreeError = require('../lib/convert-to-braintree-error');
var errors = require('./errors');
var constants = require('../paypal/shared/constants');
var methods = require('../lib/methods');
var convertMethodsToError = require('../lib/convert-methods-to-error');

/**
 * PayPal Checkout tokenized payload. Returned in {@link PayPalCheckout#tokenizePayment}'s callback as the second argument, `data`.
 * @typedef {object} PayPalCheckout~tokenizePayload
 * @property {string} nonce The payment method nonce.
 * @property {string} type The payment method type, always `PayPalAccount`.
 * @property {object} details Additional PayPal account details.
 * @property {string} details.email User's email address.
 * @property {string} details.payerId User's payer ID, the unique identifier for each PayPal account.
 * @property {string} details.firstName User's given name.
 * @property {string} details.lastName User's surname.
 * @property {?string} details.countryCode User's 2 character country code.
 * @property {?string} details.phone User's phone number (e.g. 555-867-5309).
 * @property {?object} details.shippingAddress User's shipping address details, only available if shipping address is enabled.
 * @property {string} details.shippingAddress.recipientName Recipient of postage.
 * @property {string} details.shippingAddress.line1 Street number and name.
 * @property {string} details.shippingAddress.line2 Extended address.
 * @property {string} details.shippingAddress.city City or locality.
 * @property {string} details.shippingAddress.state State or region.
 * @property {string} details.shippingAddress.postalCode Postal code.
 * @property {string} details.shippingAddress.countryCode 2 character country code (e.g. US).
 * @property {?object} details.billingAddress User's billing address details.
 * Not available to all merchants; [contact PayPal](https://developers.braintreepayments.com/support/guides/paypal/setup-guide#contacting-paypal-support) for details on eligibility and enabling this feature.
 * Alternatively, see `shippingAddress` above as an available client option.
 * @property {string} details.billingAddress.line1 Street number and name.
 * @property {string} details.billingAddress.line2 Extended address.
 * @property {string} details.billingAddress.city City or locality.
 * @property {string} details.billingAddress.state State or region.
 * @property {string} details.billingAddress.postalCode Postal code.
 * @property {string} details.billingAddress.countryCode 2 character country code (e.g. US).
 * @property {?object} creditFinancingOffered This property will only be present when the customer pays with PayPal Credit.
 * @property {object} creditFinancingOffered.totalCost This is the estimated total payment amount including interest and fees the user will pay during the lifetime of the loan.
 * @property {string} creditFinancingOffered.totalCost.value An amount defined by [ISO 4217](http://www.iso.org/iso/home/standards/currency_codes.htm) for the given currency.
 * @property {string} creditFinancingOffered.totalCost.currency 3 letter currency code as defined by [ISO 4217](http://www.iso.org/iso/home/standards/currency_codes.htm).
 * @property {number} creditFinancingOffered.term Length of financing terms in months.
 * @property {object} creditFinancingOffered.monthlyPayment This is the estimated amount per month that the customer will need to pay including fees and interest.
 * @property {string} creditFinancingOffered.monthlyPayment.value An amount defined by [ISO 4217](http://www.iso.org/iso/home/standards/currency_codes.htm) for the given currency.
 * @property {string} creditFinancingOffered.monthlyPayment.currency 3 letter currency code as defined by [ISO 4217](http://www.iso.org/iso/home/standards/currency_codes.htm).
 * @property {object} creditFinancingOffered.totalInterest Estimated interest or fees amount the payer will have to pay during the lifetime of the loan.
 * @property {string} creditFinancingOffered.totalInterest.value An amount defined by [ISO 4217](http://www.iso.org/iso/home/standards/currency_codes.htm) for the given currency.
 * @property {string} creditFinancingOffered.totalInterest.currency 3 letter currency code as defined by [ISO 4217](http://www.iso.org/iso/home/standards/currency_codes.htm).
 * @property {boolean} creditFinancingOffered.payerAcceptance Status of whether the customer ultimately was approved for and chose to make the payment using the approved installment credit.
 * @property {boolean} creditFinancingOffered.cartAmountImmutable Indicates whether the cart amount is editable after payer's acceptance on PayPal side.
 */

/**
 * @class
 * @param {object} options see {@link module:braintree-web/paypal-checkout.create|paypal-checkout.create}
 * @classdesc This class represents a PayPal Checkout component that coordinates with the {@link https://developer.paypal.com/docs/integration/direct/express-checkout/integration-jsv4|PayPal checkout.js} library. Instances of this class can generate payment data and tokenize authorized payments.
 *
 * All UI (such as preventing actions on the parent page while authentication is in progress) is managed by {@link https://developer.paypal.com/docs/integration/direct/express-checkout/integration-jsv4|checkout.js}.
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web/paypal-checkout.create|braintree-web.paypal-checkout.create} instead.</strong>
 *
 * You must have PayPal's checkout.js script loaded on your page to use PayPal Checkout. You can either use the [paypal-checkout package on npm](https://www.npmjs.com/package/paypal-checkout) with a build tool or use a script hosted by PayPal:
 *
 * ```html
 * <script src="https://www.paypalobjects.com/api/checkout.js" data-version-4 log-level="warn"></script>
 * ```
 *
 * Once you have the script loaded, there are two ways to integrate with the checkout.js library.
 *
 * #### Pass a Braintree object into checkout.js
 *
 * You can pass a `braintree` object into PayPal's checkout.js library. This will create the necessary Braintree {@link moudle:braintree-web/client.create|client} and {@link moudle:braintree-web/paypal-checkout.create|PayPal Checkout} components and automatically tokenize the authorized PayPal account. Use this integration option if you are not integrating with any other Braintree components.
 *
 * ```javascript
 * paypal.Button.render({
 *   braintree: braintree, // this object is available on the window by including the client and paypal-checkout component scripts on the page
 *   client: {
 *     production: 'production_authorization',
 *     sandbox: 'sandbox_authorization'
 *   },
 *
 *   env: 'production', // or 'sandbox'
 *
 *   payment: function (data, actions) {
 *     return actions.braintree.create({
 *       // your createPayment options here
 *     });
 *   },
 *
 *   onAuthorize: function (payload, actions) {
 *     // send payload.nonce to your server
 *
 *     // for more data about the user's PayPal account:
 *     // return actions.payment.get().then(function(data) { console.log(data); });
 *   }
 * }, '#paypal-button'); // the PayPal button will be rendered in an html element with the id `paypal-button`
 * ```
 *
 * If you are using `npm` to load braintree, simply pass in the invidual components:
 *
 * ```javascript
 * var btClient = require('braintree-web/client');
 * var btPayPal = require('braintree-web/paypal-checkout');
 *
 * paypal.Button.render({
 *   braintree: {
 *     client: btClient,
 *     paypalCheckout: btPayPal
 *   },
 *   client: {
 *     production: 'production_authorization',
 *     sandbox: 'sandbox_authorization'
 *   },
 *   // rest of checkout.js config
 * ```
 *
 * #### Create the Braintree components manually
 *
 * Alternatively, you can create the Braintree {@link moudle:braintree-web/client.create|client} and {@link moudle:braintree-web/paypal-checkout.create|PayPal Checkout} components manually. Use this integration style if you prefer to have some logic between receiving the authorized PayPal account and tokenizing it.
 *
 * ```javascript
 * braintree.client.create({
 *   authorization: 'authorization'
 * }).then(function (clientInstance) {
 *   return braintree.paypalCheckout.create({
 *     client: clientInstance
 *   });
 * }).then(function (paypalCheckoutInstance) {
 *   return paypal.Button.render({
 *     env: 'production', // or 'sandbox'
 *
 *     payment: function () {
 *       return paypalCheckoutInstance.createPayment({
 *         // your createPayment options here
 *       });
 *     },
 *
 *     onAuthorize: function (data, actions) {
 *       // some logic here before tokenization happens below
 *       return paypalCheckoutInstance.tokenizePayment(data).then(function (payload) {
 *         // Submit payload.nonce to your server
 *       });
 *     }
 *   }, '#paypal-button');
 * }).catch(function (err) {
 *  console.error('Error!', err);
 * });
 * ```
 */
function PayPalCheckout(options) {
  this._client = options.client;
}

/**
 * Creates a PayPal payment ID or billing token using the given options. This is meant to be passed to PayPal's checkout.js library.
 * When a {@link callback} is defined, the function returns undefined and invokes the callback with the id to be used with the checkout.js library. Otherwise, it returns a Promise that resolves with the id.
 * @public
 * @param {object} options All options for the PayPalCheckout component.
 * @param {string} options.flow Set to 'checkout' for one-time payment flow, or 'vault' for Vault flow. If 'vault' is used with a client token generated with a customer ID, the PayPal account will be added to that customer as a saved payment method.
 * @param {string} [options.intent=authorize]
 * * `authorize` - Submits the transaction for authorization but not settlement.
 * * `order` - Validates the transaction without an authorization (i.e. without holding funds). Useful for authorizing and capturing funds up to 90 days after the order has been placed. Only available for Checkout flow.
 * * `sale` - Payment will be immediately submitted for settlement upon creating a transaction.
 * @param {boolean} [options.offerCredit=false] Offers PayPal Credit as the default funding instrument for the transaction. If the customer isn't pre-approved for PayPal Credit, they will be prompted to apply for it.
 * @param {string|number} [options.amount] The amount of the transaction. Required when using the Checkout flow.
 * @param {string} [options.currency] The currency code of the amount, such as 'USD'. Required when using the Checkout flow.
 * @param {string} [options.displayName] The merchant name displayed inside of the PayPal lightbox; defaults to the company name on your Braintree account
 * @param {string} [options.locale=en_US] Use this option to change the language, links, and terminology used in the PayPal flow. This locale will be used unless the buyer has set a preferred locale for their account. If an unsupported locale is supplied, a fallback locale (determined by buyer preference or browser data) will be used and no error will be thrown.
 *
 * Supported locales are:
 * `da_DK`,
 * `de_DE`,
 * `en_AU`,
 * `en_GB`,
 * `en_US`,
 * `es_ES`,
 * `fr_CA`,
 * `fr_FR`,
 * `id_ID`,
 * `it_IT`,
 * `ja_JP`,
 * `ko_KR`,
 * `nl_NL`,
 * `no_NO`,
 * `pl_PL`,
 * `pt_BR`,
 * `pt_PT`,
 * `ru_RU`,
 * `sv_SE`,
 * `th_TH`,
 * `zh_CN`,
 * `zh_HK`,
 * and `zh_TW`.
 *
 * @param {boolean} [options.enableShippingAddress=false] Returns a shipping address object in {@link PayPal#tokenize}.
 * @param {object} [options.shippingAddressOverride] Allows you to pass a shipping address you have already collected into the PayPal payment flow.
 * @param {string} options.shippingAddressOverride.line1 Street address.
 * @param {string} [options.shippingAddressOverride.line2] Street address (extended).
 * @param {string} options.shippingAddressOverride.city City.
 * @param {string} options.shippingAddressOverride.state State.
 * @param {string} options.shippingAddressOverride.postalCode Postal code.
 * @param {string} options.shippingAddressOverride.countryCode Country.
 * @param {string} [options.shippingAddressOverride.phone] Phone number.
 * @param {string} [options.shippingAddressOverride.recipientName] Recipient's name.
 * @param {boolean} [options.shippingAddressEditable=true] Set to false to disable user editing of the shipping address.
 * @param {string} [options.billingAgreementDescription] Use this option to set the description of the preapproved payment agreement visible to customers in their PayPal profile during Vault flows. Max 255 characters.
 * @param {string} [options.landingPageType] Use this option to specify the PayPal page to display when a user lands on the PayPal site to complete the payment.
 * * `login` - A PayPal account login page is used.
 * * `billing` - A non-PayPal account landing page is used.
 * @param {callback} [callback] The second argument is a PayPal `paymentId` or `billingToken` string, depending on whether `options.flow` is `checkout` or `vault`. This is also what is resolved by the promise if no callback is provided.
 * @example
 * // this paypal object is created by checkout.js
 * // see https://github.com/paypal/paypal-checkout
 * paypal.Button.render({
 *   // when createPayment resolves, it is automatically passed to checkout.js
 *   payment: function () {
 *    return paypalCheckoutInstance.createPayment({
 *       flow: 'checkout',
 *       amount: '10.00',
 *       currency: 'USD',
 *       intent: 'sale'
 *     });
 *   },
 *   // Add other options, e.g. onAuthorize, env, locale
 * }, '#paypal-button');
 *
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
PayPalCheckout.prototype.createPayment = function (options) {
  var endpoint;

  if (!options || !constants.FLOW_ENDPOINTS.hasOwnProperty(options.flow)) {
    return Promise.reject(new BraintreeError(errors.PAYPAL_FLOW_OPTION_REQUIRED));
  }

  endpoint = 'paypal_hermes/' + constants.FLOW_ENDPOINTS[options.flow];

  analytics.sendEvent(this._client, 'paypal-checkout.createPayment');
  if (options.offerCredit === true) {
    analytics.sendEvent(this._client, 'paypal-checkout.credit.offered');
  }

  return this._client.request({
    endpoint: endpoint,
    method: 'post',
    data: this._formatPaymentResourceData(options)
  }).then(function (response) {
    var flowToken;

    if (options.flow === 'checkout') {
      flowToken = response.paymentResource.paymentToken;
    } else {
      flowToken = response.agreementSetup.tokenId;
    }

    return flowToken;
  }).catch(function (err) {
    var status = err.details && err.details.httpStatus;

    if (status === 422) {
      return Promise.reject(new BraintreeError({
        type: errors.PAYPAL_INVALID_PAYMENT_OPTION.type,
        code: errors.PAYPAL_INVALID_PAYMENT_OPTION.code,
        message: errors.PAYPAL_INVALID_PAYMENT_OPTION.message,
        details: {
          originalError: err
        }
      }));
    }

    return Promise.reject(convertToBraintreeError(err, {
      type: errors.PAYPAL_FLOW_FAILED.type,
      code: errors.PAYPAL_FLOW_FAILED.code,
      message: errors.PAYPAL_FLOW_FAILED.message
    }));
  });
};

/**
 * Tokenizes the authorize data from PayPal's checkout.js library when completing a buyer approval flow.
 * When a {@link callback} is defined, invokes the callback with {@link PayPalCheckout~tokenizePayload|tokenizePayload} and returns undefined. Otherwise, returns a Promise that resolves with a {@link PayPalCheckout~tokenizePayload|tokenizePayload}.
 * @public
 * @param {object} tokenizeOptions Tokens and IDs required to tokenize the payment.
 * @param {string} tokenizeOptions.payerId Payer ID returned by PayPal `onAuthorize` callback.
 * @param {string} [tokenizeOptions.paymentId] Payment ID returned by PayPal `onAuthorize` callback.
 * @param {string} [tokenizeOptions.billingToken] Billing Token returned by PayPal `onAuthorize` callback.
 * @param {callback} [callback] The second argument, <code>payload</code>, is a {@link PayPalCheckout~tokenizePayload|tokenizePayload}. If no callback is provided, the promise resolves with a {@link PayPalCheckout~tokenizePayload|tokenizePayload}.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
PayPalCheckout.prototype.tokenizePayment = function (tokenizeOptions) {
  var self = this;
  var payload;
  var client = this._client;
  var options = {
    flow: tokenizeOptions.billingToken ? 'vault' : 'checkout',
    intent: tokenizeOptions.intent
  };
  var params = {
    // The paymentToken provided by Checkout.js v4 is the ECToken
    ecToken: tokenizeOptions.paymentToken,
    billingToken: tokenizeOptions.billingToken,
    payerId: tokenizeOptions.payerID,
    paymentId: tokenizeOptions.paymentID
  };

  analytics.sendEvent(client, 'paypal-checkout.tokenization.started');

  return client.request({
    endpoint: 'payment_methods/paypal_accounts',
    method: 'post',
    data: self._formatTokenizeData(options, params)
  }).then(function (response) {
    payload = self._formatTokenizePayload(response);

    analytics.sendEvent(client, 'paypal-checkout.tokenization.success');
    if (payload.creditFinancingOffered) {
      analytics.sendEvent(client, 'paypal-checkout.credit.accepted');
    }

    return payload;
  }).catch(function (err) {
    analytics.sendEvent(client, 'paypal-checkout.tokenization.failed');

    return Promise.reject(convertToBraintreeError(err, {
      type: errors.PAYPAL_ACCOUNT_TOKENIZATION_FAILED.type,
      code: errors.PAYPAL_ACCOUNT_TOKENIZATION_FAILED.code,
      message: errors.PAYPAL_ACCOUNT_TOKENIZATION_FAILED.message
    }));
  });
};

PayPalCheckout.prototype._formatPaymentResourceData = function (options) {
  var key;
  var gatewayConfiguration = this._client.getConfiguration().gatewayConfiguration;
  var paymentResource = {
    // returnUrl and cancelUrl are required in hermes create_payment_resource route
    // but are not validated and are not actually used with checkout.js
    returnUrl: 'x',
    cancelUrl: 'x',
    offerPaypalCredit: options.offerCredit === true,
    experienceProfile: {
      brandName: options.displayName || gatewayConfiguration.paypal.displayName,
      localeCode: options.locale,
      noShipping: (!options.enableShippingAddress).toString(),
      addressOverride: options.shippingAddressEditable === false,
      landingPageType: options.landingPageType
    }
  };

  if (options.flow === 'checkout') {
    paymentResource.amount = options.amount;
    paymentResource.currencyIsoCode = options.currency;

    if (options.hasOwnProperty('intent')) {
      paymentResource.intent = options.intent;
    }

    for (key in options.shippingAddressOverride) {
      if (options.shippingAddressOverride.hasOwnProperty(key)) {
        paymentResource[key] = options.shippingAddressOverride[key];
      }
    }
  } else {
    paymentResource.shippingAddress = options.shippingAddressOverride;

    if (options.billingAgreementDescription) {
      paymentResource.description = options.billingAgreementDescription;
    }
  }

  return paymentResource;
};

PayPalCheckout.prototype._formatTokenizeData = function (options, params) {
  var clientConfiguration = this._client.getConfiguration();
  var gatewayConfiguration = clientConfiguration.gatewayConfiguration;
  var isTokenizationKey = clientConfiguration.authorizationType === 'TOKENIZATION_KEY';
  var data = {
    paypalAccount: {
      correlationId: params.billingToken || params.ecToken,
      options: {
        validate: options.flow === 'vault' && !isTokenizationKey
      }
    }
  };

  if (params.billingToken) {
    data.paypalAccount.billingAgreementToken = params.billingToken;
  } else {
    data.paypalAccount.paymentToken = params.paymentId;
    data.paypalAccount.payerId = params.payerId;
    data.paypalAccount.unilateral = gatewayConfiguration.paypal.unvettedMerchant;

    if (options.intent) {
      data.paypalAccount.intent = options.intent;
    }
  }

  return data;
};

PayPalCheckout.prototype._formatTokenizePayload = function (response) {
  var payload;
  var account = {};

  if (response.paypalAccounts) {
    account = response.paypalAccounts[0];
  }

  payload = {
    nonce: account.nonce,
    details: {},
    type: account.type
  };

  if (account.details && account.details.payerInfo) {
    payload.details = account.details.payerInfo;
  }

  if (account.details && account.details.creditFinancingOffered) {
    payload.creditFinancingOffered = account.details.creditFinancingOffered;
  }

  return payload;
};

/**
 * Cleanly tear down anything set up by {@link module:braintree-web/paypal-checkout.create|create}.
 * @public
 * @param {callback} [callback] Called once teardown is complete. No data is returned if teardown completes successfully.
 * @example
 * paypalCheckoutInstance.teardown();
 * @example <caption>With callback</caption>
 * paypalCheckoutInstance.teardown(function () {
 *   // teardown is complete
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
PayPalCheckout.prototype.teardown = function () {
  convertMethodsToError(this, methods(PayPalCheckout.prototype));

  return Promise.resolve();
};

module.exports = wrapPromise.wrapPrototype(PayPalCheckout);

},{"../lib/analytics":62,"../lib/braintree-error":66,"../lib/convert-methods-to-error":72,"../lib/convert-to-braintree-error":73,"../lib/methods":85,"../lib/promise":87,"../paypal/shared/constants":95,"./errors":92,"@braintree/wrap-promise":21}],95:[function(require,module,exports){
'use strict';

module.exports = {
  LANDING_FRAME_NAME: 'braintreepaypallanding',
  FLOW_ENDPOINTS: {
    checkout: 'create_payment_resource',
    vault: 'setup_billing_agreement'
  }
};

},{}],96:[function(require,module,exports){
'use strict';

var BraintreeError = require('../../lib/braintree-error');
var analytics = require('../../lib/analytics');
var assign = require('../../lib/assign').assign;
var methods = require('../../lib/methods');
var convertMethodsToError = require('../../lib/convert-methods-to-error');
var constants = require('../shared/constants');
var useMin = require('../../lib/use-min');
var Bus = require('../../lib/bus');
var uuid = require('../../lib/vendor/uuid');
var deferred = require('../../lib/deferred');
var errors = require('../shared/errors');
var events = require('../shared/events');
var VERSION = "3.37.0";
var iFramer = require('@braintree/iframer');
var Promise = require('../../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');

var IFRAME_HEIGHT = 400;
var IFRAME_WIDTH = 400;

/**
 * @typedef {object} ThreeDSecure~verifyPayload
 * @property {string} nonce The new payment method nonce produced by the 3D Secure lookup. The original nonce passed into {@link ThreeDSecure#verifyCard|verifyCard} was consumed. This new nonce should be used to transact on your server.
 * @property {object} details Additional account details.
 * @property {string} details.cardType Type of card, ex: Visa, MasterCard.
 * @property {string} details.lastFour Last four digits of card number.
 * @property {string} details.lastTwo Last two digits of card number.
 * @property {string} description A human-readable description.
 * @property {object} binData Information about the card based on the bin.
 * @property {string} binData.commercial Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.countryOfIssuance The country of issuance.
 * @property {string} binData.debit Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.durbinRegulated Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.healthcare Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.issuingBank The issuing bank.
 * @property {string} binData.payroll Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.prepaid Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} binData.productId The product id.
 * @property {boolean} liabilityShiftPossible Indicates whether the card was eligible for 3D Secure.
 * @property {boolean} liabilityShifted Indicates whether the liability for fraud has been shifted away from the merchant.
 */

/**
 * @class
 * @param {object} options 3D Secure {@link module:braintree-web/three-d-secure.create create} options
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web/three-d-secure.create|braintree.threeDSecure.create} instead.</strong>
 * @classdesc This class represents a ThreeDSecure component produced by {@link module:braintree-web/three-d-secure.create|braintree.threeDSecure.create}. Instances of this class have a method for launching a 3D Secure authentication flow.
 */
function ThreeDSecure(options) {
  this._options = options;
  this._assetsUrl = options.client.getConfiguration().gatewayConfiguration.assetsUrl;
  this._isDebug = options.client.getConfiguration().isDebug;
  this._client = options.client;
}

/**
 * @callback ThreeDSecure~addFrameCallback
 * @param {?BraintreeError} [err] `null` or `undefined` if there was no error.
 * @param {HTMLIFrameElement} iframe An iframe element containing the bank's authentication page that you must put on your page.
 * @description The callback used for options.addFrame in {@link ThreeDSecure#verifyCard|verifyCard}.
 * @returns {void}
 */

/**
 * @callback ThreeDSecure~removeFrameCallback
 * @description The callback used for options.removeFrame in {@link ThreeDSecure#verifyCard|verifyCard}.
 * @returns {void}
 */

/**
 * Launch the 3D Secure login flow, returning a nonce payload.
 * @public
 * @param {object} options Options for card verification.
 * @param {string} options.nonce A nonce referencing the card to be verified. For example, this can be a nonce that was returned by Hosted Fields.
 * @param {number} options.amount The amount of the transaction in the current merchant account's currency. For example, if you are running a transaction of $123.45 US dollars, `amount` would be 123.45.
 * @param {callback} options.addFrame This {@link ThreeDSecure~addFrameCallback|addFrameCallback} will be called when the bank frame needs to be added to your page.
 * @param {callback} options.removeFrame This {@link ThreeDSecure~removeFrameCallback|removeFrameCallback} will be called when the bank frame needs to be removed from your page.
 * @param {string} [options.customer.mobilePhoneNumber] The mobile phone number used for verification. Only numbers; remove dashes, paranthesis and other characters.
 * @param {string} [options.customer.email] The email used for verification.
 * @param {string} [options.customer.shippingMethod] The 2-digit string indicating the shipping method chosen for the transaction.
 * @param {string} [options.customer.billingAddress.firstName] The first name associated with the address.
 * @param {string} [options.customer.billingAddress.lastName] The last name associated with the address.
 * @param {string} [options.customer.billingAddress.streetAddress] Line 1 of the Address (eg. number, street, etc).
 * @param {string} [options.customer.billingAddress.extendedAddress] Line 2 of the Address (eg. suite, apt #, etc.).
 * @param {string} [options.customer.billingAddress.locality] The locality (city) name associated with the address.
 * @param {string} [options.customer.billingAddress.region] The 2 letter code for US states, and the equivalent for other countries.
 * @param {string} [options.customer.billingAddress.postalCode] The zip code or equivalent for countries that have them.
 * @param {string} [options.customer.billingAddress.countryCodeAlpha2] The 2 character country code.
 * @param {string} [options.customer.billingAddress.phoneNumber] The phone number associated with the address. Only numbers; remove dashes, paranthesis and other characters.
 * @param {boolean} [options.showLoader=true] Whether to show the loader icon while the bank frame is loading.
 * @param {callback} [callback] The second argument, <code>data</code>, is a {@link ThreeDSecure~verifyPayload|verifyPayload}. If no callback is provided, it will return a promise that resolves {@link ThreeDSecure~verifyPayload|verifyPayload}.

 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * <caption>Verifying an existing nonce with 3DS</caption>
 * var my3DSContainer;
 *
 * threeDSecure.verifyCard({
 *   nonce: existingNonce,
 *   amount: 123.45,
 *   addFrame: function (err, iframe) {
 *     // Set up your UI and add the iframe.
 *     my3DSContainer = document.createElement('div');
 *     my3DSContainer.appendChild(iframe);
 *     document.body.appendChild(my3DSContainer);
 *   },
 *   removeFrame: function () {
 *     // Remove UI that you added in addFrame.
 *     document.body.removeChild(my3DSContainer);
 *   }
 * }, function (err, payload) {
 *   if (err) {
 *     console.error(err);
 *     return;
 *   }
 *
 *   if (payload.liabilityShifted) {
 *     // Liablity has shifted
 *     submitNonceToServer(payload.nonce);
 *   } else if (payload.liabilityShiftPossible) {
 *     // Liablity may still be shifted
 *     // Decide if you want to submit the nonce
 *   } else {
 *     // Liablity has not shifted and will not shift
 *     // Decide if you want to submit the nonce
 *   }
 * });
 */
ThreeDSecure.prototype.verifyCard = function (options) {
  var url, showLoader, addFrame, removeFrame, error, errorOption;
  var self = this;

  options = assign({}, options);

  if (options.customer && options.customer.billingAddress) {
    // map from public API to the API that the Gateway expects
    options.customer.billingAddress.line1 = options.customer.billingAddress.streetAddress;
    options.customer.billingAddress.line2 = options.customer.billingAddress.extendedAddress;
    options.customer.billingAddress.city = options.customer.billingAddress.locality;
    options.customer.billingAddress.state = options.customer.billingAddress.region;
    options.customer.billingAddress.countryCode = options.customer.billingAddress.countryCodeAlpha2;
    delete options.customer.billingAddress.streetAddress;
    delete options.customer.billingAddress.extendedAddress;
    delete options.customer.billingAddress.locality;
    delete options.customer.billingAddress.region;
    delete options.customer.billingAddress.countryCodeAlpha2;
  }

  if (this._verifyCardInProgress === true) {
    error = errors.THREEDS_AUTHENTICATION_IN_PROGRESS;
  } else if (!options.nonce) {
    errorOption = 'a nonce';
  } else if (!options.amount) {
    errorOption = 'an amount';
  } else if (typeof options.addFrame !== 'function') {
    errorOption = 'an addFrame function';
  } else if (typeof options.removeFrame !== 'function') {
    errorOption = 'a removeFrame function';
  }

  if (errorOption) {
    error = {
      type: errors.THREEDS_MISSING_VERIFY_CARD_OPTION.type,
      code: errors.THREEDS_MISSING_VERIFY_CARD_OPTION.code,
      message: 'verifyCard options must include ' + errorOption + '.'
    };
  }

  if (error) {
    return Promise.reject(new BraintreeError(error));
  }

  showLoader = options.showLoader !== false;

  this._verifyCardInProgress = true;

  addFrame = deferred(options.addFrame);
  removeFrame = deferred(options.removeFrame);

  url = 'payment_methods/' + options.nonce + '/three_d_secure/lookup';

  return this._client.request({
    endpoint: url,
    method: 'post',
    data: {amount: options.amount, customer: options.customer}
  }).then(function (response) {
    self._lookupPaymentMethod = response.paymentMethod;

    return new Promise(function (resolve, reject) {
      self._verifyCardCallback = function (verifyErr, payload) {
        self._verifyCardInProgress = false;

        if (verifyErr) {
          reject(verifyErr);
        } else {
          resolve(payload);
        }
      };

      self._handleLookupResponse({
        showLoader: showLoader,
        lookupResponse: response,
        addFrame: addFrame,
        removeFrame: removeFrame
      });
    });
  }).catch(function (err) {
    self._verifyCardInProgress = false;

    return Promise.reject(err);
  });
};

/**
 * Cancel the 3DS flow and return the verification payload if available.
 * @public
 * @param {callback} [callback] The second argument is a {@link ThreeDSecure~verifyPayload|verifyPayload}. If there is no verifyPayload (the initial lookup did not complete), an error will be returned. If no callback is passed, `cancelVerifyCard` will return a promise.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * threeDSecure.cancelVerifyCard(function (err, verifyPayload) {
 *   if (err) {
 *     // Handle error
 *     console.log(err.message); // No verification payload available
 *     return;
 *   }
 *
 *   verifyPayload.nonce; // The nonce returned from the 3ds lookup call
 *   verifyPayload.liabilityShifted; // boolean
 *   verifyPayload.liabilityShiftPossible; // boolean
 * });
 */
ThreeDSecure.prototype.cancelVerifyCard = function () {
  var response;

  this._verifyCardInProgress = false;

  if (!this._lookupPaymentMethod) {
    return Promise.reject(new BraintreeError(errors.THREEDS_NO_VERIFICATION_PAYLOAD));
  }

  response = assign({}, this._lookupPaymentMethod, {
    liabilityShiftPossible: this._lookupPaymentMethod.threeDSecureInfo.liabilityShiftPossible,
    liabilityShifted: this._lookupPaymentMethod.threeDSecureInfo.liabilityShifted,
    verificationDetails: this._lookupPaymentMethod.threeDSecureInfo.verificationDetails
  });

  return Promise.resolve(response);
};

ThreeDSecure.prototype._handleLookupResponse = function (options) {
  var details;
  var lookupResponse = options.lookupResponse;

  if (lookupResponse.lookup && lookupResponse.lookup.acsUrl && lookupResponse.lookup.acsUrl.length > 0) {
    options.addFrame(null, this._createIframe({
      showLoader: options.showLoader,
      response: lookupResponse.lookup,
      removeFrame: options.removeFrame
    }));
  } else {
    details = this._formatAuthResponse(lookupResponse.paymentMethod, lookupResponse.threeDSecureInfo);
    details.verificationDetails = lookupResponse.threeDSecureInfo;

    this._verifyCardCallback(null, details);
  }
};

ThreeDSecure.prototype._createIframe = function (options) {
  var url, authenticationCompleteBaseUrl;
  var parentURL = window.location.href;
  var response = options.response;

  this._bus = new Bus({
    channel: uuid(),
    merchantUrl: location.href
  });

  authenticationCompleteBaseUrl = this._assetsUrl + '/web/' + VERSION + '/html/three-d-secure-authentication-complete-frame.html?channel=' + encodeURIComponent(this._bus.channel) + '&';

  if (parentURL.indexOf('#') > -1) {
    parentURL = parentURL.split('#')[0];
  }

  this._bus.on(Bus.events.CONFIGURATION_REQUEST, function (reply) {
    reply({
      acsUrl: response.acsUrl,
      pareq: response.pareq,
      termUrl: response.termUrl + '&three_d_secure_version=' + VERSION + '&authentication_complete_base_url=' + encodeURIComponent(authenticationCompleteBaseUrl),
      md: response.md,
      parentUrl: parentURL
    });
  });

  this._bus.on(events.AUTHENTICATION_COMPLETE, function (data) {
    this._handleAuthResponse(data, options);
  }.bind(this));

  url = this._assetsUrl + '/web/' + VERSION + '/html/three-d-secure-bank-frame' + useMin(this._isDebug) + '.html?showLoader=' + options.showLoader;

  this._bankIframe = iFramer({
    src: url,
    height: IFRAME_HEIGHT,
    width: IFRAME_WIDTH,
    name: constants.LANDING_FRAME_NAME + '_' + this._bus.channel,
    title: '3D Secure Authorization Frame'
  });

  return this._bankIframe;
};

ThreeDSecure.prototype._handleAuthResponse = function (data, options) {
  var authResponse = JSON.parse(data.auth_response);

  this._bus.teardown();

  options.removeFrame();

  // This also has to be in a setTimeout so it executes after the `removeFrame`.
  deferred(function () {
    if (authResponse.success) {
      this._verifyCardCallback(null, this._formatAuthResponse(authResponse.paymentMethod, authResponse.threeDSecureInfo));
    } else if (authResponse.threeDSecureInfo && authResponse.threeDSecureInfo.liabilityShiftPossible) {
      this._verifyCardCallback(null, this._formatAuthResponse(this._lookupPaymentMethod, authResponse.threeDSecureInfo));
    } else {
      this._verifyCardCallback(new BraintreeError({
        type: BraintreeError.types.UNKNOWN,
        code: 'UNKNOWN_AUTH_RESPONSE',
        message: authResponse.error.message
      }));
    }
  }.bind(this))();
};

ThreeDSecure.prototype._formatAuthResponse = function (paymentMethod, threeDSecureInfo) {
  return {
    nonce: paymentMethod.nonce,
    binData: paymentMethod.binData,
    details: paymentMethod.details,
    description: paymentMethod.description && paymentMethod.description.replace(/\+/g, ' '),
    liabilityShifted: threeDSecureInfo.liabilityShifted,
    liabilityShiftPossible: threeDSecureInfo.liabilityShiftPossible
  };
};

/**
 * Cleanly remove anything set up by {@link module:braintree-web/three-d-secure.create|create}.
 * @public
 * @param {callback} [callback] Called on completion. If no callback is passed, `teardown` will return a promise.
 * @example
 * threeDSecure.teardown();
 * @example <caption>With callback</caption>
 * threeDSecure.teardown(function () {
 *   // teardown is complete
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
ThreeDSecure.prototype.teardown = function () {
  var iframeParent;

  convertMethodsToError(this, methods(ThreeDSecure.prototype));

  analytics.sendEvent(this._options.client, 'threedsecure.teardown-completed');

  if (this._bus) {
    this._bus.teardown();
  }

  if (this._bankIframe) {
    iframeParent = this._bankIframe.parentNode;

    if (iframeParent) {
      iframeParent.removeChild(this._bankIframe);
    }
  }

  return Promise.resolve();
};

module.exports = wrapPromise.wrapPrototype(ThreeDSecure);

},{"../../lib/analytics":62,"../../lib/assign":63,"../../lib/braintree-error":66,"../../lib/bus":69,"../../lib/convert-methods-to-error":72,"../../lib/deferred":75,"../../lib/methods":85,"../../lib/promise":87,"../../lib/use-min":89,"../../lib/vendor/uuid":91,"../shared/constants":98,"../shared/errors":99,"../shared/events":100,"@braintree/iframer":14,"@braintree/wrap-promise":21}],97:[function(require,module,exports){
'use strict';
/** @module braintree-web/three-d-secure */

var ThreeDSecure = require('./external/three-d-secure');
var isHTTPS = require('../lib/is-https').isHTTPS;
var basicComponentVerification = require('../lib/basic-component-verification');
var BraintreeError = require('../lib/braintree-error');
var analytics = require('../lib/analytics');
var errors = require('./shared/errors');
var VERSION = "3.37.0";
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');

/**
 * @static
 * @function create
 * @param {object} options Creation options:
 * @param {Client} options.client A {@link Client} instance.
 * @param {callback} [callback] The second argument, `data`, is the {@link ThreeDSecure} instance. If no callback is provided, it returns a promise that resolves the {@link ThreeDSecure} instance.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
function create(options) {
  return basicComponentVerification.verify({
    name: '3D Secure',
    client: options.client
  }).then(function () {
    var error, isProduction;
    var config = options.client.getConfiguration();

    if (!config.gatewayConfiguration.threeDSecureEnabled) {
      error = errors.THREEDS_NOT_ENABLED;
    }

    if (config.authorizationType === 'TOKENIZATION_KEY') {
      error = errors.THREEDS_CAN_NOT_USE_TOKENIZATION_KEY;
    }

    isProduction = config.gatewayConfiguration.environment === 'production';

    if (isProduction && !isHTTPS()) {
      error = errors.THREEDS_HTTPS_REQUIRED;
    }

    if (error) {
      return Promise.reject(new BraintreeError(error));
    }

    analytics.sendEvent(options.client, 'threedsecure.initialized');

    return new ThreeDSecure(options);
  });
}

module.exports = {
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/analytics":62,"../lib/basic-component-verification":64,"../lib/braintree-error":66,"../lib/is-https":82,"../lib/promise":87,"./external/three-d-secure":96,"./shared/errors":99,"@braintree/wrap-promise":21}],98:[function(require,module,exports){
'use strict';

module.exports = {
  LANDING_FRAME_NAME: 'braintreethreedsecurelanding'
};

},{}],99:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.3D Secure - Creation Error Codes
 * @description Errors that occur when [creating the 3D Secure component](/current/module-braintree-web_three-d-secure.html#.create).
 * @property {MERCHANT} THREEDS_NOT_ENABLED Occurs when 3D Secure is not enabled in the Braintree control panel.
 * @property {MERCHANT} THREEDS_CAN_NOT_USE_TOKENIZATION_KEY Occurs when 3D Secure component is created without a Client Token.
 * @property {MERCHANT} THREEDS_HTTPS_REQUIRED Occurs when 3D Secure component is created in production over HTTPS.
 */

/**
 * @name BraintreeError.3D Secure - verifyCard Error Codes
 * @description Errors that occur when using the [`verifyCard` method](/current/ThreeDSecure.html#verifyCard).
 * @property {MERCHANT} THREEDS_AUTHENTICATION_IN_PROGRESS Occurs when another verification is already in progress.
 * @property {MERCHANT} THREEDS_MISSING_VERIFY_CARD_OPTION Occurs when a required option is missing.
 */

/**
 * @name BraintreeError.3D Secure - cancelVerifyCard Error Codes
 * @description Errors that occur when using the [`cancelVerifyCard` method](/current/ThreeDSecure.html#cancelVerifyCard).
 * @property {MERCHANT} THREEDS_NO_VERIFICATION_PAYLOAD Occurs when the 3D Secure flow is cancelled, but there is no 3D Secure information available.
 */

/**
 * @name BraintreeError.3D Secure - Internal Error Codes
 * @ignore
 * @description Errors that occur internally
 * @property {INTERNAL} THREEDS_TERM_URL_REQUIRES_BRAINTREE_DOMAIN Occurs when iframe is initialized on a non-verified domain.
 */

var BraintreeError = require('../../lib/braintree-error');

module.exports = {
  THREEDS_NOT_ENABLED: {
    type: BraintreeError.types.MERCHANT,
    code: 'THREEDS_NOT_ENABLED',
    message: '3D Secure is not enabled for this merchant.'
  },
  THREEDS_CAN_NOT_USE_TOKENIZATION_KEY: {
    type: BraintreeError.types.MERCHANT,
    code: 'THREEDS_CAN_NOT_USE_TOKENIZATION_KEY',
    message: '3D Secure can not use a tokenization key for authorization.'
  },
  THREEDS_HTTPS_REQUIRED: {
    type: BraintreeError.types.MERCHANT,
    code: 'THREEDS_HTTPS_REQUIRED',
    message: '3D Secure requires HTTPS.'
  },
  THREEDS_AUTHENTICATION_IN_PROGRESS: {
    type: BraintreeError.types.MERCHANT,
    code: 'THREEDS_AUTHENTICATION_IN_PROGRESS',
    message: 'Cannot call verifyCard while existing authentication is in progress.'
  },
  THREEDS_MISSING_VERIFY_CARD_OPTION: {
    type: BraintreeError.types.MERCHANT,
    code: 'THREEDS_MISSING_VERIFY_CARD_OPTION'
  },
  THREEDS_NO_VERIFICATION_PAYLOAD: {
    type: BraintreeError.types.MERCHANT,
    code: 'THREEDS_NO_VERIFICATION_PAYLOAD',
    message: 'No verification payload available.'
  },
  THREEDS_TERM_URL_REQUIRES_BRAINTREE_DOMAIN: {
    type: BraintreeError.types.INTERNAL,
    code: 'THREEDS_TERM_URL_REQUIRES_BRAINTREE_DOMAIN',
    message: 'Term Url must be on a Braintree domain.'
  }
};

},{"../../lib/braintree-error":66}],100:[function(require,module,exports){
'use strict';

var enumerate = require('../../lib/enumerate');

module.exports = enumerate([
  'AUTHENTICATION_COMPLETE'
], 'threedsecure:');

},{"../../lib/enumerate":77}],101:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Vault Manager - deletePaymentMethod Error Codes
 * @description Errors that occur when using the [`deletePaymentMethod` method](/current/VaultManager.html#deletePaymentMethod).
 * @property {MERCHANT} VAULT_MANAGER_DELETE_PAYMENT_METHOD_NONCE_REQUIRES_CLIENT_TOKEN Occurs when vault manager is initalized with a tokenization key instead of a Client Token.
 * @property {MERCHANT} VAULT_MANAGER_PAYMENT_METHOD_NONCE_NOT_FOUND Occurs when the specified payment method can not be found.
 * @property {UNKNOWN} VAULT_MANAGER_DELETE_PAYMENT_METHOD_UNKNOWN_ERROR Occurs when there is an error attempting to delete the payment method.
 */

var BraintreeError = require('../lib/braintree-error');

module.exports = {
  VAULT_MANAGER_DELETE_PAYMENT_METHOD_NONCE_REQUIRES_CLIENT_TOKEN: {
    type: BraintreeError.types.MERCHANT,
    code: 'VAULT_MANAGER_DELETE_PAYMENT_METHOD_NONCE_REQUIRES_CLIENT_TOKEN',
    message: 'A client token with a customer id must be used to delete a payment method nonce.'
  },
  VAULT_MANAGER_PAYMENT_METHOD_NONCE_NOT_FOUND: {
    type: BraintreeError.types.MERCHANT,
    code: 'VAULT_MANAGER_PAYMENT_METHOD_NONCE_NOT_FOUND'
  },
  VAULT_MANAGER_DELETE_PAYMENT_METHOD_UNKNOWN_ERROR: {
    type: BraintreeError.types.UNKNOWN,
    code: 'VAULT_MANAGER_DELETE_PAYMENT_METHOD_UNKNOWN_ERROR'
  }
};

},{"../lib/braintree-error":66}],102:[function(require,module,exports){
'use strict';
/**
 * @module braintree-web/vault-manager
 * @description Manages customer's payment methods.
 */

var basicComponentVerification = require('../lib/basic-component-verification');
var VaultManager = require('./vault-manager');
var VERSION = "3.37.0";
var wrapPromise = require('@braintree/wrap-promise');

/**
 * @static
 * @function create
 * @param {object} options Creation options:
 * @param {Client} options.client A {@link Client} instance.
 * @param {callback} callback The second argument, `data`, is the {@link VaultManager} instance.
 * @returns {void}
 */
function create(options) {
  return basicComponentVerification.verify({
    name: 'Vault Manager',
    client: options.client
  }).then(function () {
    return new VaultManager(options);
  });
}

module.exports = {
  create: wrapPromise(create),
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/basic-component-verification":64,"./vault-manager":103,"@braintree/wrap-promise":21}],103:[function(require,module,exports){
'use strict';

var analytics = require('../lib/analytics');
var BraintreeError = require('../lib/braintree-error');
var errors = require('./errors');
var convertMethodsToError = require('../lib/convert-methods-to-error');
var methods = require('../lib/methods');
var Promise = require('../lib/promise');
var wrapPromise = require('@braintree/wrap-promise');

var DELETE_PAYMENT_METHOD_MUTATION = 'mutation DeletePaymentMethodFromSingleUseToken($input: DeletePaymentMethodFromSingleUseTokenInput!) {' +
'  deletePaymentMethodFromSingleUseToken(input: $input) {' +
'    clientMutationId' +
'  }' +
'}';

/**
 * @typedef {array} VaultManager~fetchPaymentMethodsPayload The customer's payment methods.
 * @property {object} paymentMethod The payment method object.
 * @property {string} paymentMethod.nonce A nonce that can be sent to your server to transact on the payment method.
 * @property {boolean} paymentMethod.default Whether or not this is the default payment method for the customer.
 * @property {object} paymentMethod.details Any additional details about the payment method. Varies depending on the type of payment method.
 * @property {string} paymentMethod.type A constant indicating the type of payment method.
 * @property {?string} paymentMethod.description Additional description about the payment method.
 * @property {?object} paymentMethod.binData Bin data about the payment method.
 *
 */

/**
 * @class
 * @param {object} options Options
 * @description <strong>You cannot use this constructor directly. Use {@link module:braintree-web/vault-manager.create|braintree.vault-manager.create} instead.</strong>
 * @classdesc This class allows you to manage a customer's payment methods on the client.
 */
function VaultManager(options) {
  this._client = options.client;
}

/**
 * Fetches payment methods owned by the customer whose id was used to generate the client token used to create the {@link module:braintree-web/client|client}.
 * @public
 * @param {object} [options] Options for fetching payment methods.
 * @param {boolean} [options.defaultFirst = false] If `true`, the payment methods will be returned with the default payment method for the customer first. Otherwise, the payment methods will be returned with the most recently used payment method first.
 * @param {callback} [callback] The second argument is a {@link VaultManager~fetchPaymentMethodsPayload|fetchPaymentMehodsPayload}. This is also what is resolved by the promise if no callback is provided.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * vaultManagerInstance.fetchPaymentMethods(function (err, paymentMethods) {
 *   paymentMethods.forEach(function (paymentMethod) {
 *     // add payment method to UI
 *     // paymentMethod.nonce <- transactable nonce associated with payment method
 *     // paymentMethod.details <- object with additional information about payment method
 *     // paymentMethod.type <- a constant signifying the type
 *   });
 * });
 */
VaultManager.prototype.fetchPaymentMethods = function (options) {
  var defaultFirst;

  options = options || {};

  defaultFirst = options.defaultFirst === true ? 1 : 0;

  return this._client.request({
    endpoint: 'payment_methods',
    method: 'get',
    data: {
      defaultFirst: defaultFirst
    }
  }).then(function (paymentMethodsPayload) {
    analytics.sendEvent(this._client, 'vault-manager.fetch-payment-methods.succeeded');

    return paymentMethodsPayload.paymentMethods.map(formatPaymentMethodPayload);
  }.bind(this));
};

/**
 * Deletes a payment method owned by the customer whose id was used to generate the client token used to create the {@link module:braintree-web/client|client}.
 * @public
 * @ignore TODO hide from jsdoc for now until the GraphQL API is on for all merchants by default
 * @param {string} paymentMethodNonce The payment method nonce that references a vaulted payment method.
 * @param {callback} [callback] No data is returned if the operation is successful.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * vaultManagerInstance.deletePaymentMethod('nonce-to-delete', function (err) {
 *   // handle err if it exists
 * });
 */
VaultManager.prototype.deletePaymentMethod = function (paymentMethodNonce) {
  var client = this._client;
  var usesClientToken = this._client.getConfiguration().authorizationType === 'CLIENT_TOKEN';

  if (!usesClientToken) {
    return Promise.reject(new BraintreeError(errors.VAULT_MANAGER_DELETE_PAYMENT_METHOD_NONCE_REQUIRES_CLIENT_TOKEN));
  }

  return this._client.request({
    api: 'graphQLApi',
    data: {
      query: DELETE_PAYMENT_METHOD_MUTATION,
      variables: {
        input: {
          singleUseTokenId: paymentMethodNonce
        }
      },
      operationName: 'DeletePaymentMethodFromSingleUseToken'
    }
  }).then(function () {
    analytics.sendEvent(client, 'vault-manager.delete-payment-method.succeeded');

    // noop to prevent sending back the raw graphql data
  }).catch(function (error) {
    var originalError = error.details.originalError;
    var formattedError;

    analytics.sendEvent(client, 'vault-manager.delete-payment-method.failed');

    if (originalError[0] && originalError[0].extensions.errorClass === 'NOT_FOUND') {
      formattedError = new BraintreeError({
        type: errors.VAULT_MANAGER_PAYMENT_METHOD_NONCE_NOT_FOUND.type,
        code: errors.VAULT_MANAGER_PAYMENT_METHOD_NONCE_NOT_FOUND.code,
        message: 'A payment method for payment method nonce `' + paymentMethodNonce + '` could not be found.',
        details: {
          originalError: originalError
        }
      });
    }

    if (!formattedError) {
      formattedError = new BraintreeError({
        type: errors.VAULT_MANAGER_DELETE_PAYMENT_METHOD_UNKNOWN_ERROR.type,
        code: errors.VAULT_MANAGER_DELETE_PAYMENT_METHOD_UNKNOWN_ERROR.code,
        message: 'An unknown error occured when attempting to delete the payment method assocaited with the payment method nonce `' + paymentMethodNonce + '`.',
        details: {
          originalError: originalError
        }
      });
    }

    return Promise.reject(formattedError);
  });
};

function formatPaymentMethodPayload(paymentMethod) {
  var formattedPaymentMethod = {
    nonce: paymentMethod.nonce,
    'default': paymentMethod.default,
    details: paymentMethod.details,
    hasSubscription: paymentMethod.hasSubscription,
    type: paymentMethod.type
  };

  if (paymentMethod.description) {
    formattedPaymentMethod.description = paymentMethod.description;
  }

  if (paymentMethod.binData) {
    formattedPaymentMethod.binData = paymentMethod.binData;
  }

  return formattedPaymentMethod;
}

/**
 * Cleanly tear down anything set up by {@link module:braintree-web/vault-manager.create|create}.
 * @public
 * @param {callback} [callback] Called once teardown is complete. No data is returned if teardown completes successfully.
 * @example
 * vaultManagerInstance.teardown();
 * @example <caption>With callback</caption>
 * vaultManagerInstance.teardown(function () {
 *   // teardown is complete
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
VaultManager.prototype.teardown = function () {
  convertMethodsToError(this, methods(VaultManager.prototype));

  return Promise.resolve();
};

module.exports = wrapPromise.wrapPrototype(VaultManager);

},{"../lib/analytics":62,"../lib/braintree-error":66,"../lib/convert-methods-to-error":72,"../lib/methods":85,"../lib/promise":87,"./errors":101,"@braintree/wrap-promise":21}],104:[function(require,module,exports){
'use strict';
/** @module braintree-web/venmo */

var analytics = require('../lib/analytics');
var basicComponentVerification = require('../lib/basic-component-verification');
var errors = require('./shared/errors');
var wrapPromise = require('@braintree/wrap-promise');
var BraintreeError = require('../lib/braintree-error');
var Venmo = require('./venmo');
var Promise = require('../lib/promise');
var supportsVenmo = require('./shared/supports-venmo');
var VERSION = "3.37.0";

/**
 * @static
 * @function create
 * @param {object} options Creation options:
 * @param {Client} options.client A {@link Client} instance.
 * @param {boolean} [options.allowNewBrowserTab=true] This should be set to false if your payment flow requires returning to the same tab, e.g. single page applications. Doing so causes {@link Venmo#isBrowserSupported|isBrowserSupported} to return true only for mobile web browsers that support returning from the Venmo app to the same tab.
 * @param {string} [options.profileId] The Venmo profile ID to be used during payment authorization. Customers will see the business name and logo associated with this Venmo profile, and it will show up in the Venmo app as a "Connected Merchant". Venmo profile IDs can be found in the Braintree Control Panel. Omitting this value will use the default Venmo profile.
 * @param {callback} [callback] The second argument, `data`, is the {@link Venmo} instance. If no callback is provided, `create` returns a promise that resolves with the {@link Venmo} instance.
 * @example
 * braintree.venmo.create({
 *   client: clientInstance
 * }).then(function (venmoInstance) {
 *   // venmoInstance is ready to be used.
 * }).catch(function (createErr) {
 *   console.error('Error creating Venmo instance', createErr);
 * });
 * @returns {Promise|void} Returns the Venmo instance.
 */
function create(options) {
  return basicComponentVerification.verify({
    name: 'Venmo',
    client: options.client
  }).then(function () {
    var instance;
    var configuration = options.client.getConfiguration();

    if (!configuration.gatewayConfiguration.payWithVenmo) {
      return Promise.reject(new BraintreeError(errors.VENMO_NOT_ENABLED));
    }

    if (options.profileId && typeof options.profileId !== 'string') {
      return Promise.reject(new BraintreeError(errors.VENMO_INVALID_PROFILE_ID));
    }

    instance = new Venmo(options);

    analytics.sendEvent(options.client, 'venmo.initialized');

    return instance._initialize();
  });
}

/**
 * @static
 * @function isBrowserSupported
 * @param {object} [options] browser support options:
 * @param {boolean} [options.allowNewBrowserTab=true] This should be set to false if your payment flow requires returning to the same tab, e.g. single page applications.
 * @example
 * if (braintree.venmo.isBrowserSupported()) {
 *   // set up Venmo
 * }
 * @example <caption>Explicitly require browser support returning to the same tab</caption>
 * if (braintree.venmo.isBrowserSupported({
 *   allowNewBrowserTab: false
 * })) {
 *   // set up Venmo
 * }
 * @returns {boolean} Whether or not the browser supports Venmo.
 */
function isBrowserSupported(options) {
  return supportsVenmo.isBrowserSupported(options);
}

module.exports = {
  create: wrapPromise(create),
  isBrowserSupported: isBrowserSupported,
  /**
   * @description The current version of the SDK, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"../lib/analytics":62,"../lib/basic-component-verification":64,"../lib/braintree-error":66,"../lib/promise":87,"./shared/errors":107,"./shared/supports-venmo":108,"./venmo":109,"@braintree/wrap-promise":21}],105:[function(require,module,exports){
'use strict';

var isAndroid = require('@braintree/browser-detection/is-android');
var isChrome = require('@braintree/browser-detection/is-chrome');
var isIos = require('@braintree/browser-detection/is-ios');
var isIosSafari = require('@braintree/browser-detection/is-ios-safari');
var isSamsungBrowser = require('@braintree/browser-detection/is-samsung');
var isMobileFirefox = require('@braintree/browser-detection/is-mobile-firefox');

module.exports = {
  isAndroid: isAndroid,
  isChrome: isChrome,
  isIos: isIos,
  isIosSafari: isIosSafari,
  isSamsungBrowser: isSamsungBrowser,
  isMobileFirefox: isMobileFirefox
};

},{"@braintree/browser-detection/is-android":1,"@braintree/browser-detection/is-chrome":2,"@braintree/browser-detection/is-ios":11,"@braintree/browser-detection/is-ios-safari":9,"@braintree/browser-detection/is-mobile-firefox":12,"@braintree/browser-detection/is-samsung":13}],106:[function(require,module,exports){
'use strict';

module.exports = {
  DOCUMENT_VISIBILITY_CHANGE_EVENT_DELAY: 500,
  PROCESS_RESULTS_DELAY: 1000,
  VENMO_OPEN_URL: 'https://venmo.com/braintree/checkout'
};

},{}],107:[function(require,module,exports){
'use strict';

/**
 * @name BraintreeError.Venmo - Creation Error Codes
 * @description Errors that occur when [creating the Venmo component](/current/module-braintree-web_venmo.html#.create).
 * @property {MERCHANT} VENMO_NOT_ENABLED Occurs when Venmo is not enabled on the Braintree control panel.
 * @property {MERCHANT} VENMO_INVALID_PROFILE_ID Occurs when Venmo is intilaized with a profile id, but it is invalid.
 */

/**
 * @name BraintreeError.Venmo - tokenize Error Codes
 * @description Errors that occur when using the [`tokenize` method](/current/Venmo.html#tokenize).
 * @property {MERCHANT} VENMO_TOKENIZATION_REQUEST_ACTIVE Occurs when `tokenize` is called when the flow is already in progress.
 * @property {UNKNOWN} VENMO_APP_FAILED Occurs when tokenization fails.
 * @property {CUSTOMER} VENMO_APP_CANCELED Occurs when customer cancels flow from the Venmo app.
 * @property {CUSTOMER} VENMO_CANCELED Occurs when customer cancels the flow or Venmo app is not available.
 */

var BraintreeError = require('../../lib/braintree-error');

module.exports = {
  VENMO_NOT_ENABLED: {
    type: BraintreeError.types.MERCHANT,
    code: 'VENMO_NOT_ENABLED',
    message: 'Venmo is not enabled for this merchant.'
  },
  VENMO_TOKENIZATION_REQUEST_ACTIVE: {
    type: BraintreeError.types.MERCHANT,
    code: 'VENMO_TOKENIZATION_REQUEST_ACTIVE',
    message: 'Another tokenization request is active.'
  },
  VENMO_APP_FAILED: {
    type: BraintreeError.types.UNKNOWN,
    code: 'VENMO_APP_FAILED',
    message: 'Venmo app encountered a problem.'
  },
  VENMO_APP_CANCELED: {
    type: BraintreeError.types.CUSTOMER,
    code: 'VENMO_APP_CANCELED',
    message: 'Venmo app authorization was canceled.'
  },
  VENMO_CANCELED: {
    type: BraintreeError.types.CUSTOMER,
    code: 'VENMO_CANCELED',
    message: 'User canceled Venmo authorization, or Venmo app is not available.'
  },
  VENMO_INVALID_PROFILE_ID: {
    type: BraintreeError.types.MERCHANT,
    code: 'VENMO_INVALID_PROFILE_ID',
    message: 'Venmo profile ID is invalid.'
  }
};

},{"../../lib/braintree-error":66}],108:[function(require,module,exports){
'use strict';

var browserDetection = require('./browser-detection');

function isBrowserSupported(options) {
  var isAndroidChrome = browserDetection.isAndroid() && browserDetection.isChrome();
  var isIosChrome = browserDetection.isIos() && browserDetection.isChrome();
  var supportsReturnToSameTab = browserDetection.isIosSafari() || isAndroidChrome;
  var supportsReturnToNewTab = isIosChrome || browserDetection.isSamsungBrowser() || browserDetection.isMobileFirefox();

  options = options || {
    allowNewBrowserTab: true
  };

  return supportsReturnToSameTab || (options.allowNewBrowserTab && supportsReturnToNewTab);
}

module.exports = {
  isBrowserSupported: isBrowserSupported
};

},{"./browser-detection":105}],109:[function(require,module,exports){
(function (global){
'use strict';

var analytics = require('../lib/analytics');
var isBrowserSupported = require('./shared/supports-venmo');
var constants = require('./shared/constants');
var errors = require('./shared/errors');
var querystring = require('../lib/querystring');
var methods = require('../lib/methods');
var convertMethodsToError = require('../lib/convert-methods-to-error');
var wrapPromise = require('@braintree/wrap-promise');
var BraintreeError = require('../lib/braintree-error');
var Promise = require('../lib/promise');
var VERSION = "3.37.0";

/**
 * Venmo tokenize payload.
 * @typedef {object} Venmo~tokenizePayload
 * @property {string} nonce The payment method nonce.
 * @property {string} type The payment method type, always `VenmoAccount`.
 * @property {object} details Additional Venmo account details.
 * @property {string} details.username Username of the Venmo account.
 */

/**
 * @class
 * @param {object} options The Venmo {@link module:braintree-web/venmo.create create} options.
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web/venmo.create|braintree-web.venmo.create} instead.</strong>
 * @classdesc This class represents a Venmo component produced by {@link module:braintree-web/venmo.create|braintree-web/venmo.create}. Instances of this class have methods for tokenizing Venmo payments.
 */
function Venmo(options) {
  var configuration;

  this._client = options.client;
  configuration = this._client.getConfiguration();
  this._isDebug = configuration.isDebug;
  this._assetsUrl = configuration.gatewayConfiguration.assetsUrl + '/web/' + VERSION;
  this._allowNewBrowserTab = options.allowNewBrowserTab !== false;
  this._profileId = options.profileId;
}

Venmo.prototype._initialize = function () {
  var currentUrl = global.location.href.replace(global.location.hash, '');
  var params = querystring.parse(global.location.href);
  var configuration = this._client.getConfiguration();
  var venmoConfiguration = configuration.gatewayConfiguration.payWithVenmo;
  var analyticsMetadata = this._client.getConfiguration().analyticsMetadata;
  var braintreeData = {
    _meta: {
      version: analyticsMetadata.sdkVersion,
      integration: analyticsMetadata.integration,
      platform: analyticsMetadata.platform,
      sessionId: analyticsMetadata.sessionId
    }
  };

  params['x-success'] = currentUrl + '#venmoSuccess=1';
  params['x-cancel'] = currentUrl + '#venmoCancel=1';
  params['x-error'] = currentUrl + '#venmoError=1';
  params.ua = global.navigator.userAgent;
  /* eslint-disable camelcase */
  params.braintree_merchant_id = this._profileId || venmoConfiguration.merchantId;
  params.braintree_access_token = venmoConfiguration.accessToken;
  params.braintree_environment = venmoConfiguration.environment;
  params.braintree_sdk_data = btoa(JSON.stringify(braintreeData));
  /* eslint-enable camelcase */

  this._url = constants.VENMO_OPEN_URL + '?' + querystring.stringify(params);

  return Promise.resolve(this);
};

/**
 * Returns a boolean indicating whether the current browser supports Venmo as a payment method.
 *
 * If `options.allowNewBrowserTab` is false when calling {@link module:braintree-web/venmo.create|venmo.create}, this method will return true only for browsers known to support returning from the Venmo app to the same browser tab. Currently, this is limited to iOS Safari and Android Chrome.
 * @public
 * @returns {boolean} True if the current browser is supported, false if not.
 */
Venmo.prototype.isBrowserSupported = function () {
  return isBrowserSupported.isBrowserSupported({
    allowNewBrowserTab: this._allowNewBrowserTab
  });
};

/**
 * Returns a boolean indicating whether a Venmo tokenization result is ready to be processed immediately.
 *
 * This method should be called after initialization to see if the result of Venmo authorization is available. If it returns true, call {@link Venmo#tokenize|tokenize} immediately to process the results.
 *
 * @public
 * @returns {boolean} True if the results of Venmo payment authorization are available and ready to process.
 */
Venmo.prototype.hasTokenizationResult = function () {
  var params = getFragmentParameters();

  return typeof (params.venmoSuccess || params.venmoError || params.venmoCancel) !== 'undefined';
};

/**
 * Launches the Venmo flow and returns a nonce payload.
 *
 * If {@link Venmo#hasTokenizationResult|hasTokenizationResult} returns true, calling tokenize will immediately process and return the results without initiating the Venmo payment authorization flow.
 *
 * Only one Venmo flow can be active at a time. One way to achieve this is to disable your Venmo button while the flow is open.
 * @public
 * @param {callback} [callback] The second argument, <code>data</code>, is a {@link Venmo~tokenizePayload|tokenizePayload}. If no callback is provided, the method will return a Promise that resolves with a {@link Venmo~tokenizePayload|tokenizePayload}.
 * @returns {Promise|void} Returns a promise if no callback is provided.
 * @example
 * button.addEventListener('click', function () {
 *   // Disable the button so that we don't attempt to open multiple popups.
 *   button.setAttribute('disabled', 'disabled');
 *
 *   // Because tokenize opens a new window, this must be called
 *   // as a result of a user action, such as a button click.
 *   venmoInstance.tokenize().then(function (payload) {
 *     // Submit payload.nonce to your server
 *     // Use payload.username to get the Venmo username and display any UI
 *   }).catch(function (tokenizeError) {
 *     // Handle flow errors or premature flow closure
 *     switch (tokenizeErr.code) {
 *       case 'VENMO_APP_CANCELED':
 *         console.log('User canceled Venmo flow.');
 *         break;
 *       case 'VENMO_CANCELED':
 *         console.log('User canceled Venmo, or Venmo app is not available.');
 *         break;
 *       default:
 *         console.error('Error!', tokenizeErr);
 *     }
 *   }).then(function () {
 *     button.removeAttribute('disabled');
 *   });
 * });
 */
Venmo.prototype.tokenize = function () {
  var self = this;

  if (this._tokenizationInProgress === true) {
    return Promise.reject(new BraintreeError(errors.VENMO_TOKENIZATION_REQUEST_ACTIVE));
  }

  if (this.hasTokenizationResult()) {
    return this._processResults();
  }

  return new Promise(function (resolve, reject) {
    self._tokenizationInProgress = true;
    self._previousHash = global.location.hash;

    global.open(self._url);

    // Subscribe to document visibility change events to detect when app switch
    // has returned.
    self._visibilityChangeListener = function () {
      if (!global.document.hidden) {
        self._tokenizationInProgress = false;

        setTimeout(function () {
          self._processResults().then(resolve).catch(reject).then(function () {
            global.location.hash = self._previousHash;
            self._removeVisibilityEventListener();
            delete self._visibilityChangeListener;
          });
        }, constants.PROCESS_RESULTS_DELAY);
      }
    };

    // Add a brief delay to ignore visibility change events that occur right before app switch
    setTimeout(function () {
      global.document.addEventListener(documentVisibilityChangeEventName(), self._visibilityChangeListener);
    }, constants.DOCUMENT_VISIBILITY_CHANGE_EVENT_DELAY);
  });
};

/**
 * Cleanly tear down anything set up by {@link module:braintree-web/venmo.create|create}.
 * @public
 * @param {callback} [callback] Called once teardown is complete. No data is returned if teardown completes successfully.
 * @example
 * venmoInstance.teardown();
 * @example <caption>With callback</caption>
 * venmoInstance.teardown(function () {
 *   // teardown is complete
 * });
 * @returns {Promise|void} Returns a promise if no callback is provided.
 */
Venmo.prototype.teardown = function () {
  this._removeVisibilityEventListener();
  convertMethodsToError(this, methods(Venmo.prototype));

  return Promise.resolve();
};

Venmo.prototype._removeVisibilityEventListener = function () {
  global.document.removeEventListener(documentVisibilityChangeEventName(), this._visibilityChangeListener);
};

Venmo.prototype._processResults = function () {
  var self = this;
  var params = getFragmentParameters();

  return new Promise(function (resolve, reject) {
    if (params.venmoSuccess) {
      analytics.sendEvent(self._client, 'venmo.appswitch.handle.success');
      resolve(formatTokenizePayload(params));
    } else if (params.venmoError) {
      analytics.sendEvent(self._client, 'venmo.appswitch.handle.error');
      reject(new BraintreeError({
        type: errors.VENMO_APP_FAILED.type,
        code: errors.VENMO_APP_FAILED.code,
        message: errors.VENMO_APP_FAILED.message,
        details: {
          originalError: {
            message: decodeURIComponent(params.errorMessage),
            code: params.errorCode
          }
        }
      }));
    } else if (params.venmoCancel) {
      analytics.sendEvent(self._client, 'venmo.appswitch.handle.cancel');
      reject(new BraintreeError(errors.VENMO_APP_CANCELED));
    } else {
      // User has either manually switched back to browser, or app is not available for app switch
      analytics.sendEvent(self._client, 'venmo.appswitch.cancel-or-unavailable');
      reject(new BraintreeError(errors.VENMO_CANCELED));
    }

    clearFragmentParameters();
  });
};

function getFragmentParameters() {
  var keyValuesArray = global.location.hash.substring(1).split('&');

  return keyValuesArray.reduce(function (toReturn, keyValue) {
    var parts = keyValue.split('=');
    var key = decodeURIComponent(parts[0]);
    var value = decodeURIComponent(parts[1]);

    toReturn[key] = value;

    return toReturn;
  }, {});
}

function clearFragmentParameters() {
  if (typeof global.history.replaceState === 'function') {
    history.pushState({}, '', global.location.href.slice(0, global.location.href.indexOf('#')));
  }
}

function formatTokenizePayload(fragmentParams, venmoAccountData) {
  return {
    nonce: venmoAccountData ? venmoAccountData.nonce : fragmentParams.paymentMethodNonce,
    type: 'VenmoAccount',
    details: {
      username: fragmentParams.username
    }
  };
}

// From https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
function documentVisibilityChangeEventName() {
  var visibilityChange;

  if (typeof global.document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
    visibilityChange = 'visibilitychange';
  } else if (typeof global.document.msHidden !== 'undefined') {
    visibilityChange = 'msvisibilitychange';
  } else if (typeof global.document.webkitHidden !== 'undefined') {
    visibilityChange = 'webkitvisibilitychange';
  }

  return visibilityChange;
}

module.exports = wrapPromise.wrapPrototype(Venmo);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../lib/analytics":62,"../lib/braintree-error":66,"../lib/convert-methods-to-error":72,"../lib/methods":85,"../lib/promise":87,"../lib/querystring":88,"./shared/constants":106,"./shared/errors":107,"./shared/supports-venmo":108,"@braintree/wrap-promise":21}],110:[function(require,module,exports){
'use strict';

var testOrder;
var types = {};
var customCards = {};
var VISA = 'visa';
var MASTERCARD = 'mastercard';
var AMERICAN_EXPRESS = 'american-express';
var DINERS_CLUB = 'diners-club';
var DISCOVER = 'discover';
var ELO = 'elo';
var JCB = 'jcb';
var UNIONPAY = 'unionpay';
var MAESTRO = 'maestro';
var MIR = 'mir';
var CVV = 'CVV';
var CID = 'CID';
var CVC = 'CVC';
var CVN = 'CVN';
var CVP2 = 'CVP2';
var CVE = 'CVE';
var ORIGINAL_TEST_ORDER = [
  VISA,
  MASTERCARD,
  AMERICAN_EXPRESS,
  DINERS_CLUB,
  DISCOVER,
  JCB,
  UNIONPAY,
  MAESTRO,
  ELO,
  MIR
];

function clone(originalObject, persistPatterns) {
  var dupe, prefixPattern, exactPattern;

  if (!originalObject) { return null; }

  prefixPattern = originalObject.prefixPattern;
  exactPattern = originalObject.exactPattern;
  dupe = JSON.parse(JSON.stringify(originalObject));

  if (persistPatterns) {
    dupe.prefixPattern = prefixPattern;
    dupe.exactPattern = exactPattern;
  } else {
    delete dupe.prefixPattern;
    delete dupe.exactPattern;
  }

  return dupe;
}

testOrder = clone(ORIGINAL_TEST_ORDER);

types[VISA] = {
  niceType: 'Visa',
  type: VISA,
  prefixPattern: /^4/,
  exactPattern: new RegExp('^' +
    '4' +
    '(?!' +
      '31274|51416|57393|0117[89]|38935|5763[12]' + // Elo cards
    ')\\d{5,}' +
  '$'),
  gaps: [4, 8, 12],
  lengths: [16, 18, 19],
  code: {
    name: CVV,
    size: 3
  }
};

types[MASTERCARD] = {
  niceType: 'Mastercard',
  type: MASTERCARD,
  prefixPattern: /^(5|5[1-5]|2|22|222|222[1-9]|2[3-6]|27|27[0-2]|2720)$/,
  exactPattern: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)\d*$/,
  gaps: [4, 8, 12],
  lengths: [16],
  code: {
    name: CVC,
    size: 3
  }
};

types[AMERICAN_EXPRESS] = {
  niceType: 'American Express',
  type: AMERICAN_EXPRESS,
  prefixPattern: /^(3|34|37)$/,
  exactPattern: /^3[47]\d*$/,
  isAmex: true,
  gaps: [4, 10],
  lengths: [15],
  code: {
    name: CID,
    size: 4
  }
};

types[DINERS_CLUB] = {
  niceType: 'Diners Club',
  type: DINERS_CLUB,
  prefixPattern: /^(3|3[0689]|30[0-5])$/,
  exactPattern: /^3(0[0-5]|[689])\d*$/,
  gaps: [4, 10],
  lengths: [14, 16, 19],
  code: {
    name: CVV,
    size: 3
  }
};

types[DISCOVER] = {
  niceType: 'Discover',
  type: DISCOVER,
  prefixPattern: /^(6|60|601|6011|65|65\d{1,4}|64|64[4-9])$/,
  exactPattern: new RegExp('^(' +
    '6011' +
    '|' +
    '65' +
      '(?!' + // Elo cards
        '003[1-3]' +
        '|' +
        '003[5-9]|004\\d|005[0-1]' +
        '|' +
        '040[5-9]|04[1-3]\\d' +
        '|' +
        '048[5-9]|049\\d|05[0-2]\\d|053[0-8]' +
        '|' +
        '054[1-9]|05[5-8]\\d|059[0-8]' +
        '|' +
        '070\\d|071[0-8]' +
        '|' +
        '072[0-7]' +
        '|' +
        '090[1-9]|09[1-6]\\d|097[0-8]' +
        '|' +
        '165[2-9]|16[6-7]\\d' +
        '|' +
        '50[0-1]\\d' +
        '|' +
        '502[1-9]|50[3-4]\\d|505[0-8]' +
      ')\\d{4}' +
    '|' +
    '64[4-9]' +
  ')\\d*$'),
  gaps: [4, 8, 12],
  lengths: [16, 19],
  code: {
    name: CID,
    size: 3
  }
};

types[JCB] = {
  niceType: 'JCB',
  type: JCB,
  prefixPattern: /^(2|21|213|2131|1|18|180|1800|3|35)$/,
  exactPattern: /^(2131|1800|35)\d*$/,
  gaps: [4, 8, 12],
  lengths: [16, 17, 18, 19],
  code: {
    name: CVV,
    size: 3
  }
};

types[UNIONPAY] = {
  niceType: 'UnionPay',
  type: UNIONPAY,
  prefixPattern: /^((6|62|62\d|(621(?!83|88|98|99))|622(?!06)|627[0267]\d?|628(?!0|1)|629[1,2])|622018)$/,
  exactPattern: new RegExp('^(' +
    '(' +
      '620' +
      '|' +
      '(621(?!83|88|98|99))' +
      '|' +
      '622(?!06|018)' +
      '|' +
      '62[3-6]' +
      '|' +
      '627[026]' +
      '|' +
      '6277(?!80)\\d{2}' + // Elo card
      '|' +
      '628(?!0|1)' +
      '|' +
      '629[12]' +
    ')\\d*' +

    '|' +

    '622018\\d{12}' +
  ')$'),
  gaps: [4, 8, 12],
  lengths: [16, 17, 18, 19],
  code: {
    name: CVN,
    size: 3
  }
};

types[MAESTRO] = {
  niceType: 'Maestro',
  type: MAESTRO,
  prefixPattern: /^(5|5[06-9]|6\d*)$/,
  exactPattern: new RegExp('^(' +
    '5[6-9]' +
    '|' +
    '50' +
      '(?!' + // Elo card ranges
        '6699|067[0-6][0-9]' +
        '|' +
        '677[0-8]' +
        '|' +
        '9[0-9][0-9][0-9]' +
      ')\\d{4}' +
    '|' +
    '67' +
    '|' +
    '63' +
      '(?!' + // More Elo card ranges
        '6297|6368' +
      ')\\d{4}' +
    ')\\d*$'
  ),
  gaps: [4, 8, 12],
  lengths: [12, 13, 14, 15, 16, 17, 18, 19],
  code: {
    name: CVC,
    size: 3
  }
};

types[ELO] = {
  niceType: 'Elo',
  type: ELO,
  prefixPattern: new RegExp('^(' +
    '[4-6]' +

    '|' +

    '4[035]|4[035]1' +
    '|' +
    '4011|40117|40117[89]' +
    '|' +
    '4312|43127|431274' +
    '|' +
    '438|4389|43893|438935' +
    '|' +
    '4514|45141|451416' +
    '|' +
    '457|457[36]|45739|45763|457393|45763[12]' +

    '|' +

    '50|50[69]' +
    '|' +
    '506[6-7]|50669|5067[0-7]|5067[0-6][0-9]|50677[0-8]' +
    '|' +
    '509[0-9]|509[0-9][0-9]|509[0-9][0-9][0-9]' +

    '|' +

    '6[235]|627|636|65[015]' +
    '|' +
    '6277|62778|627780' +
    '|' +
    '636[23]|63629|636297|63636|636368' +
    '|' +
    '650[0479]' +
    '|' +
    '6500[3-5]|65003[1-3]|65003[5-9]|65004[0-9]65005[01]' +
    '|' +
    '6504[0-3]|65040[5-9]|65041[0-9]' +
    '|' +
    '6505[4-9]|65054[1-9]|6505[5-8][0-9]|65059[0-8]' +
    '|' +
    '6507[0-2]|65070[0-9]|65071[0-8]|65072[0-7]' +
    '|' +
    '6509[0-7]|65090[1-9]|6509[1-6][0-9]|65097[0-8]' +
    '|' +
    '6516|6516[5-7]|65165[2-9]|6516[6-7][0-9]' +
    '|' +
    '6550|6550[0-5]|6550[01][0-9]|65502[1-9]|6550[3-4][0-9]|65505[0-8]' +
  ')$'),
  exactPattern: new RegExp('^(' +
    // Elo only ranges
    '4(31274|51416|57393)' +

    '|' +

    '50(' +
      '4175' +
      '|' +
      '6699|67[0-6][0-9]|677[0-8]' + // 506699-506778
      '|' +
      '9[0-9][0-9][0-9]' + // 509000-509999
    ')' +

    '|' +

    '627780' +

    '|' +

    '636(297|368)' +

    '|' +

    // Dual Branded with Visa
    '4(0117[89]|38935|5763[12])' +

    '|' +

    // Dual Branded with Discover
    '65(' +
      '003[1-3]' + // 650031-650033
      '|' +
      '003[5-9]|004\\d|005[0-1]' + // 650035-650051
      '|' +
      '040[5-9]|04[1-3]\\d' + // 650405-650439
      '|' +
      '048[5-9]|049\\d|05[0-2]\\d|053[0-8]' + // 650485-650538
      '|' +
      '054[1-9]|05[5-8]\\d|059[0-8]' + // 650541-650598
      '|' +
      '070[0-9]|071[0-8]' + // 650700-650718
      '|' +
      '072[0-7]' + // 650720-650727
      '|' +
      '090[1-9]|09[1-6][0-9]|097[0-8]' + // 650901-650978
      '|' +
      '165[2-9]|16[6-7][0-9]' + // 651652-651679
      '|' +
      '50[0-1][0-9]' + // 655000-655019
      '|' +
      '502[1-9]|50[3-4][0-9]|505[0-8]' + // 655021-655058
    ')' +
  ')\\d*$'),
  gaps: [4, 8, 12],
  lengths: [16],
  code: {
    name: CVE,
    size: 3
  }
};

types[MIR] = {
  niceType: 'Mir',
  type: MIR,
  prefixPattern: /^(2|22|220|220[0-4])$/,
  exactPattern: /^(220[0-4])\d*$/,
  gaps: [4, 8, 12],
  lengths: [16, 17, 18, 19],
  code: {
    name: CVP2,
    size: 3
  }
};

function findType(type) {
  return customCards[type] || types[type];
}

function creditCardType(cardNumber) {
  var type, value, i;
  var prefixResults = [];
  var exactResults = [];

  if (!(typeof cardNumber === 'string' || cardNumber instanceof String)) {
    return [];
  }

  for (i = 0; i < testOrder.length; i++) {
    type = testOrder[i];
    value = findType(type);

    if (cardNumber.length === 0) {
      prefixResults.push(clone(value));
      continue;
    }

    if (value.exactPattern.test(cardNumber)) {
      exactResults.push(clone(value));
    } else if (value.prefixPattern.test(cardNumber)) {
      prefixResults.push(clone(value));
    }
  }

  return exactResults.length ? exactResults : prefixResults;
}

creditCardType.getTypeInfo = function (type) {
  return clone(findType(type));
};

function getCardPosition(name, ignoreErrorForNotExisting) {
  var position = testOrder.indexOf(name);

  if (!ignoreErrorForNotExisting && position === -1) {
    throw new Error('"' + name + '" is not a supported card type.');
  }

  return position;
}

creditCardType.removeCard = function (name) {
  var position = getCardPosition(name);

  testOrder.splice(position, 1);
};

creditCardType.addCard = function (config) {
  var existingCardPosition = getCardPosition(config.type, true);

  customCards[config.type] = config;

  if (existingCardPosition === -1) {
    testOrder.push(config.type);
  }
};

creditCardType.updateCard = function (cardType, updates) {
  var clonedCard;
  var originalObject = customCards[cardType] || types[cardType];

  if (!originalObject) {
    throw new Error('"' + cardType + '" is not a recognized type. Use `addCard` instead.');
  }

  if (updates.type && originalObject.type !== updates.type) {
    throw new Error('Cannot overwrite type parameter.');
  }

  clonedCard = clone(originalObject, true);

  Object.keys(clonedCard).forEach(function (key) {
    if (updates[key]) {
      clonedCard[key] = updates[key];
    }
  });

  customCards[clonedCard.type] = clonedCard;
};

creditCardType.changeOrder = function (name, position) {
  var currentPosition = getCardPosition(name);

  testOrder.splice(currentPosition, 1);
  testOrder.splice(position, 0, name);
};

creditCardType.resetModifications = function () {
  testOrder = clone(ORIGINAL_TEST_ORDER);
  customCards = {};
};

creditCardType.types = {
  VISA: VISA,
  MASTERCARD: MASTERCARD,
  AMERICAN_EXPRESS: AMERICAN_EXPRESS,
  DINERS_CLUB: DINERS_CLUB,
  DISCOVER: DISCOVER,
  JCB: JCB,
  UNIONPAY: UNIONPAY,
  MAESTRO: MAESTRO,
  ELO: ELO,
  MIR: MIR
};

module.exports = creditCardType;

},{}],111:[function(require,module,exports){
(function (global){
'use strict';

var win, framebus;
var popups = [];
var subscribers = {};
var prefix = '/*framebus*/';

function include(popup) {
  if (popup == null) { return false; }
  if (popup.Window == null) { return false; }
  if (popup.constructor !== popup.Window) { return false; }

  popups.push(popup);
  return true;
}

function target(origin) {
  var key;
  var targetedFramebus = {};

  for (key in framebus) {
    if (!framebus.hasOwnProperty(key)) { continue; }

    targetedFramebus[key] = framebus[key];
  }

  targetedFramebus._origin = origin || '*';

  return targetedFramebus;
}

function publish(event) {
  var payload, args;
  var origin = _getOrigin(this); // eslint-disable-line no-invalid-this

  if (_isntString(event)) { return false; }
  if (_isntString(origin)) { return false; }

  args = Array.prototype.slice.call(arguments, 1);

  payload = _packagePayload(event, args, origin);
  if (payload === false) { return false; }

  _broadcast(win.top || win.self, payload, origin);

  return true;
}

function subscribe(event, fn) {
  var origin = _getOrigin(this); // eslint-disable-line no-invalid-this

  if (_subscriptionArgsInvalid(event, fn, origin)) { return false; }

  subscribers[origin] = subscribers[origin] || {};
  subscribers[origin][event] = subscribers[origin][event] || [];
  subscribers[origin][event].push(fn);

  return true;
}

function unsubscribe(event, fn) {
  var i, subscriberList;
  var origin = _getOrigin(this); // eslint-disable-line no-invalid-this

  if (_subscriptionArgsInvalid(event, fn, origin)) { return false; }

  subscriberList = subscribers[origin] && subscribers[origin][event];
  if (!subscriberList) { return false; }

  for (i = 0; i < subscriberList.length; i++) {
    if (subscriberList[i] === fn) {
      subscriberList.splice(i, 1);
      return true;
    }
  }

  return false;
}

function _getOrigin(scope) {
  return scope && scope._origin || '*';
}

function _isntString(string) {
  return typeof string !== 'string';
}

function _packagePayload(event, args, origin) {
  var packaged = false;
  var payload = {
    event: event,
    origin: origin
  };
  var reply = args[args.length - 1];

  if (typeof reply === 'function') {
    payload.reply = _subscribeReplier(reply, origin);
    args = args.slice(0, -1);
  }

  payload.args = args;

  try {
    packaged = prefix + JSON.stringify(payload);
  } catch (e) {
    throw new Error('Could not stringify event: ' + e.message);
  }
  return packaged;
}

function _unpackPayload(e) {
  var payload, replyOrigin, replySource, replyEvent;

  if (e.data.slice(0, prefix.length) !== prefix) { return false; }

  try {
    payload = JSON.parse(e.data.slice(prefix.length));
  } catch (err) {
    return false;
  }

  if (payload.reply != null) {
    replyOrigin = e.origin;
    replySource = e.source;
    replyEvent = payload.reply;

    payload.reply = function reply(data) { // eslint-disable-line consistent-return
      var replyPayload = _packagePayload(replyEvent, [data], replyOrigin);

      if (replyPayload === false) { return false; }

      replySource.postMessage(replyPayload, replyOrigin);
    };

    payload.args.push(payload.reply);
  }

  return payload;
}

function _attach(w) {
  if (win) { return; }
  win = w || global;

  if (win.addEventListener) {
    win.addEventListener('message', _onmessage, false);
  } else if (win.attachEvent) {
    win.attachEvent('onmessage', _onmessage);
  } else if (win.onmessage === null) {
    win.onmessage = _onmessage;
  } else {
    win = null;
  }
}

// removeIf(production)
function _detach() {
  if (win == null) { return; }

  if (win.removeEventListener) {
    win.removeEventListener('message', _onmessage, false);
  } else if (win.detachEvent) {
    win.detachEvent('onmessage', _onmessage);
  } else if (win.onmessage === _onmessage) {
    win.onmessage = null;
  }

  win = null;
  popups = [];
  subscribers = {};
}
// endRemoveIf(production)

function _uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;

    return v.toString(16);
  });
}

function _onmessage(e) {
  var payload;

  if (_isntString(e.data)) { return; }

  payload = _unpackPayload(e);
  if (!payload) { return; }

  _dispatch('*', payload.event, payload.args, e);
  _dispatch(e.origin, payload.event, payload.args, e);
  _broadcastPopups(e.data, payload.origin, e.source);
}

function _dispatch(origin, event, args, e) {
  var i;

  if (!subscribers[origin]) { return; }
  if (!subscribers[origin][event]) { return; }

  for (i = 0; i < subscribers[origin][event].length; i++) {
    subscribers[origin][event][i].apply(e, args);
  }
}

function _hasOpener(frame) {
  if (frame.top !== frame) { return false; }
  if (frame.opener == null) { return false; }
  if (frame.opener === frame) { return false; }
  if (frame.opener.closed === true) { return false; }

  return true;
}

function _broadcast(frame, payload, origin) {
  var i = 0;
  var frameToBroadcastTo;

  try {
    frame.postMessage(payload, origin);

    if (_hasOpener(frame)) {
      _broadcast(frame.opener.top, payload, origin);
    }

    // previously, our max value was frame.frames.length
    // but frames.length inherits from window.length
    // which can be overwritten if a developer does
    // `var length = value;` outside of a function
    // scope, it'll prevent us from looping through
    // all the frames. With this, we loop through
    // until there are no longer any frames
    while (frameToBroadcastTo = frame.frames[i]) { // eslint-disable-line no-cond-assign
      _broadcast(frameToBroadcastTo, payload, origin);
      i++;
    }
  } catch (_) { /* ignored */ }
}

function _broadcastPopups(payload, origin, source) {
  var i, popup;

  for (i = popups.length - 1; i >= 0; i--) {
    popup = popups[i];

    if (popup.closed === true) {
      popups = popups.slice(i, 1);
    } else if (source !== popup) {
      _broadcast(popup.top, payload, origin);
    }
  }
}

function _subscribeReplier(fn, origin) {
  var uuid = _uuid();

  function replier(d, o) {
    fn(d, o);
    framebus.target(origin).unsubscribe(uuid, replier);
  }

  framebus.target(origin).subscribe(uuid, replier);
  return uuid;
}

function _subscriptionArgsInvalid(event, fn, origin) {
  if (_isntString(event)) { return true; }
  if (typeof fn !== 'function') { return true; }
  if (_isntString(origin)) { return true; }

  return false;
}

_attach();

framebus = {
  target: target,
  // removeIf(production)
  _packagePayload: _packagePayload,
  _unpackPayload: _unpackPayload,
  _attach: _attach,
  _detach: _detach,
  _dispatch: _dispatch,
  _broadcast: _broadcast,
  _subscribeReplier: _subscribeReplier,
  _subscriptionArgsInvalid: _subscriptionArgsInvalid,
  _onmessage: _onmessage,
  _uuid: _uuid,
  _getSubscribers: function () { return subscribers; },
  _win: function () { return win; },
  // endRemoveIf(production)
  include: include,
  publish: publish,
  pub: publish,
  trigger: publish,
  emit: publish,
  subscribe: subscribe,
  sub: subscribe,
  on: subscribe,
  unsubscribe: unsubscribe,
  unsub: unsubscribe,
  off: unsubscribe
};

module.exports = framebus;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],112:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],113:[function(require,module,exports){
(function (setImmediate){
'use strict';

var promiseFinally = function(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      return constructor.resolve(callback()).then(function() {
        return constructor.reject(reason);
      });
    }
  );
};

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  this._state = 0;
  this._handled = false;
  this._value = undefined;
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = promiseFinally;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!arr || typeof arr.length === 'undefined')
      throw new TypeError('Promise.all accepts an array');
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(values) {
  return new Promise(function(resolve, reject) {
    for (var i = 0, len = values.length; i < len; i++) {
      values[i].then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  (typeof setImmediate === 'function' &&
    function(fn) {
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

module.exports = Promise;

}).call(this,require("timers").setImmediate)
},{"timers":116}],114:[function(require,module,exports){
(function (global){
'use strict';

var UA = global.navigator && global.navigator.userAgent;

var isAndroid = require('@braintree/browser-detection/is-android');
var isChrome = require('@braintree/browser-detection/is-chrome');
var isIos = require('@braintree/browser-detection/is-ios');
var isIE9 = require('@braintree/browser-detection/is-ie9');

// Old Android Webviews used specific versions of Chrome with 0.0.0 as their version suffix
// https://developer.chrome.com/multidevice/user-agent#webview_user_agent
var KITKAT_WEBVIEW_REGEX = /Version\/\d\.\d* Chrome\/\d*\.0\.0\.0/;

function _isOldSamsungBrowserOrSamsungWebview(ua) {
  return !isChrome(ua) && ua.indexOf('Samsung') > -1;
}

function isKitKatWebview(uaArg) {
  var ua = uaArg || UA;

  return isAndroid(ua) && KITKAT_WEBVIEW_REGEX.test(ua);
}

function isAndroidChrome(uaArg) {
  var ua = uaArg || UA;

  return isAndroid(ua) && isChrome(ua);
}

function isSamsungBrowser(ua) {
  ua = ua || UA;
  return /SamsungBrowser/.test(ua) || _isOldSamsungBrowserOrSamsungWebview(ua);
}

module.exports = {
  isIE9: isIE9,
  isAndroidChrome: isAndroidChrome,
  isIos: isIos,
  isKitKatWebview: isKitKatWebview,
  isSamsungBrowser: isSamsungBrowser
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@braintree/browser-detection/is-android":1,"@braintree/browser-detection/is-chrome":2,"@braintree/browser-detection/is-ie9":7,"@braintree/browser-detection/is-ios":11}],115:[function(require,module,exports){
'use strict';

var device = require('./lib/device');

module.exports = function () {
  // Digits get dropped in samsung browser
  return !device.isSamsungBrowser();
};

},{"./lib/device":114}],116:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":112,"timers":116}],117:[function(require,module,exports){
'use strict';

module.exports = {
  paymentOptionIDs: {
    card: 'card',
    paypal: 'paypal',
    paypalCredit: 'paypalCredit',
    applePay: 'applePay',
    venmo: 'venmo',
    googlePay: 'googlePay'
  },
  paymentMethodTypes: {
    card: 'CreditCard',
    paypal: 'PayPalAccount',
    paypalCredit: 'PayPalAccount',
    applePay: 'ApplePayCard',
    venmo: 'VenmoAccount',
    googlePay: 'AndroidPayCard'
  },
  analyticsKinds: {
    CreditCard: 'card',
    PayPalAccount: 'paypal',
    ApplePayCard: 'applepay',
    VenmoAccount: 'venmo',
    AndroidPayCard: 'googlepay'
  },
  paymentMethodCardTypes: {
    Visa: 'visa',
    MasterCard: 'master-card',
    'American Express': 'american-express',
    'Diners Club': 'diners-club',
    Discover: 'discover',
    JCB: 'jcb',
    UnionPay: 'unionpay',
    Maestro: 'maestro'
  },
  configurationCardTypes: {
    visa: 'Visa',
    'master-card': 'MasterCard',
    'american-express': 'American Express',
    'diners-club': 'Discover',
    discover: 'Discover',
    jcb: 'JCB',
    unionpay: 'UnionPay',
    maestro: 'Maestro'
  },
  errors: {
    NO_PAYMENT_METHOD_ERROR: 'No payment method is available.',
    DEVELOPER_MISCONFIGURATION_MESSAGE: 'Developer Error: Something went wrong. Check the console for details.'
  },
  ANALYTICS_REQUEST_TIMEOUT_MS: 2000,
  ANALYTICS_PREFIX: 'web.dropin.',
  CHANGE_ACTIVE_PAYMENT_METHOD_TIMEOUT: 200,
  CHECKOUT_JS_SOURCE: 'https://www.paypalobjects.com/api/checkout.min.js',
  GOOGLE_PAYMENT_SOURCE: 'https://pay.google.com/gp/p/js/pay.js',
  INTEGRATION: 'dropin2',
  PAYPAL_CHECKOUT_SCRIPT_ID: 'braintree-dropin-paypal-checkout-script',
  GOOGLE_PAYMENT_SCRIPT_ID: 'braintree-dropin-google-payment-script',
  DATA_COLLECTOR_SCRIPT_ID: 'braintree-dropin-data-collector-script',
  STYLESHEET_ID: 'braintree-dropin-stylesheet'
};

},{}],118:[function(require,module,exports){
'use strict';

var analytics = require('./lib/analytics');
var DropinError = require('./lib/dropin-error');
var EventEmitter = require('./lib/event-emitter');
var constants = require('./constants');
var paymentMethodTypes = constants.paymentMethodTypes;
var paymentOptionIDs = constants.paymentOptionIDs;
var isGuestCheckout = require('./lib/is-guest-checkout');
var Promise = require('./lib/promise');
var paymentSheetViews = require('./views/payment-sheet-views');
var vaultManager = require('braintree-web/vault-manager');

var VAULTED_PAYMENT_METHOD_TYPES_THAT_SHOULD_BE_HIDDEN = [
  paymentMethodTypes.applePay,
  paymentMethodTypes.googlePay,
  paymentMethodTypes.venmo
];
var DEFAULT_PAYMENT_OPTION_PRIORITY = [
  paymentOptionIDs.card,
  paymentOptionIDs.paypal,
  paymentOptionIDs.paypalCredit,
  paymentOptionIDs.venmo,
  paymentOptionIDs.applePay,
  paymentOptionIDs.googlePay
];

function DropinModel(options) {
  this.componentID = options.componentID;
  this.merchantConfiguration = options.merchantConfiguration;

  this.isGuestCheckout = isGuestCheckout(options.client);

  this.dependenciesInitializing = 0;
  this.dependencySuccessCount = 0;
  this.failedDependencies = {};
  this._options = options;

  EventEmitter.call(this);
}

DropinModel.prototype = Object.create(EventEmitter.prototype, {
  constructor: DropinModel
});

DropinModel.prototype.initialize = function () {
  var self = this;

  return vaultManager.create({
    client: self._options.client
  }).then(function (vaultManagerInstance) {
    self._vaultManager = vaultManagerInstance;

    return getSupportedPaymentOptions(self._options);
  }).then(function (paymentOptions) {
    self.supportedPaymentOptions = paymentOptions;

    return self.getVaultedPaymentMethods();
  }).then(function (paymentMethods) {
    self._paymentMethods = paymentMethods;
    self._paymentMethodIsRequestable = self._paymentMethods.length > 0;
  });
};

DropinModel.prototype.isPaymentMethodRequestable = function () {
  return Boolean(this._paymentMethodIsRequestable);
};

DropinModel.prototype.addPaymentMethod = function (paymentMethod) {
  this._paymentMethods.push(paymentMethod);
  this._emit('addPaymentMethod', paymentMethod);
  this.changeActivePaymentMethod(paymentMethod);
};

DropinModel.prototype.removePaymentMethod = function (paymentMethod) {
  var paymentMethodLocation = this._paymentMethods.indexOf(paymentMethod);

  if (paymentMethodLocation === -1) {
    return;
  }

  this._paymentMethods.splice(paymentMethodLocation, 1);
  this._emit('removePaymentMethod', paymentMethod);
};

DropinModel.prototype.refreshPaymentMethods = function () {
  var self = this;

  return self.getVaultedPaymentMethods().then(function (paymentMethods) {
    self._paymentMethods = paymentMethods;

    self._emit('refreshPaymentMethods');
  });
};

DropinModel.prototype.changeActivePaymentMethod = function (paymentMethod) {
  this._activePaymentMethod = paymentMethod;
  this._emit('changeActivePaymentMethod', paymentMethod);
};

DropinModel.prototype.changeActivePaymentView = function (paymentViewID) {
  this._activePaymentView = paymentViewID;
  this._emit('changeActivePaymentView', paymentViewID);
};

DropinModel.prototype.removeActivePaymentMethod = function () {
  this._activePaymentMethod = null;
  this._emit('removeActivePaymentMethod');
  this.setPaymentMethodRequestable({
    isRequestable: false
  });
};

DropinModel.prototype.selectPaymentOption = function (paymentViewID) {
  this._emit('paymentOptionSelected', {
    paymentOption: paymentViewID
  });
};

DropinModel.prototype.enableEditMode = function () {
  analytics.sendEvent(this._options.client, 'manager.appeared');
  this._isInEditMode = true;
  this._emit('enableEditMode');
};

DropinModel.prototype.disableEditMode = function () {
  this._isInEditMode = false;
  this._emit('disableEditMode');
};

DropinModel.prototype.isInEditMode = function () {
  return Boolean(this._isInEditMode);
};

DropinModel.prototype.confirmPaymentMethodDeletion = function (paymentMethod) {
  this._paymentMethodWaitingToBeDeleted = paymentMethod;
  this._emit('confirmPaymentMethodDeletion', paymentMethod);
};

DropinModel.prototype._shouldEmitRequestableEvent = function (options) {
  var requestableStateHasNotChanged = this.isPaymentMethodRequestable() === options.isRequestable;
  var typeHasNotChanged = options.type === this._paymentMethodRequestableType;

  if (requestableStateHasNotChanged && (!options.isRequestable || typeHasNotChanged)) {
    return false;
  }

  return true;
};

DropinModel.prototype.setPaymentMethodRequestable = function (options) {
  var shouldEmitEvent = this._shouldEmitRequestableEvent(options);
  var paymentMethodRequestableResponse = {
    paymentMethodIsSelected: Boolean(options.selectedPaymentMethod),
    type: options.type
  };

  this._paymentMethodIsRequestable = options.isRequestable;

  if (options.isRequestable) {
    this._paymentMethodRequestableType = options.type;
  } else {
    delete this._paymentMethodRequestableType;
  }

  if (!shouldEmitEvent) {
    return;
  }

  if (options.isRequestable) {
    this._emit('paymentMethodRequestable', paymentMethodRequestableResponse);
  } else {
    this._emit('noPaymentMethodRequestable');
  }
};

DropinModel.prototype.getPaymentMethods = function () {
  // we want to return a copy of the Array
  // so we can loop through it in dropin.updateConfiguration
  // while calling model.removePaymentMethod
  // which updates the original array
  return this._paymentMethods.slice();
};

DropinModel.prototype.getActivePaymentMethod = function () {
  return this._activePaymentMethod;
};

DropinModel.prototype.getActivePaymentView = function () {
  return this._activePaymentView;
};

DropinModel.prototype.reportAppSwitchPayload = function (payload) {
  this.appSwitchPayload = payload;
};

DropinModel.prototype.reportAppSwitchError = function (sheetId, error) {
  this.appSwitchError = {
    id: sheetId,
    error: error
  };
};

DropinModel.prototype.asyncDependencyStarting = function () {
  this.dependenciesInitializing++;
};

DropinModel.prototype.asyncDependencyReady = function () {
  this.dependencySuccessCount++;
  this.dependenciesInitializing--;
  this._checkAsyncDependencyFinished();
};

DropinModel.prototype.asyncDependencyFailed = function (options) {
  if (this.failedDependencies.hasOwnProperty(options.view)) {
    return;
  }
  this.failedDependencies[options.view] = options.error;
  this.dependenciesInitializing--;
  this._checkAsyncDependencyFinished();
};

DropinModel.prototype._checkAsyncDependencyFinished = function () {
  if (this.dependenciesInitializing === 0) {
    this._emit('asyncDependenciesReady');
  }
};

DropinModel.prototype.cancelInitialization = function (error) {
  this._emit('cancelInitialization', error);
};

DropinModel.prototype.reportError = function (error) {
  this._emit('errorOccurred', error);
};

DropinModel.prototype.clearError = function () {
  this._emit('errorCleared');
};

DropinModel.prototype.preventUserAction = function () {
  this._emit('preventUserAction');
};

DropinModel.prototype.allowUserAction = function () {
  this._emit('allowUserAction');
};

DropinModel.prototype.deleteVaultedPaymentMethod = function () {
  var self = this;
  var promise = Promise.resolve();
  var error;

  this._emit('startVaultedPaymentMethodDeletion');

  if (!self.isGuestCheckout) {
    promise = this._vaultManager.deletePaymentMethod(this._paymentMethodWaitingToBeDeleted.nonce).catch(function (err) {
      error = err;
    });
  }

  return promise.then(function () {
    delete self._paymentMethodWaitingToBeDeleted;

    return self.refreshPaymentMethods();
  }).then(function () {
    self.disableEditMode();
    self._emit('finishVaultedPaymentMethodDeletion', error);
  });
};

DropinModel.prototype.cancelDeleteVaultedPaymentMethod = function () {
  this._emit('cancelVaultedPaymentMethodDeletion');

  delete this._paymentMethodWaitingToBeDeleted;
};

DropinModel.prototype.getVaultedPaymentMethods = function () {
  var self = this;

  if (self.isGuestCheckout) {
    return Promise.resolve([]);
  }

  return self._vaultManager.fetchPaymentMethods({
    defaultFirst: true
  }).then(function (paymentMethods) {
    return self._getSupportedPaymentMethods(paymentMethods).map(function (paymentMethod) {
      paymentMethod.vaulted = true;

      return paymentMethod;
    });
  }).catch(function () {
    return Promise.resolve([]);
  });
};

DropinModel.prototype._getSupportedPaymentMethods = function (paymentMethods) {
  var supportedPaymentMethods = this.supportedPaymentOptions.reduce(function (array, key) {
    var paymentMethodType = paymentMethodTypes[key];

    if (canShowVaultedPaymentMethodType(paymentMethodType)) {
      array.push(paymentMethodType);
    }

    return array;
  }, []);

  return paymentMethods.filter(function (paymentMethod) {
    return supportedPaymentMethods.indexOf(paymentMethod.type) > -1;
  });
};

function getSupportedPaymentOptions(options) {
  var paymentOptionPriority = options.merchantConfiguration.paymentOptionPriority || DEFAULT_PAYMENT_OPTION_PRIORITY;
  var promises;

  if (!(paymentOptionPriority instanceof Array)) {
    throw new DropinError('paymentOptionPriority must be an array.');
  }

  // Remove duplicates
  paymentOptionPriority = paymentOptionPriority.filter(function (item, pos) { return paymentOptionPriority.indexOf(item) === pos; });

  promises = paymentOptionPriority.map(function (paymentOption) {
    return getPaymentOption(paymentOption, options);
  });

  return Promise.all(promises).then(function (result) {
    result = result.filter(function (item) {
      return item.success;
    });

    if (result.length === 0) {
      return Promise.reject(new DropinError('No valid payment options available.'));
    }

    return result.map(function (item) { return item.id; });
  });
}

function getPaymentOption(paymentOption, options) {
  return isPaymentOptionEnabled(paymentOption, options).then(function (success) {
    return {
      success: success,
      id: paymentOptionIDs[paymentOption]
    };
  });
}

function isPaymentOptionEnabled(paymentOption, options) {
  var SheetView = paymentSheetViews[paymentOptionIDs[paymentOption]];

  if (!SheetView) {
    return Promise.reject(new DropinError('paymentOptionPriority: Invalid payment option specified.'));
  }

  return SheetView.isEnabled({
    client: options.client,
    merchantConfiguration: options.merchantConfiguration
  }).catch(function (error) {
    console.error(SheetView.ID + ' view errored when checking if it was supported.'); // eslint-disable-line no-console
    console.error(error); // eslint-disable-line no-console

    return Promise.resolve(false);
  });
}

function canShowVaultedPaymentMethodType(paymentMethodType) {
  return paymentMethodType && VAULTED_PAYMENT_METHOD_TYPES_THAT_SHOULD_BE_HIDDEN.indexOf(paymentMethodType) === -1;
}

module.exports = DropinModel;

},{"./constants":117,"./lib/analytics":122,"./lib/dropin-error":129,"./lib/event-emitter":130,"./lib/is-guest-checkout":132,"./lib/promise":137,"./views/payment-sheet-views":177,"braintree-web/vault-manager":102}],119:[function(require,module,exports){
'use strict';

var assign = require('./lib/assign').assign;
var analytics = require('./lib/analytics');
var classlist = require('./lib/classlist');
var constants = require('./constants');
var DropinError = require('./lib/dropin-error');
var DropinModel = require('./dropin-model');
var EventEmitter = require('./lib/event-emitter');
var assets = require('./lib/assets');

var MainView = require('./views/main-view');
var paymentMethodsViewID = require('./views/payment-methods-view').ID;
var paymentOptionsViewID = require('./views/payment-options-view').ID;
var paymentOptionIDs = constants.paymentOptionIDs;
var translations = require('./translations').translations;
var isUtf8 = require('./lib/is-utf-8');
var uuid = require('./lib/uuid');
var Promise = require('./lib/promise');
var sanitizeHtml = require('./lib/sanitize-html');
var DataCollector = require('./lib/data-collector');
var ThreeDSecure = require('./lib/three-d-secure');
var wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

var mainHTML = "<div class=\"braintree-dropin\">\n  <div data-braintree-id=\"methods-label\" class=\"braintree-heading\">&nbsp;</div>\n  <div data-braintree-id=\"methods-edit\" class=\"braintree-hidden braintree-heading\">{{edit}}</div>\n  <div data-braintree-id=\"choose-a-way-to-pay\" class=\"braintree-heading\">{{chooseAWayToPay}}</div>\n  <div class=\"braintree-placeholder\">&nbsp;</div>\n\n  <div data-braintree-id=\"upper-container\" class=\"braintree-upper-container\">\n    <div data-braintree-id=\"loading-container\" class=\"braintree-loader__container\">\n      <div data-braintree-id=\"loading-indicator\" class=\"braintree-loader__indicator\">\n        <svg width=\"14\" height=\"16\" class=\"braintree-loader__lock\">\n          <use xlink:href=\"#iconLockLoader\"></use>\n        </svg>\n      </div>\n    </div>\n\n    <div data-braintree-id=\"delete-confirmation\" class=\"braintree-delete-confirmation braintree-sheet\">\n      <div data-braintree-id=\"delete-confirmation__message\"></div>\n      <div class=\"braintree-delete-confirmation__button-container\">\n        <div role=\"button\" data-braintree-id=\"delete-confirmation__no\" class=\"braintree-delete-confirmation__button\">{{deleteCancelButton}}</div>\n        <div role=\"button\" data-braintree-id=\"delete-confirmation__yes\" class=\"braintree-delete-confirmation__button\">{{deleteConfirmationButton}}</div>\n      </div>\n    </div>\n\n    <div data-braintree-id=\"methods\" class=\"braintree-methods braintree-methods-initial\">\n      <div data-braintree-id=\"methods-container\"></div>\n    </div>\n\n    <div data-braintree-id=\"options\" class=\"braintree-test-class braintree-options braintree-options-initial\">\n      <div data-braintree-id=\"payment-options-container\" class=\"braintree-options-list\"></div>\n    </div>\n\n    <div data-braintree-id=\"sheet-container\" class=\"braintree-sheet__container\">\n      <div data-braintree-id=\"paypal\" class=\"braintree-paypal braintree-sheet\">\n        <div data-braintree-id=\"paypal-sheet-header\" class=\"braintree-sheet__header\">\n          <div class=\"braintree-sheet__header-label\">\n            <div class=\"braintree-sheet__logo--header\">\n              <svg width=\"40\" height=\"24\">\n                <use xlink:href=\"#logoPayPal\"></use>\n              </svg>\n            </div>\n            <div class=\"braintree-sheet__label\">{{PayPal}}</div>\n          </div>\n        </div>\n        <div class=\"braintree-sheet__content braintree-sheet__content--button\">\n          <div data-braintree-id=\"paypal-button\" class=\"braintree-sheet__button--paypal\"></div>\n        </div>\n      </div>\n      <div data-braintree-id=\"paypalCredit\" class=\"braintree-paypalCredit braintree-sheet\">\n        <div data-braintree-id=\"paypal-credit-sheet-header\" class=\"braintree-sheet__header\">\n          <div class=\"braintree-sheet__header-label\">\n            <div class=\"braintree-sheet__logo--header\">\n              <svg width=\"40\" height=\"24\">\n                <use xlink:href=\"#logoPayPalCredit\"></use>\n              </svg>\n            </div>\n            <div class=\"braintree-sheet__label\">{{PayPal Credit}}</div>\n          </div>\n        </div>\n        <div class=\"braintree-sheet__content braintree-sheet__content--button\">\n          <div data-braintree-id=\"paypal-credit-button\" class=\"braintree-sheet__button--paypal\"></div>\n        </div>\n      </div>\n      <div data-braintree-id=\"applePay\" class=\"braintree-applePay braintree-sheet\">\n        <div data-braintree-id=\"apple-pay-sheet-header\" class=\"braintree-sheet__header\">\n          <div class=\"braintree-sheet__header-label\">\n            <div class=\"braintree-sheet__logo--header\">\n              <svg height=\"24\" width=\"40\">\n              <use xlink:href=\"#logoApplePay\"></use>\n              </svg>\n            </div>\n            <div class=\"braintree-sheet__label\">{{Apple Pay}}</div>\n          </div>\n        </div>\n        <div class=\"braintree-sheet__content braintree-sheet__content--button\">\n          <div data-braintree-id=\"apple-pay-button\" class=\"braintree-sheet__button--apple-pay apple-pay-button\"></div>\n        </div>\n      </div>\n      <div data-braintree-id=\"googlePay\" class=\"braintree-googlePay braintree-sheet\">\n        <div data-braintree-id=\"google-pay-sheet-header\" class=\"braintree-sheet__header\">\n          <div class=\"braintree-sheet__header-label\">\n            <div class=\"braintree-sheet__logo--header\">\n              <svg height=\"24\" width=\"40\">\n              <use xlink:href=\"#logoGooglePay\"></use>\n              </svg>\n            </div>\n            <div class=\"braintree-sheet__label\">{{Google Pay}}</div>\n          </div>\n        </div>\n        <div class=\"braintree-sheet__content braintree-sheet__content--button\">\n          <button type=\"button\" data-braintree-id=\"google-pay-button\" class=\"braintree-sheet__button--google-pay google-pay-button\"></button>\n        </div>\n      </div>\n      <div data-braintree-id=\"venmo\" class=\"braintree-venmo braintree-sheet\">\n        <div data-braintree-id=\"venmo-sheet-header\" class=\"braintree-sheet__header\">\n          <div class=\"braintree-sheet__header-label\">\n            <div class=\"braintree-sheet__logo--header\">\n              <svg height=\"24\" width=\"40\">\n              <use xlink:href=\"#logoVenmo\"></use>\n              </svg>\n            </div>\n            <div class=\"braintree-sheet__label\">{{Venmo}}</div>\n          </div>\n        </div>\n        <div class=\"braintree-sheet__content braintree-sheet__content--button\">\n          <svg data-braintree-id=\"venmo-button\" class=\"braintree-sheet__button--venmo\">\n            <use xlink:href=\"#buttonVenmo\"></use>\n          </svg>\n        </div>\n      </div>\n      <div data-braintree-id=\"card\" class=\"braintree-card braintree-form braintree-sheet\">\n        <div data-braintree-id=\"card-sheet-header\" class=\"braintree-sheet__header\">\n          <div class=\"braintree-sheet__header-label\">\n            <div class=\"braintree-sheet__logo--header\">\n              <svg width=\"40\" height=\"24\" class=\"braintree-icon--bordered\">\n                <use xlink:href=\"#iconCardFront\"></use>\n              </svg>\n            </div>\n            <div class=\"braintree-sheet__text\">{{payWithCard}}</div>\n          </div>\n          <div data-braintree-id=\"card-view-icons\" class=\"braintree-sheet__icons\"></div>\n        </div>\n        <div class=\"braintree-sheet__content braintree-sheet__content--form\">\n          <div data-braintree-id=\"cardholder-name-field-group\" class=\"braintree-form__field-group\">\n            <label for=\"braintree__card-view-input__cardholder-name\">\n              <div class=\"braintree-form__label\">{{cardholderNameLabel}}</div>\n              <div class=\"braintree-form__field\">\n                <div class=\"braintree-form-cardholder-name braintree-form__hosted-field\">\n                  <input class=\"braintree-form__raw-input\" id=\"braintree__card-view-input__cardholder-name\" type=\"text\" placeholder=\"{{cardholderNamePlaceholder}}\"/>\n                </div>\n                <div class=\"braintree-form__icon-container\">\n                  <div class=\"braintree-form__icon braintree-form__field-error-icon\">\n                    <svg width=\"24\" height=\"24\">\n                      <use xlink:href=\"#iconError\"></use>\n                    </svg>\n                  </div>\n                </div>\n              </div>\n            </label>\n            <div data-braintree-id=\"cardholder-name-field-error\" class=\"braintree-form__field-error\"></div>\n          </div>\n          <div data-braintree-id=\"number-field-group\" class=\"braintree-form__field-group\">\n            <label>\n              <div class=\"braintree-form__label\">{{cardNumberLabel}}</div>\n              <div class=\"braintree-form__field\">\n                <div class=\"braintree-form-number braintree-form__hosted-field\"></div>\n                <div class=\"braintree-form__icon-container\">\n                  <div data-braintree-id=\"card-number-icon\" class=\"braintree-form__icon braintree-form__field-secondary-icon\">\n                    <svg width=\"40\" height=\"24\" class=\"braintree-icon--bordered\">\n                    <use data-braintree-id=\"card-number-icon-svg\" xlink:href=\"#iconCardFront\"></use>\n                    </svg>\n                  </div>\n                  <div class=\"braintree-form__icon braintree-form__field-error-icon\">\n                    <svg width=\"24\" height=\"24\">\n                      <use xlink:href=\"#iconError\"></use>\n                    </svg>\n                  </div>\n                </div>\n              </div>\n            </label>\n            <div data-braintree-id=\"number-field-error\" class=\"braintree-form__field-error\"></div>\n          </div>\n\n          <div class=\"braintree-form__flexible-fields\">\n            <div data-braintree-id=\"expiration-date-field-group\" class=\"braintree-form__field-group\">\n              <label>\n                <div class=\"braintree-form__label\">{{expirationDateLabel}}\n                  <span class=\"braintree-form__descriptor\">{{expirationDateLabelSubheading}}</span>\n                </div>\n                <div class=\"braintree-form__field\">\n                  <div class=\"braintree-form__hosted-field braintree-form-expiration\"></div>\n                  <div class=\"braintree-form__icon-container\">\n                    <div class=\"braintree-form__icon braintree-form__field-error-icon\">\n                      <svg width=\"24\" height=\"24\">\n                        <use xlink:href=\"#iconError\"></use>\n                      </svg>\n                    </div>\n                  </div>\n                </div>\n              </label>\n              <div data-braintree-id=\"expiration-date-field-error\" class=\"braintree-form__field-error\"></div>\n            </div>\n            \n\n            <div data-braintree-id=\"cvv-field-group\" class=\"braintree-form__field-group\">\n              <label>\n                <div class=\"braintree-form__label\">{{cvvLabel}}\n                  <span data-braintree-id=\"cvv-label-descriptor\" class=\"braintree-form__descriptor\">{{cvvThreeDigitLabelSubheading}}</span>\n                </div>\n                <div class=\"braintree-form__field\">\n                  <div class=\"braintree-form__hosted-field braintree-form-cvv\"></div>\n                  <div class=\"braintree-form__icon-container\">\n                    <div data-braintree-id=\"cvv-icon\" class=\"braintree-form__icon braintree-form__field-secondary-icon\">\n                      <svg width=\"40\" height=\"24\" class=\"braintree-icon--bordered\">\n                      <use data-braintree-id=\"cvv-icon-svg\" xlink:href=\"#iconCVVBack\"></use>\n                      </svg>\n                    </div>\n                    <div class=\"braintree-form__icon braintree-form__field-error-icon\">\n                      <svg width=\"24\" height=\"24\">\n                        <use xlink:href=\"#iconError\"></use>\n                      </svg>\n                    </div>\n                  </div>\n                </div>\n              </label>\n              <div data-braintree-id=\"cvv-field-error\" class=\"braintree-form__field-error\"></div>\n            </div>\n\n            <div data-braintree-id=\"postal-code-field-group\" class=\"braintree-form__field-group\">\n              <label>\n                <div class=\"braintree-form__label\">{{postalCodeLabel}}</div>\n                <div class=\"braintree-form__field\">\n                  <div class=\"braintree-form__hosted-field braintree-form-postal-code\"></div>\n                  <div class=\"braintree-form__icon-container\">\n                    <div class=\"braintree-form__icon braintree-form__field-error-icon\">\n                      <svg width=\"24\" height=\"24\">\n                        <use xlink:href=\"#iconError\"></use>\n                      </svg>\n                    </div>\n                  </div>\n                </div>\n              </label>\n              <div data-braintree-id=\"postal-code-field-error\" class=\"braintree-form__field-error\"></div>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div data-braintree-id=\"sheet-error\" class=\"braintree-sheet__error\">\n        <div class=\"braintree-form__icon braintree-sheet__error-icon\">\n          <svg width=\"24\" height=\"24\">\n            <use xlink:href=\"#iconError\"></use>\n          </svg>\n        </div>\n        <div data-braintree-id=\"sheet-error-text\" class=\"braintree-sheet__error-text\"></div>\n      </div>\n    </div>\n  </div>\n\n  <div data-braintree-id=\"lower-container\" class=\"braintree-test-class braintree-options braintree-hidden\">\n    <div data-braintree-id=\"other-ways-to-pay\" class=\"braintree-heading\">{{otherWaysToPay}}</div>\n  </div>\n\n  <div data-braintree-id=\"toggle\" class=\"braintree-large-button braintree-toggle braintree-hidden\" tabindex=\"0\">\n    <span>{{chooseAnotherWayToPay}}</span>\n  </div>\n</div>\n<div data-braintree-id=\"disable-wrapper\" class=\"braintree-dropin__disabled braintree-hidden\"></div>\n";
var svgHTML = "<svg data-braintree-id=\"svgs\" style=\"display: none\">\n  <defs>\n    <symbol id=\"icon-visa\" viewBox=\"0 0 40 24\">\n      <title>Visa</title>\n      <path d=\"M0 1.927C0 .863.892 0 1.992 0h36.016C39.108 0 40 .863 40 1.927v20.146C40 23.137 39.108 24 38.008 24H1.992C.892 24 0 23.137 0 22.073V1.927z\" style=\"fill: #FFF\" />\n      <path d=\"M0 22.033C0 23.12.892 24 1.992 24h36.016c1.1 0 1.992-.88 1.992-1.967V20.08H0v1.953z\" style=\"fill: #F8B600\" />\n      <path d=\"M0 3.92h40V1.967C40 .88 39.108 0 38.008 0H1.992C.892 0 0 .88 0 1.967V3.92zM19.596 7.885l-2.11 9.478H14.93l2.11-9.478h2.554zm10.743 6.12l1.343-3.56.773 3.56H30.34zm2.85 3.358h2.36l-2.063-9.478H31.31c-.492 0-.905.274-1.088.695l-3.832 8.783h2.682l.532-1.415h3.276l.31 1.415zm-6.667-3.094c.01-2.502-3.6-2.64-3.577-3.76.008-.338.345-.7 1.083-.793.365-.045 1.373-.08 2.517.425l.448-2.01c-.615-.214-1.405-.42-2.39-.42-2.523 0-4.3 1.288-4.313 3.133-.016 1.364 1.268 2.125 2.234 2.58.996.464 1.33.762 1.325 1.177-.006.636-.793.918-1.526.928-1.285.02-2.03-.333-2.623-.6l-.462 2.08c.598.262 1.7.49 2.84.502 2.682 0 4.437-1.273 4.445-3.243zM15.948 7.884l-4.138 9.478h-2.7L7.076 9.8c-.123-.466-.23-.637-.606-.834-.615-.32-1.63-.62-2.52-.806l.06-.275h4.345c.554 0 1.052.354 1.178.966l1.076 5.486 2.655-6.45h2.683z\" style=\"fill: #1A1F71\" />\n    </symbol>\n\n    <symbol id=\"icon-master-card\" viewBox=\"0 0 40 24\">\n      <title>MasterCard</title>\n      <path d=\"M0 1.927C0 .863.892 0 1.992 0h36.016C39.108 0 40 .863 40 1.927v20.146C40 23.137 39.108 24 38.008 24H1.992C.892 24 0 23.137 0 22.073V1.927z\" style=\"fill: #FFF\" />\n      <path d=\"M11.085 22.2v-1.36c0-.522-.318-.863-.864-.863-.272 0-.568.09-.773.386-.16-.25-.386-.386-.727-.386-.228 0-.455.068-.637.318v-.272h-.478V22.2h.478v-1.202c0-.386.204-.567.523-.567.318 0 .478.205.478.568V22.2h.477v-1.202c0-.386.23-.567.524-.567.32 0 .478.205.478.568V22.2h.523zm7.075-2.177h-.774v-.658h-.478v.658h-.432v.43h.432v.998c0 .5.205.795.75.795.206 0 .433-.068.592-.16l-.136-.407c-.136.09-.296.114-.41.114-.227 0-.318-.137-.318-.363v-.976h.774v-.43zm4.048-.046c-.273 0-.454.136-.568.318v-.272h-.478V22.2h.478v-1.225c0-.363.16-.567.455-.567.09 0 .204.023.295.046l.137-.454c-.09-.023-.228-.023-.32-.023zm-6.118.227c-.228-.16-.546-.227-.888-.227-.546 0-.91.272-.91.703 0 .363.274.567.75.635l.23.023c.25.045.385.113.385.227 0 .16-.182.272-.5.272-.32 0-.57-.113-.728-.227l-.228.363c.25.18.59.272.932.272.637 0 1-.295 1-.703 0-.385-.295-.59-.75-.658l-.227-.022c-.205-.023-.364-.068-.364-.204 0-.16.16-.25.41-.25.272 0 .545.114.682.182l.205-.386zm12.692-.227c-.273 0-.455.136-.568.318v-.272h-.478V22.2h.478v-1.225c0-.363.16-.567.455-.567.09 0 .203.023.294.046L29.1 20c-.09-.023-.227-.023-.318-.023zm-6.096 1.134c0 .66.455 1.135 1.16 1.135.32 0 .546-.068.774-.25l-.228-.385c-.182.136-.364.204-.57.204-.385 0-.658-.272-.658-.703 0-.407.273-.68.66-.702.204 0 .386.068.568.204l.228-.385c-.228-.182-.455-.25-.774-.25-.705 0-1.16.477-1.16 1.134zm4.413 0v-1.087h-.48v.272c-.158-.204-.385-.318-.68-.318-.615 0-1.093.477-1.093 1.134 0 .66.478 1.135 1.092 1.135.317 0 .545-.113.68-.317v.272h.48v-1.09zm-1.753 0c0-.384.25-.702.66-.702.387 0 .66.295.66.703 0 .387-.273.704-.66.704-.41-.022-.66-.317-.66-.703zm-5.71-1.133c-.636 0-1.09.454-1.09 1.134 0 .682.454 1.135 1.114 1.135.32 0 .638-.09.888-.295l-.228-.34c-.18.136-.41.227-.636.227-.296 0-.592-.136-.66-.522h1.615v-.18c.022-.704-.388-1.158-1.002-1.158zm0 .41c.297 0 .502.18.547.52h-1.137c.045-.295.25-.52.59-.52zm11.852.724v-1.95h-.48v1.135c-.158-.204-.385-.318-.68-.318-.615 0-1.093.477-1.093 1.134 0 .66.478 1.135 1.092 1.135.318 0 .545-.113.68-.317v.272h.48v-1.09zm-1.752 0c0-.384.25-.702.66-.702.386 0 .66.295.66.703 0 .387-.274.704-.66.704-.41-.022-.66-.317-.66-.703zm-15.97 0v-1.087h-.476v.272c-.16-.204-.387-.318-.683-.318-.615 0-1.093.477-1.093 1.134 0 .66.478 1.135 1.092 1.135.318 0 .545-.113.682-.317v.272h.477v-1.09zm-1.773 0c0-.384.25-.702.66-.702.386 0 .66.295.66.703 0 .387-.274.704-.66.704-.41-.022-.66-.317-.66-.703z\" style=\"fill: #000\" />\n      <path style=\"fill: #FF5F00\" d=\"M23.095 3.49H15.93v12.836h7.165\" />\n      <path d=\"M16.382 9.91c0-2.61 1.23-4.922 3.117-6.42-1.39-1.087-3.14-1.745-5.05-1.745-4.528 0-8.19 3.65-8.19 8.164 0 4.51 3.662 8.162 8.19 8.162 1.91 0 3.66-.657 5.05-1.746-1.89-1.474-3.118-3.81-3.118-6.417z\" style=\"fill: #EB001B\" />\n      <path d=\"M32.76 9.91c0 4.51-3.664 8.162-8.19 8.162-1.91 0-3.662-.657-5.05-1.746 1.91-1.496 3.116-3.81 3.116-6.417 0-2.61-1.228-4.922-3.116-6.42 1.388-1.087 3.14-1.745 5.05-1.745 4.526 0 8.19 3.674 8.19 8.164z\" style=\"fill: #F79E1B\" />\n    </symbol>\n\n    <symbol id=\"icon-unionpay\" viewBox=\"0 0 40 24\">\n      <title>Union Pay</title>\n      <path d=\"M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z\" style=\"fill: #FFF\" />\n      <path d=\"M9.877 2h8.126c1.135 0 1.84.93 1.575 2.077l-3.783 16.35c-.267 1.142-1.403 2.073-2.538 2.073H5.13c-1.134 0-1.84-.93-1.574-2.073L7.34 4.076C7.607 2.93 8.74 2 9.878 2z\" style=\"fill: #E21836\" />\n      <path d=\"M17.325 2h9.345c1.134 0 .623.93.356 2.077l-3.783 16.35c-.265 1.142-.182 2.073-1.32 2.073H12.58c-1.137 0-1.84-.93-1.574-2.073l3.783-16.35C15.056 2.93 16.19 2 17.324 2z\" style=\"fill: #00447B\" />\n      <path d=\"M26.3 2h8.126c1.136 0 1.84.93 1.575 2.077l-3.782 16.35c-.266 1.142-1.402 2.073-2.54 2.073h-8.122c-1.137 0-1.842-.93-1.574-2.073l3.78-16.35C24.03 2.93 25.166 2 26.303 2z\" style=\"fill: #007B84\" />\n      <path d=\"M27.633 14.072l-.99 3.3h.266l-.208.68h-.266l-.062.212h-.942l.064-.21H23.58l.193-.632h.194l1.005-3.35.2-.676h.962l-.1.34s.255-.184.498-.248c.242-.064 1.636-.088 1.636-.088l-.206.672h-.33zm-1.695 0l-.254.843s.285-.13.44-.172c.16-.04.395-.057.395-.057l.182-.614h-.764zm-.38 1.262l-.263.877s.29-.15.447-.196c.157-.037.396-.066.396-.066l.185-.614h-.766zm-.614 2.046h.767l.222-.74h-.765l-.223.74z\" style=\"fill: #FEFEFE\" />\n      <path d=\"M28.055 13.4h1.027l.01.385c-.005.065.05.096.17.096h.208l-.19.637h-.555c-.48.035-.662-.172-.65-.406l-.02-.71zM28.193 16.415h-.978l.167-.566H28.5l.16-.517h-1.104l.19-.638h3.072l-.193.638h-1.03l-.16.516h1.032l-.17.565H29.18l-.2.24h.454l.11.712c.013.07.014.116.036.147.023.026.158.038.238.038h.137l-.21.694h-.348c-.054 0-.133-.004-.243-.01-.105-.008-.18-.07-.25-.105-.064-.03-.16-.11-.182-.24l-.11-.712-.507.7c-.162.222-.38.39-.748.39h-.712l.186-.62h.273c.078 0 .15-.03.2-.056.052-.023.098-.05.15-.126l.74-1.05zM17.478 14.867h2.59l-.19.622H18.84l-.16.53h1.06l-.194.64h-1.06l-.256.863c-.03.095.25.108.353.108l.53-.072-.212.71h-1.193c-.096 0-.168-.013-.272-.037-.1-.023-.145-.07-.19-.138-.043-.07-.11-.128-.064-.278l.343-1.143h-.588l.195-.65h.592l.156-.53h-.588l.188-.623zM19.223 13.75h1.063l-.194.65H18.64l-.157.136c-.067.066-.09.038-.18.087-.08.04-.254.123-.477.123h-.466l.19-.625h.14c.118 0 .198-.01.238-.036.046-.03.098-.096.157-.203l.267-.487h1.057l-.187.356zM20.74 13.4h.905l-.132.46s.286-.23.487-.313c.2-.075.65-.143.65-.143l1.464-.007-.498 1.672c-.085.286-.183.472-.244.555-.055.087-.12.16-.248.23-.124.066-.236.104-.34.115-.096.007-.244.01-.45.012h-1.41l-.4 1.324c-.037.13-.055.194-.03.23.02.03.068.066.135.066l.62-.06-.21.726h-.698c-.22 0-.383-.004-.495-.013-.108-.01-.22 0-.295-.058-.065-.058-.164-.133-.162-.21.007-.073.037-.192.082-.356l1.268-4.23zm1.922 1.69h-1.484l-.09.3h1.283c.152-.018.184.004.196-.003l.096-.297zm-1.402-.272s.29-.266.786-.353c.112-.022.82-.015.82-.015l.106-.357h-1.496l-.216.725z\" style=\"fill: #FEFEFE\" />\n      <path d=\"M23.382 16.1l-.084.402c-.036.125-.067.22-.16.302-.1.084-.216.172-.488.172l-.502.02-.004.455c-.006.13.028.117.048.138.024.022.045.032.067.04l.157-.008.48-.028-.198.663h-.552c-.385 0-.67-.008-.765-.084-.092-.057-.105-.132-.103-.26l.035-1.77h.88l-.013.362h.212c.072 0 .12-.007.15-.026.027-.02.047-.048.06-.093l.087-.282h.692zM10.84 7.222c-.032.143-.596 2.763-.598 2.764-.12.53-.21.91-.508 1.152-.172.14-.37.21-.6.21-.37 0-.587-.185-.624-.537l-.007-.12.113-.712s.593-2.388.7-2.703c.002-.017.005-.026.007-.035-1.152.01-1.357 0-1.37-.018-.007.024-.037.173-.037.173l-.605 2.688-.05.23-.1.746c0 .22.042.4.13.553.275.485 1.06.557 1.504.557.573 0 1.11-.123 1.47-.345.63-.375.797-.962.944-1.48l.067-.267s.61-2.48.716-2.803c.003-.017.006-.026.01-.035-.835.01-1.08 0-1.16-.018zM14.21 12.144c-.407-.006-.55-.006-1.03.018l-.018-.036c.042-.182.087-.363.127-.548l.06-.25c.086-.39.173-.843.184-.98.007-.084.036-.29-.2-.29-.1 0-.203.048-.307.096-.058.207-.174.79-.23 1.055-.118.558-.126.62-.178.897l-.036.037c-.42-.006-.566-.006-1.05.018l-.024-.04c.08-.332.162-.668.24-.998.203-.9.25-1.245.307-1.702l.04-.028c.47-.067.585-.08 1.097-.185l.043.047-.077.287c.086-.052.168-.104.257-.15.242-.12.51-.155.658-.155.223 0 .468.062.57.323.098.232.034.52-.094 1.084l-.066.287c-.13.627-.152.743-.225 1.174l-.05.036zM15.87 12.144c-.245 0-.405-.006-.56 0-.153 0-.303.008-.532.018l-.013-.02-.015-.02c.062-.238.097-.322.128-.406.03-.084.06-.17.115-.41.072-.315.116-.535.147-.728.033-.187.052-.346.075-.53l.02-.014.02-.018c.244-.036.4-.057.56-.082.16-.024.32-.055.574-.103l.008.023.008.022c-.047.195-.094.39-.14.588-.047.197-.094.392-.137.587-.093.414-.13.57-.152.68-.02.105-.026.163-.063.377l-.022.02-.023.017zM19.542 10.728c.143-.633.033-.928-.108-1.11-.213-.273-.59-.36-.978-.36-.235 0-.793.023-1.23.43-.312.29-.458.687-.546 1.066-.088.387-.19 1.086.447 1.344.198.085.48.108.662.108.466 0 .945-.13 1.304-.513.278-.312.405-.775.448-.965zm-1.07-.046c-.02.106-.113.503-.24.673-.086.123-.19.198-.305.198-.033 0-.235 0-.238-.3-.003-.15.027-.304.063-.47.108-.478.236-.88.56-.88.255 0 .27.298.16.78zM29.536 12.187c-.493-.004-.635-.004-1.09.015l-.03-.037c.124-.472.248-.943.358-1.42.142-.62.175-.882.223-1.244l.037-.03c.49-.07.625-.09 1.135-.186l.015.044c-.093.388-.186.777-.275 1.166-.19.816-.258 1.23-.33 1.658l-.044.035z\" style=\"fill: #FEFEFE\" />\n      <path d=\"M29.77 10.784c.144-.63-.432-.056-.525-.264-.14-.323-.052-.98-.62-1.2-.22-.085-.732.025-1.17.428-.31.29-.458.683-.544 1.062-.088.38-.19 1.078.444 1.328.2.085.384.11.567.103.638-.034 1.124-1.002 1.483-1.386.277-.303.326.115.368-.07zm-.974-.047c-.024.1-.117.503-.244.67-.083.117-.283.192-.397.192-.032 0-.232 0-.24-.3 0-.146.03-.3.067-.467.11-.47.235-.87.56-.87.254 0 .363.293.254.774zM22.332 12.144c-.41-.006-.55-.006-1.03.018l-.018-.036c.04-.182.087-.363.13-.548l.057-.25c.09-.39.176-.843.186-.98.008-.084.036-.29-.198-.29-.1 0-.203.048-.308.096-.057.207-.175.79-.232 1.055-.115.558-.124.62-.176.897l-.035.037c-.42-.006-.566-.006-1.05.018l-.022-.04.238-.998c.203-.9.25-1.245.307-1.702l.038-.028c.472-.067.587-.08 1.098-.185l.04.047-.073.287c.084-.052.17-.104.257-.15.24-.12.51-.155.655-.155.224 0 .47.062.575.323.095.232.03.52-.098 1.084l-.065.287c-.133.627-.154.743-.225 1.174l-.05.036zM26.32 8.756c-.07.326-.282.603-.554.736-.225.114-.498.123-.78.123h-.183l.013-.074.336-1.468.01-.076.007-.058.132.015.71.062c.275.105.388.38.31.74zM25.88 7.22l-.34.003c-.883.01-1.238.006-1.383-.012l-.037.182-.315 1.478-.793 3.288c.77-.01 1.088-.01 1.22.004l.21-1.024s.153-.644.163-.667c0 0 .047-.066.096-.092h.07c.665 0 1.417 0 2.005-.437.4-.298.675-.74.797-1.274.03-.132.054-.29.054-.446 0-.205-.04-.41-.16-.568-.3-.423-.896-.43-1.588-.433zM33.572 9.28l-.04-.043c-.502.1-.594.118-1.058.18l-.034.034-.005.023-.003-.007c-.345.803-.334.63-.615 1.26-.003-.03-.003-.048-.004-.077l-.07-1.37-.044-.043c-.53.1-.542.118-1.03.18l-.04.034-.006.056.003.007c.06.315.047.244.108.738.03.244.065.49.093.73.05.4.077.6.134 1.21-.328.55-.408.757-.722 1.238l.017.044c.478-.018.587-.018.94-.018l.08-.088c.265-.578 2.295-4.085 2.295-4.085zM16.318 9.62c.27-.19.304-.45.076-.586-.23-.137-.634-.094-.906.095-.273.186-.304.45-.075.586.228.134.633.094.905-.096z\" style=\"fill: #FEFEFE\" />\n      <path d=\"M31.238 13.415l-.397.684c-.124.232-.357.407-.728.41l-.632-.01.184-.618h.124c.064 0 .11-.004.148-.022.03-.01.054-.035.08-.072l.233-.373h.988z\" style=\"fill: #FEFEFE\" />\n    </symbol>\n\n    <symbol id=\"icon-american-express\" viewBox=\"0 0 40 24\">\n      <title>American Express</title>\n      <path d=\"M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z\" style=\"fill: #FFF\" />\n      <path style=\"fill: #1478BE\" d=\"M6.26 12.32h2.313L7.415 9.66M27.353 9.977h-3.738v1.23h3.666v1.384h-3.675v1.385h3.821v1.005c.623-.77 1.33-1.466 2.025-2.235l.707-.77c-.934-1.004-1.87-2.08-2.804-3.075v1.077z\" />\n      <path d=\"M38.25 7h-5.605l-1.328 1.4L30.072 7H16.984l-1.017 2.416L14.877 7h-9.58L1.25 16.5h4.826l.623-1.556h1.4l.623 1.556H29.99l1.327-1.483 1.328 1.483h5.605l-4.36-4.667L38.25 7zm-17.685 8.1h-1.557V9.883L16.673 15.1h-1.33L13.01 9.883l-.084 5.217H9.73l-.623-1.556h-3.27L5.132 15.1H3.42l2.884-6.772h2.42l2.645 6.233V8.33h2.646l2.107 4.51 1.868-4.51h2.575V15.1zm14.727 0h-2.024l-2.024-2.26-2.023 2.26H22.06V8.328H29.53l1.795 2.177 2.024-2.177h2.025L32.26 11.75l3.032 3.35z\" style=\"fill: #1478BE\" />\n    </symbol>\n\n    <symbol id=\"icon-jcb\" viewBox=\"0 0 40 24\">\n      <title>JCB</title>\n      <path d=\"M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z\" style=\"fill: #FFF\" />\n      <path d=\"M33.273 2.01h.013v17.062c-.004 1.078-.513 2.103-1.372 2.746-.63.47-1.366.67-2.14.67-.437 0-4.833.026-4.855 0-.01-.01 0-.07 0-.082v-6.82c0-.04.004-.064.033-.064h5.253c.867 0 1.344-.257 1.692-.61.44-.448.574-1.162.294-1.732-.24-.488-.736-.78-1.244-.913-.158-.04-.32-.068-.483-.083-.01 0-.064 0-.07-.006-.03-.034.023-.04.038-.046.102-.033.215-.042.32-.073.532-.164.993-.547 1.137-1.105.15-.577-.05-1.194-.524-1.552-.34-.257-.768-.376-1.187-.413-.43-.038-4.774-.022-5.21-.022-.072 0-.05-.02-.05-.09V5.63c0-.31.01-.616.073-.92.126-.592.41-1.144.815-1.59.558-.615 1.337-1.01 2.16-1.093.478-.048 4.89-.017 5.305-.017zm-4.06 8.616c.06.272-.01.567-.204.77-.173.176-.407.25-.648.253-.195.003-1.725 0-1.788 0l.003-1.645c.012-.027.02-.018.06-.018.097 0 1.713-.004 1.823.005.232.02.45.12.598.306.076.096.128.208.155.328zm-2.636 2.038h1.944c.242.002.47.063.652.228.226.204.327.515.283.815-.04.263-.194.5-.422.634-.187.112-.39.125-.6.125h-1.857v-1.8z\" style=\"fill: #53B230\" />\n      <path d=\"M6.574 13.89c-.06-.03-.06-.018-.07-.06-.006-.026-.005-8.365.003-8.558.04-.95.487-1.857 1.21-2.47.517-.434 1.16-.71 1.83-.778.396-.04.803-.018 1.2-.018.69 0 4.11-.013 4.12 0 .008.008.002 16.758 0 17.074-.003.956-.403 1.878-1.105 2.523-.506.465-1.15.77-1.83.86-.41.056-5.02.032-5.363.032-.066 0-.054.013-.066-.024-.01-.025 0-7 0-7.17.66.178 1.35.28 2.03.348.662.067 1.33.093 1.993.062.93-.044 1.947-.192 2.712-.762.32-.238.574-.553.73-.922.148-.353.2-.736.2-1.117 0-.348.006-3.93-.016-3.942-.023-.014-2.885-.015-2.9.012-.012.022 0 3.87 0 3.95-.003.47-.16.933-.514 1.252-.468.42-1.11.47-1.707.423-.687-.055-1.357-.245-1.993-.508-.157-.065-.312-.135-.466-.208z\" style=\"fill: #006CB9\" />\n      <path d=\"M15.95 9.835c-.025.02-.05.04-.072.06V6.05c0-.295-.012-.594.01-.888.12-1.593 1.373-2.923 2.944-3.126.382-.05 5.397-.042 5.41-.026.01.01 0 .062 0 .074v16.957c0 1.304-.725 2.52-1.89 3.1-.504.25-1.045.35-1.605.35-.322 0-4.757.015-4.834 0-.05-.01-.023.01-.035-.02-.007-.022 0-6.548 0-7.44v-.422c.554.48 1.256.75 1.96.908.536.12 1.084.176 1.63.196.537.02 1.076.01 1.61-.037.546-.05 1.088-.136 1.625-.244.137-.028.274-.057.41-.09.033-.006.17-.017.187-.044.013-.02 0-.097 0-.12v-1.324c-.582.292-1.19.525-1.83.652-.778.155-1.64.198-2.385-.123-.752-.326-1.2-1.024-1.274-1.837-.076-.837.173-1.716.883-2.212.736-.513 1.7-.517 2.553-.38.634.1 1.245.305 1.825.58.078.037.154.075.23.113V9.322c0-.02.013-.1 0-.118-.02-.028-.152-.038-.188-.046-.066-.016-.133-.03-.2-.045C22.38 9 21.84 8.908 21.3 8.85c-.533-.06-1.068-.077-1.603-.066-.542.01-1.086.054-1.62.154-.662.125-1.32.337-1.883.716-.085.056-.167.117-.245.18z\" style=\"fill: #E20138\" />\n    </symbol>\n\n    <symbol id=\"icon-discover\" viewBox=\"0 0 40 24\">\n      <title>Discover</title>\n      <path d=\"M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z\" style=\"fill: #FFF\" />\n      <path d=\"M38.995 11.75S27.522 20.1 6.5 23.5h31.495c.552 0 1-.448 1-1V11.75z\" style=\"fill: #F48024\" />\n      <path d=\"M5.332 11.758c-.338.305-.776.438-1.47.438h-.29V8.55h.29c.694 0 1.115.124 1.47.446.37.33.595.844.595 1.372 0 .53-.224 1.06-.595 1.39zM4.077 7.615H2.5v5.515h1.57c.833 0 1.435-.197 1.963-.637.63-.52 1-1.305 1-2.116 0-1.628-1.214-2.762-2.956-2.762zM7.53 13.13h1.074V7.616H7.53M11.227 9.732c-.645-.24-.834-.397-.834-.695 0-.347.338-.61.8-.61.322 0 .587.132.867.446l.562-.737c-.462-.405-1.015-.612-1.618-.612-.975 0-1.718.678-1.718 1.58 0 .76.346 1.15 1.355 1.513.42.148.635.247.743.314.215.14.322.34.322.57 0 .448-.354.78-.834.78-.51 0-.924-.258-1.17-.736l-.695.67c.495.726 1.09 1.05 1.907 1.05 1.116 0 1.9-.745 1.9-1.812 0-.876-.363-1.273-1.585-1.72zM13.15 10.377c0 1.62 1.27 2.877 2.907 2.877.462 0 .858-.09 1.347-.32v-1.267c-.43.43-.81.604-1.297.604-1.082 0-1.85-.785-1.85-1.9 0-1.06.792-1.895 1.8-1.895.512 0 .9.183 1.347.62V7.83c-.472-.24-.86-.34-1.322-.34-1.627 0-2.932 1.283-2.932 2.887zM25.922 11.32l-1.468-3.705H23.28l2.337 5.656h.578l2.38-5.655H27.41M29.06 13.13h3.046v-.934h-1.973v-1.488h1.9v-.934h-1.9V8.55h1.973v-.935H29.06M34.207 10.154h-.314v-1.67h.33c.67 0 1.034.28 1.034.818 0 .554-.364.852-1.05.852zm2.155-.91c0-1.033-.71-1.628-1.95-1.628H32.82v5.514h1.073v-2.215h.14l1.487 2.215h1.32l-1.733-2.323c.81-.165 1.255-.72 1.255-1.563z\" style=\"fill: #221F20\" />\n      <path d=\"M23.6 10.377c0 1.62-1.31 2.93-2.927 2.93-1.617.002-2.928-1.31-2.928-2.93s1.31-2.932 2.928-2.932c1.618 0 2.928 1.312 2.928 2.932z\" style=\"fill: #F48024\" />\n    </symbol>\n\n    <symbol id=\"icon-diners-club\" viewBox=\"0 0 40 24\">\n      <title>Diners Club</title>\n      <path d=\"M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z\" style=\"fill: #FFF\" />\n      <path d=\"M9.02 11.83c0-5.456 4.54-9.88 10.14-9.88 5.6 0 10.139 4.424 10.139 9.88-.002 5.456-4.54 9.88-10.14 9.88-5.6 0-10.14-4.424-10.14-9.88z\" style=\"fill: #FEFEFE\" />\n      <path style=\"fill: #FFF\" d=\"M32.522 22H8.5V1.5h24.022\" />\n      <path d=\"M25.02 11.732c-.003-2.534-1.607-4.695-3.868-5.55v11.102c2.26-.857 3.865-3.017 3.87-5.552zm-8.182 5.55V6.18c-2.26.86-3.86 3.017-3.867 5.55.007 2.533 1.61 4.69 3.868 5.55zm2.158-14.934c-5.25.002-9.503 4.202-9.504 9.384 0 5.182 4.254 9.38 9.504 9.382 5.25 0 9.504-4.2 9.505-9.382 0-5.182-4.254-9.382-9.504-9.384zM18.973 22C13.228 22.027 8.5 17.432 8.5 11.84 8.5 5.726 13.228 1.5 18.973 1.5h2.692c5.677 0 10.857 4.225 10.857 10.34 0 5.59-5.18 10.16-10.857 10.16h-2.692z\" style=\"fill: #004A97\" />\n    </symbol>\n\n    <symbol id=\"icon-maestro\" viewBox=\"0 0 40 24\">\n      <title>Maestro</title>\n      <path d=\"M38.333 24H1.667C.75 24 0 23.28 0 22.4V1.6C0 .72.75 0 1.667 0h36.666C39.25 0 40 .72 40 1.6v20.8c0 .88-.75 1.6-1.667 1.6z\" style=\"fill: #FFF\" />\n      <path d=\"M14.67 22.39V21c.022-.465-.303-.86-.767-.882h-.116c-.3-.023-.603.14-.788.394-.164-.255-.442-.417-.743-.394-.256-.023-.51.116-.65.324v-.278h-.487v2.203h.487v-1.183c-.046-.278.162-.533.44-.58h.094c.325 0 .488.21.488.58v1.23h.487v-1.23c-.047-.278.162-.556.44-.58h.093c.325 0 .487.21.487.58v1.23l.534-.024zm2.712-1.09v-1.113h-.487v.28c-.162-.21-.417-.326-.695-.326-.65 0-1.16.51-1.16 1.16 0 .65.51 1.16 1.16 1.16.278 0 .533-.117.695-.325v.278h.487V21.3zm-1.786 0c.024-.37.348-.65.72-.626.37.023.65.348.626.72-.023.347-.302.625-.673.625-.372 0-.674-.28-.674-.65-.023-.047-.023-.047 0-.07zm12.085-1.16c.163 0 .325.024.465.094.14.046.278.14.37.255.117.115.186.23.256.37.117.3.117.626 0 .927-.046.14-.138.255-.254.37-.116.117-.232.186-.37.256-.303.116-.65.116-.952 0-.14-.046-.28-.14-.37-.255-.118-.116-.187-.232-.257-.37-.116-.302-.116-.627 0-.928.047-.14.14-.255.256-.37.115-.117.23-.187.37-.256.163-.07.325-.116.488-.093zm0 .465c-.092 0-.185.023-.278.046-.092.024-.162.094-.232.14-.07.07-.116.14-.14.232-.068.185-.068.394 0 .58.024.092.094.162.14.23.07.07.14.117.232.14.186.07.37.07.557 0 .092-.023.16-.092.23-.14.07-.068.117-.138.14-.23.07-.186.07-.395 0-.58-.023-.093-.093-.162-.14-.232-.07-.07-.138-.116-.23-.14-.094-.045-.187-.07-.28-.045zm-7.677.695c0-.695-.44-1.16-1.043-1.16-.65 0-1.16.534-1.137 1.183.023.65.534 1.16 1.183 1.136.325 0 .65-.093.905-.302l-.23-.348c-.187.14-.42.232-.65.232-.326.023-.627-.21-.673-.533h1.646v-.21zm-1.646-.21c.023-.3.278-.532.58-.532.3 0 .556.232.556.533h-1.136zm3.664-.346c-.207-.116-.44-.186-.695-.186-.255 0-.417.093-.417.255 0 .163.162.186.37.21l.233.022c.488.07.766.278.766.672 0 .395-.37.72-1.02.72-.348 0-.673-.094-.95-.28l.23-.37c.21.162.465.232.743.232.324 0 .51-.094.51-.28 0-.115-.117-.185-.395-.23l-.232-.024c-.487-.07-.765-.302-.765-.65 0-.44.37-.718.927-.718.325 0 .627.07.905.232l-.21.394zm2.32-.116h-.788v.997c0 .23.07.37.325.37.14 0 .3-.046.417-.115l.14.417c-.186.116-.395.162-.604.162-.58 0-.765-.302-.765-.812v-1.02h-.44v-.44h.44v-.673h.487v.672h.79v.44zm1.67-.51c.117 0 .233.023.35.07l-.14.463c-.093-.045-.21-.045-.302-.045-.325 0-.464.208-.464.58v1.25h-.487v-2.2h.487v.277c.116-.255.325-.37.557-.394z\" style=\"fill: #000\" />\n      <path style=\"fill: #7673C0\" d=\"M23.64 3.287h-7.305V16.41h7.306\" />\n      <path d=\"M16.8 9.848c0-2.55 1.183-4.985 3.2-6.56C16.384.435 11.12 1.06 8.29 4.7 5.435 8.32 6.06 13.58 9.703 16.41c3.038 2.387 7.283 2.387 10.32 0-2.04-1.578-3.223-3.99-3.223-6.562z\" style=\"fill: #EB001B\" />\n      <path d=\"M33.5 9.848c0 4.613-3.735 8.346-8.35 8.346-1.88 0-3.69-.626-5.15-1.785 3.618-2.83 4.245-8.092 1.415-11.71-.418-.532-.882-.996-1.415-1.413C23.618.437 28.883 1.06 31.736 4.7 32.873 6.163 33.5 7.994 33.5 9.85z\" style=\"fill: #00A1DF\" />\n    </symbol>\n\n    <symbol id=\"logoPayPal\" viewBox=\"0 0 48 29\">\n      <title>PayPal Logo</title>\n      <path d=\"M46 29H2c-1.1 0-2-.87-2-1.932V1.934C0 .87.9 0 2 0h44c1.1 0 2 .87 2 1.934v25.134C48 28.13 47.1 29 46 29z\" fill-opacity=\"0\" style=\"fill: #FFF\" />\n      <path d=\"M31.216 16.4c.394-.7.69-1.5.886-2.4.196-.8.196-1.6.1-2.2-.1-.7-.396-1.2-.79-1.7-.195-.3-.59-.5-.885-.7.1-.8.1-1.5 0-2.1-.1-.6-.394-1.1-.886-1.6-.885-1-2.56-1.6-4.922-1.6h-6.4c-.492 0-.787.3-.886.8l-2.658 17.2c0 .2 0 .3.1.4.097.1.294.2.393.2h4.036l-.295 1.8c0 .1 0 .3.1.4.098.1.195.2.393.2h3.35c.393 0 .688-.3.786-.7v-.2l.59-4.1v-.2c.1-.4.395-.7.788-.7h.59c1.675 0 3.152-.4 4.137-1.1.59-.5 1.083-1 1.478-1.7h-.002z\" style=\"fill: #263B80\" />\n      <path d=\"M21.364 9.4c0-.3.196-.5.492-.6.098-.1.196-.1.394-.1h5.02c.592 0 1.183 0 1.675.1.1 0 .295.1.394.1.098 0 .294.1.393.1.1 0 .1 0 .197.102.295.1.492.2.69.3.295-1.6 0-2.7-.887-3.8-.985-1.1-2.658-1.6-4.923-1.6h-6.4c-.49 0-.885.3-.885.8l-2.758 17.3c-.098.3.197.6.59.6h3.94l.985-6.4 1.083-6.9z\" style=\"fill: #263B80\" />\n      <path d=\"M30.523 9.4c0 .1 0 .3-.098.4-.887 4.4-3.742 5.9-7.484 5.9h-1.87c-.492 0-.787.3-.886.8l-.985 6.2-.296 1.8c0 .3.196.6.492.6h3.348c.394 0 .69-.3.787-.7v-.2l.592-4.1v-.2c.1-.4.394-.7.787-.7h.69c3.248 0 5.808-1.3 6.497-5.2.296-1.6.197-3-.69-3.9-.196-.3-.49-.5-.885-.7z\" style=\"fill: #159BD7\" />\n      <path d=\"M29.635 9c-.098 0-.295-.1-.394-.1-.098 0-.294-.1-.393-.1-.492-.102-1.083-.102-1.673-.102h-5.022c-.1 0-.197 0-.394.1-.198.1-.394.3-.492.6l-1.083 6.9v.2c.1-.5.492-.8.886-.8h1.87c3.742 0 6.598-1.5 7.484-5.9 0-.1 0-.3.098-.4-.196-.1-.492-.2-.69-.3 0-.1-.098-.1-.196-.1z\" style=\"fill: #232C65\" />\n    </symbol>\n\n    <symbol id=\"logoPayPalCredit\" viewBox=\"0 0 48 29\">\n      <title>PayPal Credit Logo</title>\n      <path d=\"M46 29H2c-1.1 0-2-.87-2-1.932V1.934C0 .87.9 0 2 0h44c1.1 0 2 .87 2 1.934v25.134C48 28.13 47.1 29 46 29z\" fill-opacity=\"0\" style=\"fill: #FFF\" fill-rule=\"nonzero\" />\n      <path d=\"M27.44 21.6h.518c1.377 0 2.67-.754 2.953-2.484.248-1.588-.658-2.482-2.14-2.482h-.38c-.093 0-.172.067-.187.16l-.763 4.805zm-1.254-6.646c.024-.158.16-.273.32-.273h2.993c2.47 0 4.2 1.942 3.81 4.436-.4 2.495-2.752 4.436-5.21 4.436h-3.05c-.116 0-.205-.104-.187-.218l1.323-8.38zM22.308 16.907l-.192 1.21h2.38c.116 0 .204.103.186.217l-.23 1.462c-.023.157-.16.273-.318.273h-2.048c-.16 0-.294.114-.32.27l-.203 1.26h2.52c.117 0 .205.102.187.217l-.228 1.46c-.025.16-.16.275-.32.275h-4.55c-.116 0-.204-.104-.186-.218l1.322-8.38c.025-.158.16-.273.32-.273h4.55c.116 0 .205.104.187.22l-.23 1.46c-.024.158-.16.274-.32.274H22.63c-.16 0-.295.115-.32.273M35.325 23.552h-1.81c-.115 0-.203-.104-.185-.218l1.322-8.38c.025-.158.16-.273.32-.273h1.81c.115 0 .203.104.185.22l-1.322 8.38c-.025.156-.16.272-.32.272M14.397 18.657h.224c.754 0 1.62-.14 1.777-1.106.158-.963-.345-1.102-1.15-1.104h-.326c-.097 0-.18.07-.197.168l-.326 2.043zm3.96 4.895h-2.37c-.102 0-.194-.058-.238-.15l-1.565-3.262h-.023l-.506 3.19c-.02.128-.13.222-.26.222h-1.86c-.116 0-.205-.104-.187-.218l1.33-8.432c.02-.128.13-.22.26-.22h3.222c1.753 0 2.953.834 2.66 2.728-.2 1.224-1.048 2.283-2.342 2.506l2.037 3.35c.076.125-.014.286-.16.286zM40.216 23.552h-1.808c-.116 0-.205-.104-.187-.218l1.06-6.7h-1.684c-.116 0-.205-.104-.187-.218l.228-1.462c.025-.157.16-.273.32-.273h5.62c.116 0 .205.104.186.22l-.228 1.46c-.025.158-.16.274-.32.274h-1.63l-1.05 6.645c-.025.156-.16.272-.32.272M11.467 17.202c-.027.164-.228.223-.345.104-.395-.405-.975-.62-1.6-.62-1.41 0-2.526 1.083-2.75 2.458-.21 1.4.588 2.41 2.022 2.41.592 0 1.22-.225 1.74-.6.144-.105.34.02.313.194l-.328 2.03c-.02.12-.108.22-.226.254-.702.207-1.24.355-1.9.355-3.823 0-4.435-3.266-4.238-4.655.553-3.894 3.712-4.786 5.65-4.678.623.034 1.182.117 1.73.323.177.067.282.25.252.436l-.32 1.99\" style=\"fill: #21306F\" />\n      <path d=\"M23.184 7.67c-.11.717-.657.717-1.186.717h-.302l.212-1.34c.013-.08.082-.14.164-.14h.138c.36 0 .702 0 .877.206.105.123.137.305.097.557zm-.23-1.87h-1.998c-.137 0-.253.098-.274.233l-.808 5.123c-.016.1.062.192.165.192h1.024c.095 0 .177-.07.192-.164l.23-1.452c.02-.135.136-.235.273-.235h.63c1.317 0 2.076-.636 2.275-1.898.09-.553.003-.987-.255-1.29-.284-.334-.788-.51-1.456-.51z\" style=\"fill: #0093C7\" />\n      <path d=\"M8.936 7.67c-.11.717-.656.717-1.186.717h-.302l.212-1.34c.013-.08.082-.14.164-.14h.138c.36 0 .702 0 .877.206.104.123.136.305.096.557zm-.23-1.87H6.708c-.136 0-.253.098-.274.233l-.808 5.123c-.016.1.062.192.165.192h.955c.136 0 .252-.1.274-.234l.217-1.382c.02-.135.137-.235.274-.235h.633c1.316 0 2.075-.636 2.274-1.898.09-.553.003-.987-.255-1.29-.284-.334-.788-.51-1.456-.51zM13.343 9.51c-.092.545-.526.912-1.08.912-.277 0-.5-.09-.642-.258-.14-.168-.193-.406-.148-.672.086-.542.527-.92 1.072-.92.27 0 .492.09.637.26.148.172.205.412.163.677zm1.334-1.863h-.957c-.082 0-.152.06-.164.14l-.042.268-.067-.097c-.208-.3-.67-.4-1.13-.4-1.057 0-1.96.8-2.135 1.923-.092.56.038 1.097.356 1.47.29.344.708.487 1.204.487.852 0 1.325-.548 1.325-.548l-.043.265c-.016.1.062.193.164.193h.862c.136 0 .253-.1.274-.234l.517-3.275c.017-.102-.06-.193-.163-.193z\" style=\"fill: #21306F\" />\n      <path d=\"M27.59 9.51c-.09.545-.525.912-1.078.912-.278 0-.5-.09-.643-.258-.142-.168-.195-.406-.15-.672.086-.542.526-.92 1.07-.92.273 0 .494.09.64.26.146.172.203.412.16.677zm1.334-1.863h-.956c-.082 0-.152.06-.164.14l-.043.268-.065-.097c-.208-.3-.67-.4-1.13-.4-1.057 0-1.96.8-2.136 1.923-.092.56.038 1.097.355 1.47.292.344.71.487 1.205.487.852 0 1.325-.548 1.325-.548l-.043.265c-.016.1.062.193.164.193h.862c.136 0 .253-.1.274-.234l.517-3.275c.015-.102-.063-.193-.166-.193z\" style=\"fill: #0093C7\" />\n      <path d=\"M19.77 7.647h-.96c-.092 0-.178.045-.23.122L17.254 9.72l-.562-1.877c-.035-.118-.143-.198-.266-.198h-.945c-.113 0-.194.112-.157.22l1.06 3.108-.997 1.404c-.078.11 0 .262.136.262h.96c.092 0 .177-.044.23-.12l3.196-4.614c.077-.11-.002-.26-.137-.26\" style=\"fill: #21306F\" />\n      <path d=\"M30.052 5.94l-.82 5.216c-.016.1.062.192.165.192h.824c.138 0 .254-.1.275-.234l.81-5.122c.015-.1-.064-.193-.166-.193h-.924c-.082 0-.15.06-.164.14\" style=\"fill: #0093C7\" />\n    </symbol>\n\n    <symbol id=\"iconCardFront\" viewBox=\"0 0 48 29\">\n      <title>Generic Card</title>\n      <path d=\"M46.177 29H1.823C.9 29 0 28.13 0 27.187V1.813C0 .87.9 0 1.823 0h44.354C47.1 0 48 .87 48 1.813v25.375C48 28.13 47.1 29 46.177 29z\" style=\"fill: #FFF\" />\n      <path d=\"M4.8 9.14c0-.427.57-.973 1.067-.973h7.466c.496 0 1.067.546 1.067.972v3.888c0 .425-.57.972-1.067.972H5.867c-.496 0-1.067-.547-1.067-.972v-3.89z\" style=\"fill: #828282\" />\n      <rect style=\"fill: #828282\" x=\"10.8\" y=\"22.167\" width=\"3.6\" height=\"2.333\" rx=\"1.167\" />\n      <rect style=\"fill: #828282\" x=\"4.8\" y=\"22.167\" width=\"3.6\" height=\"2.333\" rx=\"1.167\" />\n      <path d=\"M6.55 16.333h34.9c.966 0 1.75.784 1.75 1.75 0 .967-.784 1.75-1.75 1.75H6.55c-.966 0-1.75-.783-1.75-1.75 0-.966.784-1.75 1.75-1.75z\" style=\"fill: #828282\" />\n      <ellipse style=\"fill: #828282\" cx=\"40.2\" cy=\"6.417\" rx=\"3\" ry=\"2.917\" />\n    </symbol>\n\n    <symbol id=\"iconCVVBack\" viewBox=\"0 0 40 24\">\n      <title>CVV Back</title>\n      <path d=\"M38.48 24H1.52C.75 24 0 23.28 0 22.5v-21C0 .72.75 0 1.52 0h36.96C39.25 0 40 .72 40 1.5v21c0 .78-.75 1.5-1.52 1.5z\" style=\"fill: #FFF\"/>\n      <path style=\"fill: #828282\" d=\"M0 5h40v4H0z\" />\n      <path d=\"M20 13.772v5.456c0 .423.37.772.82.772h13.36c.45 0 .82-.35.82-.772v-5.456c0-.423-.37-.772-.82-.772H20.82c-.45 0-.82.35-.82.772zm-1-.142c0-.9.76-1.63 1.68-1.63h13.64c.928 0 1.68.737 1.68 1.63v5.74c0 .9-.76 1.63-1.68 1.63H20.68c-.928 0-1.68-.737-1.68-1.63v-5.74z\" style=\"fill: #000\" fill-rule=\"nonzero\" />\n      <circle style=\"fill: #828282\" cx=\"23.5\" cy=\"16.5\" r=\"1.5\" />\n      <circle style=\"fill: #828282\" cx=\"27.5\" cy=\"16.5\" r=\"1.5\" />\n      <circle style=\"fill: #828282\" cx=\"31.5\" cy=\"16.5\" r=\"1.5\" />\n    </symbol>\n\n    <symbol id=\"iconCVVFront\" viewBox=\"0 0 40 24\">\n      <title>CVV Front</title>\n      <path d=\"M38.48 24H1.52C.75 24 0 23.28 0 22.5v-21C0 .72.75 0 1.52 0h36.96C39.25 0 40 .72 40 1.5v21c0 .78-.75 1.5-1.52 1.5z\" style=\"fill: #FFF\" />\n      <path d=\"M16 5.772v5.456c0 .423.366.772.81.772h17.38c.444 0 .81-.348.81-.772V5.772C35 5.35 34.634 5 34.19 5H16.81c-.444 0-.81.348-.81.772zm-1-.142c0-.9.75-1.63 1.66-1.63h17.68c.917 0 1.66.737 1.66 1.63v5.74c0 .9-.75 1.63-1.66 1.63H16.66c-.917 0-1.66-.737-1.66-1.63V5.63z\" style=\"fill: #000\" fill-rule=\"nonzero\" />\n      <circle style=\"fill: #828282\" cx=\"19.5\" cy=\"8.5\" r=\"1.5\" />\n      <circle style=\"fill: #828282\" cx=\"27.5\" cy=\"8.5\" r=\"1.5\" />\n      <circle style=\"fill: #828282\" cx=\"23.5\" cy=\"8.5\" r=\"1.5\" />\n      <circle style=\"fill: #828282\" cx=\"31.5\" cy=\"8.5\" r=\"1.5\" />\n      <path d=\"M4 7.833C4 7.47 4.476 7 4.89 7h6.22c.414 0 .89.47.89.833v3.334c0 .364-.476.833-.89.833H4.89c-.414 0-.89-.47-.89-.833V7.833zM4 18.5c0-.828.668-1.5 1.5-1.5h29c.828 0 1.5.666 1.5 1.5 0 .828-.668 1.5-1.5 1.5h-29c-.828 0-1.5-.666-1.5-1.5z\" style=\"fill: #828282\" />\n    </symbol>\n\n    <symbol id=\"iconCheck\" viewBox=\"0 0 42 32\">\n      <title>Check</title>\n      <path class=\"path1\" d=\"M14.379 29.76L39.741 3.415 36.194.001l-21.815 22.79-10.86-11.17L0 15.064z\" />\n    </symbol>\n\n    <symbol id=\"iconX\" viewBox=\"0 0 32 32\">\n      <title>X</title>\n      <path d=\"M29 3.54L25.46 0 14.5 10.97 3.54 0.01 0 3.54 10.96 14.5 0.01 25.46 3.54 28.99 14.5 18.04 25.46 29 28.99 25.46 18.03 14.5 29 3.54z\"/>\n    </symbol>\n\n    <symbol id=\"iconLockLoader\" viewBox=\"0 0 28 32\">\n      <title>Lock Loader</title>\n      <path d=\"M6 10V8c0-4.422 3.582-8 8-8 4.41 0 8 3.582 8 8v2h-4V7.995C18 5.79 16.205 4 14 4c-2.21 0-4 1.792-4 3.995V10H6zM.997 14c-.55 0-.997.445-.997.993v16.014c0 .548.44.993.997.993h26.006c.55 0 .997-.445.997-.993V14.993c0-.548-.44-.993-.997-.993H.997z\" />\n    </symbol>\n\n    <symbol id=\"iconError\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\">\n      <path d=\"M0 0h24v24H0z\" style=\"fill: none\" />\n      <path d=\"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z\" />\n    </symbol>\n\n    <symbol id=\"logoApplePay\" viewBox=\"0 0 165.52 105.97\" width=\"24\">\n      <title>Apple Pay Logo</title>\n      <defs>\n      <style>\n        .cls-1{fill:#231f20;}.cls-2{fill:#fff;}\n      </style>\n      </defs>\n      <path id=\"_Path_\" data-name=\"&lt;Path&gt;\" class=\"cls-1\" d=\"M150.7 0h-139a20.78 20.78 0 0 0-3.12.3 10.51 10.51 0 0 0-3 1 9.94 9.94 0 0 0-4.31 4.32 10.46 10.46 0 0 0-1 3A20.65 20.65 0 0 0 0 11.7v82.57a20.64 20.64 0 0 0 .3 3.11 10.46 10.46 0 0 0 1 3 9.94 9.94 0 0 0 4.35 4.35 10.47 10.47 0 0 0 3 1 20.94 20.94 0 0 0 3.11.27h142.06a21 21 0 0 0 3.11-.27 10.48 10.48 0 0 0 3-1 9.94 9.94 0 0 0 4.35-4.35 10.4 10.4 0 0 0 1-3 20.63 20.63 0 0 0 .27-3.11V11.69a20.64 20.64 0 0 0-.27-3.11 10.4 10.4 0 0 0-1-3 9.94 9.94 0 0 0-4.35-4.35 10.52 10.52 0 0 0-3-1 20.84 20.84 0 0 0-3.1-.23h-1.43z\"/>\n      <path id=\"_Path_2\" data-name=\"&lt;Path&gt;\" class=\"cls-2\" d=\"M150.7 3.53h3.03a17.66 17.66 0 0 1 2.58.22 7 7 0 0 1 2 .65 6.41 6.41 0 0 1 2.8 2.81 6.88 6.88 0 0 1 .64 2 17.56 17.56 0 0 1 .22 2.58v82.38a17.54 17.54 0 0 1-.22 2.59 6.85 6.85 0 0 1-.64 2 6.41 6.41 0 0 1-2.81 2.81 6.92 6.92 0 0 1-2 .65 18 18 0 0 1-2.57.22H11.79a18 18 0 0 1-2.58-.22 6.94 6.94 0 0 1-2-.65 6.41 6.41 0 0 1-2.8-2.8 6.93 6.93 0 0 1-.65-2 17.47 17.47 0 0 1-.22-2.58v-82.4a17.49 17.49 0 0 1 .22-2.59 6.92 6.92 0 0 1 .65-2 6.41 6.41 0 0 1 2.8-2.8 7 7 0 0 1 2-.65 17.63 17.63 0 0 1 2.58-.22H150.7\"/>\n      <g id=\"_Group_\" data-name=\"&lt;Group&gt;\">\n      <g id=\"_Group_2\" data-name=\"&lt;Group&gt;\">\n      <path id=\"_Path_3\" data-name=\"&lt;Path&gt;\" class=\"cls-1\" d=\"M43.51 35.77a9.15 9.15 0 0 0 2.1-6.52 9.07 9.07 0 0 0-6 3.11 8.56 8.56 0 0 0-2.16 6.27 7.57 7.57 0 0 0 6.06-2.86\"/>\n      <path id=\"_Path_4\" data-name=\"&lt;Path&gt;\" class=\"cls-1\" d=\"M45.59 39.08c-3.35-.2-6.2 1.9-7.79 1.9s-4-1.8-6.7-1.75a9.87 9.87 0 0 0-8.4 5.1c-3.6 6.2-.95 15.4 2.55 20.45 1.7 2.5 3.75 5.25 6.45 5.15s3.55-1.65 6.65-1.65 4 1.65 6.7 1.6 4.55-2.5 6.25-5a22.2 22.2 0 0 0 2.8-5.75 9.08 9.08 0 0 1-5.45-8.25A9.26 9.26 0 0 1 53 43.13a9.57 9.57 0 0 0-7.45-4\"/>\n      </g>\n      <g id=\"_Group_3\" data-name=\"&lt;Group&gt;\">\n      <path id=\"_Compound_Path_\" data-name=\"&lt;Compound Path&gt;\" class=\"cls-1\" d=\"M79 32.11c7.28 0 12.35 5 12.35 12.32S86.15 56.8 78.79 56.8h-8.06v12.82h-5.82V32.11zm-8.27 19.81h6.68c5.07 0 8-2.73 8-7.46S82.48 37 77.44 37h-6.71z\"/>\n      <path id=\"_Compound_Path_2\" data-name=\"&lt;Compound Path&gt;\" class=\"cls-1\" d=\"M92.76 61.85c0-4.81 3.67-7.56 10.42-8l7.25-.44v-2.06c0-3-2-4.7-5.56-4.7-2.94 0-5.07 1.51-5.51 3.82h-5.24c.16-4.86 4.73-8.4 10.92-8.4 6.65 0 11 3.48 11 8.89v18.66h-5.38v-4.5h-.13a9.59 9.59 0 0 1-8.58 4.78c-5.42 0-9.19-3.22-9.19-8.05zm17.68-2.42v-2.11l-6.47.42c-3.64.23-5.54 1.59-5.54 4s2 3.77 5.07 3.77c3.95-.05 6.94-2.57 6.94-6.08z\"/>\n      <path id=\"_Compound_Path_3\" data-name=\"&lt;Compound Path&gt;\" class=\"cls-1\" d=\"M121 79.65v-4.5a17.14 17.14 0 0 0 1.72.1c2.57 0 4-1.09 4.91-3.9l.52-1.66-9.88-27.29h6.08l6.86 22.15h.13l6.86-22.15h5.93l-10.21 28.67c-2.34 6.58-5 8.73-10.68 8.73a15.93 15.93 0 0 1-2.24-.15z\"/>\n      </g>\n      </g>\n    </symbol>\n    <symbol id=\"logoGooglePay\" viewBox=\"0 0 60.51 24.04\">\n      <title>GooglePay_AcceptanceMark_RGB_60x24pt</title>\n      <path d=\"M28.67,11.76v7H26.43V1.42h5.92a5.39,5.39,0,0,1,3.84,1.51A5,5,0,0,1,36.44,10l-.25.26a5.35,5.35,0,0,1-3.84,1.48Zm0-8.2V9.62H32.4a2.93,2.93,0,0,0,2.21-.9A3,3,0,0,0,32.4,3.56Z\" fill=\"#5f6368\"/>\n      <path d=\"M42.93,6.52a5.56,5.56,0,0,1,3.91,1.32,4.71,4.71,0,0,1,1.43,3.63v7.32H46.13V17.14H46a4.28,4.28,0,0,1-3.69,2A4.83,4.83,0,0,1,39.06,18a3.74,3.74,0,0,1-1.32-2.92,3.52,3.52,0,0,1,1.39-2.93,5.87,5.87,0,0,1,3.73-1.09,6.65,6.65,0,0,1,3.27.72v-.51a2.5,2.5,0,0,0-.92-2,3.17,3.17,0,0,0-2.16-.81,3.4,3.4,0,0,0-2.95,1.57l-2-1.23A5.45,5.45,0,0,1,42.93,6.52ZM40,15.15a1.82,1.82,0,0,0,.74,1.46,2.74,2.74,0,0,0,1.74.58,3.58,3.58,0,0,0,2.51-1,3.26,3.26,0,0,0,1.11-2.45,4.54,4.54,0,0,0-2.91-.83,3.74,3.74,0,0,0-2.27.66A2,2,0,0,0,40,15.15Z\" fill=\"#5f6368\"/>\n      <path d=\"M60.52,6.9,53.07,24H50.76l2.77-6L48.63,6.91h2.43l3.54,8.54h0l3.44-8.54Z\" fill=\"#5f6368\"/>\n      <path d=\"M19.65,10.24a12.54,12.54,0,0,0-.17-2H10.06v3.84h5.39a4.61,4.61,0,0,1-2,3v2.49h3.22A9.75,9.75,0,0,0,19.65,10.24Z\" fill=\"#4285f4\"/>\n      <path d=\"M10.06,20a9.54,9.54,0,0,0,6.62-2.41l-3.22-2.49a6,6,0,0,1-3.4.95,6,6,0,0,1-5.6-4.12H1.15V14.5A10,10,0,0,0,10.06,20Z\" fill=\"#34a853\"/>\n      <path d=\"M4.46,11.92a6,6,0,0,1,0-3.82V5.53H1.15a10,10,0,0,0,0,9Z\" fill=\"#fbbc04\"/>\n      <path d=\"M10.06,4a5.44,5.44,0,0,1,3.83,1.5h0l2.85-2.85A9.58,9.58,0,0,0,10.06,0a10,10,0,0,0-8.91,5.5L4.46,8.1A6,6,0,0,1,10.06,4Z\" fill=\"#ea4335\"/>\n    </symbol>\n\n    <symbol id=\"logoVenmo\" viewBox=\"0 0 48 32\">\n      <title>Venmo</title>\n      <g fill=\"none\" fill-rule=\"evenodd\">\n        <rect fill=\"#3D95CE\" width=\"47.4074074\" height=\"31.6049383\" rx=\"3.16049383\"/>\n        <path d=\"M33.1851852,10.1131555 C33.1851852,14.8373944 29.2425262,20.9745161 26.0425868,25.2839506 L18.7337285,25.2839506 L15.8024691,7.35534396 L22.202175,6.73384536 L23.7519727,19.4912014 C25.2000422,17.0781163 26.9870326,13.2859484 26.9870326,10.7005 C26.9870326,9.28531656 26.7500128,8.32139205 26.3796046,7.52770719 L32.207522,6.32098765 C32.8813847,7.45939896 33.1851852,8.63196439 33.1851852,10.1131555 Z\" fill=\"#FFF\"/>\n      </g>\n    </symbol>\n    <symbol id=\"buttonVenmo\" viewBox=\"0 0 295 42\">\n      <g fill=\"none\" fill-rule=\"evenodd\">\n        <rect fill=\"#3D95CE\" width=\"295\" height=\"42\" rx=\"3\"/>\n        <path d=\"M11.3250791 0C11.7902741.780434316 12 1.58428287 12 2.59970884 12 5.838396 9.27822123 10.0456806 7.06917212 13L2.02356829 13 0 .709099732 4.41797878.283033306 5.48786751 9.02879887C6.48752911 7.3745159 7.72116169 4.77480706 7.72116169 3.00236102 7.72116169 2.03218642 7.55753727 1.37137098 7.30182933.827262801L11.3250791 0 11.3250791 0zM17.5051689 5.68512193C18.333931 5.68512193 20.4203856 5.28483546 20.4203856 4.03281548 20.4203856 3.43161451 20.0177536 3.13172102 19.5432882 3.13172102 18.7131868 3.13172102 17.6238766 4.18269796 17.5051689 5.68512193L17.5051689 5.68512193zM17.4102028 8.1647385C17.4102028 9.69351403 18.2153451 10.293301 19.2827401 10.293301 20.4451012 10.293301 21.5580312 9.99340752 23.0045601 9.21725797L22.4597224 13.1234575C21.440541 13.649203 19.8521716 14 18.310433 14 14.3996547 14 13 11.49596 13 8.36552446 13 4.30815704 15.2767521 0 19.9706358 0 22.554932 0 24 1.52864698 24 3.65720949 24.0002435 7.08869546 19.8287953 8.13992948 17.4102028 8.1647385L17.4102028 8.1647385zM37 2.84753211C37 3.32189757 36.9261179 4.00994664 36.8526108 4.45959542L35.4649774 12.9998782 30.9621694 12.9998782 32.2279161 5.1711436C32.2519185 4.95879931 32.3256755 4.53131032 32.3256755 4.29412759 32.3256755 3.72466988 31.9603904 3.5825794 31.5212232 3.5825794 30.9379171 3.5825794 30.3532359 3.84326124 29.9638234 4.03356751L28.5281854 13 24 13 26.0686989.213683657 29.9878258.213683657 30.0374555 1.23425123C30.9620444.641294408 32.1795365 3.90379019e-8 33.9069526 3.90379019e-8 36.1955476-.000243475057 37 1.1387937 37 2.84753211L37 2.84753211zM51.2981937 1.39967969C52.6582977.49918987 53.9425913 0 55.7133897 0 58.1518468 0 59 1.13900518 59 2.84769558 59 3.32204771 58.9223438 4.01007745 58.8448195 4.4597136L57.3830637 12.9997565 52.6328518 12.9997565 53.9932194 5.00577861C54.0182698 4.792101 54.0708756 4.53142648 54.0708756 4.36608506 54.0708756 3.72493046 53.6854953 3.58272222 53.2224587 3.58272222 52.6325881 3.58272222 52.0429812 3.81989829 51.6052587 4.03369766L50.0914245 12.9998782 45.3423992 12.9998782 46.7027668 5.00590037C46.7278172 4.79222275 46.7788409 4.53154824 46.7788409 4.36620681 46.7788409 3.72505221 46.3933287 3.58284398 45.9318743 3.58284398 45.3153711 3.58284398 44.7000546 3.84351849 44.2893602 4.03381941L42.7740757 13 38 13 40.1814929.214042876 44.2643098.214042876 44.3925941 1.28145692C45.3423992.641763367 46.6253743.000487014507 48.3452809.000487014507 49.8344603 0 50.8094476.593061916 51.2981937 1.39967969L51.2981937 1.39967969zM67.5285327 5.39061542C67.5285327 4.29258876 67.2694573 3.54396333 66.4936812 3.54396333 64.7759775 3.54396333 64.4232531 6.76273249 64.4232531 8.4093242 64.4232531 9.65848482 64.7530184 10.4315735 65.5285529 10.4315735 67.1521242 10.4315735 67.5285327 7.03707905 67.5285327 5.39061542L67.5285327 5.39061542zM60 8.21054461C60 3.96893154 62.1170713 0 66.988027 0 70.6583423 0 72 2.29633967 72 5.46592624 72 9.65835674 69.905767 14 64.9173573 14 61.2233579 14 60 11.4294418 60 8.21054461L60 8.21054461z\" transform=\"translate(112 14)\" fill=\"#FFF\"/>\n      </g>\n    </symbol>\n\n    <symbol id=\"iconClose\" width=\"21\" height=\"21\" viewBox=\"0 0 21 21\" overflow=\"visible\">\n      <path d=\"M16 5.414L14.586 4 10 8.586 5.414 4 4 5.414 8.586 10 4 14.586 5.414 16 10 11.414 14.586 16 16 14.586 11.414 10\"/>\n    </symbol>\n  </defs>\n</svg>\n";

var UPDATABLE_CONFIGURATION_OPTIONS = [
  paymentOptionIDs.paypal,
  paymentOptionIDs.paypalCredit,
  paymentOptionIDs.applePay,
  paymentOptionIDs.googlePay,
  'threeDSecure'
];
var UPDATABLE_CONFIGURATION_OPTIONS_THAT_REQUIRE_UNVAULTED_PAYMENT_METHODS_TO_BE_REMOVED = [
  paymentOptionIDs.paypal,
  paymentOptionIDs.paypalCredit,
  paymentOptionIDs.applePay,
  paymentOptionIDs.googlePay
];
var VERSION = "1.13.0";

/**
 * @typedef {object} Dropin~cardPaymentMethodPayload
 * @property {string} nonce The payment method nonce, used by your server to charge the card.
 * @property {object} details Additional account details.
 * @property {string} details.cardType Type of card, e.g. Visa, Mastercard.
 * @property {string} details.lastTwo Last two digits of card number.
 * @property {string} description A human-readable description.
 * @property {string} type The payment method type, always `CreditCard` when the method requested is a card.
 * @property {object} binData Information about the card based on the bin. Documented {@link Dropin~binData|here}.
 * @property {?string} deviceData If data collector is configured, the device data property to be used when making a transaction.
 * @property {?boolean} liablityShifted If 3D Secure is configured, whether or not liability did shift.
 * @property {?boolean} liablityShiftPossible If 3D Secure is configured, whether or not liability shift is possible.
 */

/**
 * @typedef {object} Dropin~paypalPaymentMethodPayload
 * @property {string} nonce The payment method nonce, used by your server to charge the PayPal account.
 * @property {object} details Additional PayPal account details. See a full list of details in the [PayPal client reference](http://braintree.github.io/braintree-web/{@pkg bt-web-version}/PayPalCheckout.html#~tokenizePayload).
 * @property {string} type The payment method type, always `PayPalAccount` when the method requested is a PayPal account.
 * @property {?string} deviceData If data collector is configured, the device data property to be used when making a transaction.
 */

/**
 * @typedef {object} Dropin~applePayPaymentMethodPayload
 * @property {string} nonce The payment method nonce, used by your server to charge the Apple Pay provided card.
 * @property {string} details.cardType Type of card, ex: Visa, Mastercard.
 * @property {string} details.cardHolderName The name of the card holder.
 * @property {string} details.dpanLastTwo Last two digits of card number.
 * @property {string} description A human-readable description.
 * @property {string} type The payment method type, always `ApplePayCard` when the method requested is an Apple Pay provided card.
 * @property {object} binData Information about the card based on the bin. Documented {@link Dropin~binData|here}.
 * @property {?string} deviceData If data collector is configured, the device data property to be used when making a transaction.
 */

/**
 * @typedef {object} Dropin~venmoPaymentMethodPayload
 * @property {string} nonce The payment method nonce, used by your server to charge the Venmo account.
 * @property {string} details.username The Venmo username.
 * @property {string} type The payment method type, always `VenmoAccount` when the method requested is a Venmo account.
 * @property {?string} deviceData If data collector is configured, the device data property to be used when making a transaction.
 */

/**
 * @typedef {object} Dropin~googlePayPaymentMethodPayload
 * @property {string} nonce The payment method nonce, used by your server to charge the Google Pay card.
 * @property {string} details.cardType Type of card, ex: Visa, Mastercard.
 * @property {string} details.lastFour The last 4 digits of the card.
 * @property {string} details.lastTwo The last 2 digits of the card.
 * @param {external:GooglePayPaymentData} details.rawPaymentData The raw response back from the Google Pay flow, which includes shipping address, phone and email if passed in as required parameters.
 * @property {string} type The payment method type, always `AndroidPayCard` when the method requested is a Google Pay Card.
 * @property {object} binData Information about the card based on the bin. Documented {@link Dropin~binData|here}.
 * @property {?string} deviceData If data collector is configured, the device data property to be used when making a transaction.
 */

/**
 * @typedef {object} GooglePayPaymentData A [Google Pay Payment Data object](https://developers.google.com/pay/api/web/object-reference#PaymentData).
 * @external GooglePayPaymentData
 * @see {@link https://developers.google.com/pay/api/web/object-reference#PaymentData PaymentData}
 */

/**
 * @typedef {object} Dropin~binData Information about the card based on the bin.
 * @property {string} commercial Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} countryOfIssuance The country of issuance.
 * @property {string} debit Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} durbinRegulated Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} healthcare Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} issuingBank The issuing bank.
 * @property {string} payroll Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} prepaid Possible values: 'Yes', 'No', 'Unknown'.
 * @property {string} productId The product id.
 */

/**
 * @name Dropin#on
 * @function
 * @param {string} event The name of the event to which you are subscribing.
 * @param {function} handler A callback to handle the event.
 * @description Subscribes a handler function to a named event. `event` should be one of the following:
 *  * [`paymentMethodRequestable`](#event:paymentMethodRequestable)
 *  * [`noPaymentMethodRequestable`](#event:noPaymentMethodRequestable)
 *  * [`paymentOptionSelected`](#event:paymentOptionSelected)
 * @returns {void}
 * @example
 * <caption>Dynamically enable or disable your submit button based on whether or not the payment method is requestable</caption>
 * var submitButton = document.querySelector('#submit-button');
 *
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container'
 * }, function (err, dropinInstance) {
 *   submitButton.addEventListener('click', function () {
 *     dropinInstance.requestPaymentMethod(function (err, payload) {
 *       // Send payload.nonce to your server.
 *     });
 *   });
 *
 *   if (dropinInstance.isPaymentMethodRequestable()) {
 *     // This will be true if you generated the client token
 *     // with a customer ID and there is a saved payment method
 *     // available to tokenize with that customer.
 *     submitButton.removeAttribute('disabled');
 *   }
 *
 *   dropinInstance.on('paymentMethodRequestable', function (event) {
 *     console.log(event.type); // The type of Payment Method, e.g 'CreditCard', 'PayPalAccount'.
 *     console.log(event.paymentMethodIsSelected); // true if a customer has selected a payment method when paymentMethodRequestable fires
 *
 *     submitButton.removeAttribute('disabled');
 *   });
 *
 *   dropinInstance.on('noPaymentMethodRequestable', function () {
 *     submitButton.setAttribute('disabled', true);
 *   });
 * });
 * @example
 * <caption>Automatically submit nonce to server as soon as it becomes available</caption>
 * var submitButton = document.querySelector('#submit-button');
 *
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container'
 * }, function (err, dropinInstance) {
 *   function sendNonceToServer() {
 *     dropinInstance.requestPaymentMethod(function (err, payload) {
 *       if (err) {
 *         // handle errors
 *       }
 *
 *       // send payload.nonce to your server
 *     });
 *   }
 *
 *   // allows us to still request the payment method manually, such as
 *   // when filling out a credit card form
 *   submitButton.addEventListener('click', sendNonceToServer);
 *
 *   dropinInstance.on('paymentMethodRequestable', function (event) {
 *     // if the nonce is already available (via PayPal authentication
 *     // or by using a stored payment method), we can request the
 *     // nonce right away. Otherwise, we wait for the customer to
 *     // request the nonce by pressing the submit button once they
 *     // are finished entering their credit card details
 *     if (event.paymentMethodIsSelected) {
 *       sendNonceToServer();
 *     }
 *   });
 * });
 */

/**
 * This event is emitted when the payment method available in Drop-in changes. This includes when the state of Drop-in transitions from having no payment method available to having a payment method available and when the payment method available changes. This event is not fired if there is no payment method available on initialization. To check if there is a payment method requestable on initialization, use {@link Dropin#isPaymentMethodRequestable|`isPaymentMethodRequestable`}.
 * @event Dropin#paymentMethodRequestable
 * @type {Dropin~paymentMethodRequestablePayload}
 */

/**
 * @typedef {object} Dropin~paymentMethodRequestablePayload
 * @description The event payload sent from {@link Dropin#on|`on`} with the {@link Dropin#event:paymentMethodRequestable|`paymentMethodRequestable`} event.
 * @property {string} type The type of payment method that is requestable. Either `CreditCard` or `PayPalAccount`.
 * @property {boolean} paymentMethodIsSelected A property to determine if a payment method is currently selected when the payment method becomes requestable.
 *
 * This will be `true` any time a payment method is visably selected in the Drop-in UI, such as when PayPal authentication completes or a stored payment method is selected.
 *
 * This will be `false` when {@link Dropin#requestPaymentMethod|`requestPaymentMethod`} can be called, but a payment method is not currently selected. For instance, when a card form has been filled in with valid values, but has not been submitted to be converted into a payment method nonce.
 */

/**
 * This event is emitted when there is no payment method available in Drop-in. This event is not fired if there is no payment method available on initialization. To check if there is a payment method requestable on initialization, use {@link Dropin#isPaymentMethodRequestable|`isPaymentMethodRequestable`}. No payload is available in the callback for this event.
 * @event Dropin#noPaymentMethodRequestable
 */

/**
 * This event is emitted when the customer selects a new payment option type (e.g. PayPal, PayPal Credit, credit card). This event is not emitted when the user changes between existing saved payment methods. Only relevant when accepting multiple payment options.
 * @event Dropin#paymentOptionSelected
 * @type {Dropin~paymentOptionSelectedPayload}
 */

/**
 * @typedef {object} Dropin~paymentOptionSelectedPayload
 * @description The event payload sent from {@link Dropin#on|`on`} with the {@link Dropin#event:paymentOptionSelected|`paymentOptionSelected`} event.
 * @property {string} paymentOption The payment option view selected. Either `card`, `paypal`, or `paypalCredit`.
 */

/**
 * @class
 * @param {object} options For create options, see {@link module:braintree-web-drop-in|dropin.create}.
 * @description <strong>Do not use this constructor directly. Use {@link module:braintree-web-drop-in|dropin.create} instead.</strong>
 * @classdesc This class represents a Drop-in component, that will create a pre-made UI for accepting cards and PayPal on your page. Instances of this class have methods for requesting a payment method and subscribing to events. For more information, see the [Drop-in guide](https://developers.braintreepayments.com/guides/drop-in/javascript/v3) in the Braintree Developer Docs. To be used in conjunction with the [Braintree Server SDKs](https://developers.braintreepayments.com/start/hello-server/).
 */
function Dropin(options) {
  this._client = options.client;
  this._componentID = uuid();
  this._dropinWrapper = document.createElement('div');
  this._dropinWrapper.id = 'braintree--dropin__' + this._componentID;
  this._dropinWrapper.setAttribute('data-braintree-id', 'wrapper');
  this._dropinWrapper.style.display = 'none';
  this._dropinWrapper.className = 'braintree-loading';
  this._merchantConfiguration = options.merchantConfiguration;

  EventEmitter.call(this);
}

Dropin.prototype = Object.create(EventEmitter.prototype, {
  constructor: Dropin
});

Dropin.prototype._initialize = function (callback) {
  var localizedStrings, localizedHTML;
  var self = this;
  var container = self._merchantConfiguration.container || self._merchantConfiguration.selector;

  self._injectStylesheet();

  if (!container) {
    analytics.sendEvent(self._client, 'configuration-error');
    callback(new DropinError('options.container is required.'));

    return;
  } else if (self._merchantConfiguration.container && self._merchantConfiguration.selector) {
    analytics.sendEvent(self._client, 'configuration-error');
    callback(new DropinError('Must only have one options.selector or options.container.'));

    return;
  }

  if (typeof container === 'string') {
    container = document.querySelector(container);
  }

  if (!container || container.nodeType !== 1) {
    analytics.sendEvent(self._client, 'configuration-error');
    callback(new DropinError('options.selector or options.container must reference a valid DOM node.'));

    return;
  }

  if (container.innerHTML.trim()) {
    analytics.sendEvent(self._client, 'configuration-error');
    callback(new DropinError('options.selector or options.container must reference an empty DOM node.'));

    return;
  }

  // Backfill with `en`
  self._strings = assign({}, translations.en);
  if (self._merchantConfiguration.locale) {
    localizedStrings = translations[self._merchantConfiguration.locale] || translations[self._merchantConfiguration.locale.split('_')[0]];
    // Fill `strings` with `localizedStrings` that may exist
    self._strings = assign(self._strings, localizedStrings);
  }

  if (!isUtf8()) {
    // non-utf-8 encodings often don't support the bullet character
    self._strings.endingIn = self._strings.endingIn.replace(/•/g, '*');
  }

  if (self._merchantConfiguration.translations) {
    Object.keys(self._merchantConfiguration.translations).forEach(function (key) {
      self._strings[key] = sanitizeHtml(self._merchantConfiguration.translations[key]);
    });
  }

  localizedHTML = Object.keys(self._strings).reduce(function (result, stringKey) {
    var stringValue = self._strings[stringKey];

    return result.replace(RegExp('{{' + stringKey + '}}', 'g'), stringValue);
  }, mainHTML);

  self._dropinWrapper.innerHTML = svgHTML + localizedHTML;
  container.appendChild(self._dropinWrapper);

  self._model = new DropinModel({
    client: self._client,
    componentID: self._componentID,
    merchantConfiguration: self._merchantConfiguration
  });

  self._model.initialize().then(function () {
    self._model.on('cancelInitialization', function (err) {
      self._dropinWrapper.innerHTML = '';
      analytics.sendEvent(self._client, 'load-error');
      callback(err);
    });

    self._model.on('asyncDependenciesReady', function () {
      if (self._model.dependencySuccessCount >= 1) {
        analytics.sendEvent(self._client, 'appeared');
        self._disableErroredPaymentMethods();

        self._handleAppSwitch();

        callback(null, self);
      } else {
        self._model.cancelInitialization(new DropinError('All payment options failed to load.'));
      }
    });

    self._model.on('paymentMethodRequestable', function (event) {
      self._emit('paymentMethodRequestable', event);
    });

    self._model.on('noPaymentMethodRequestable', function () {
      self._emit('noPaymentMethodRequestable');
    });

    self._model.on('paymentOptionSelected', function (event) {
      self._emit('paymentOptionSelected', event);
    });

    return self._setUpDependenciesAndViews();
  }).catch(function (err) {
    self.teardown().then(function () {
      callback(err);
    });
  });
};

/**
 * Modify your configuration intially set in {@link module:braintree-web-drop-in|`dropin.create`}.
 *
 * If `updateConfiguration` is called after a user completes the PayPal authorization flow, any PayPal accounts not stored in the Vault record will be removed.
 * @public
 * @param {string} property The top-level property to update. Either `paypal`, `paypalCredit`, `applePay`, or `googlePay`.
 * @param {string} key The key of the property to update, such as `amount` or `currency`.
 * @param {any} value The value of the property to update. Must be the type of the property specified in {@link module:braintree-web-drop-in|`dropin.create`}.
 * @returns {void}
 * @example
 * dropinInstance.updateConfiguration('paypal', 'amount', '10.00');
 */
Dropin.prototype.updateConfiguration = function (property, key, value) {
  var view;

  if (UPDATABLE_CONFIGURATION_OPTIONS.indexOf(property) === -1) {
    return;
  }

  if (property === 'threeDSecure') {
    if (this._threeDSecure) {
      this._threeDSecure.updateConfiguration(key, value);
    }

    return;
  }

  view = this._mainView.getView(property);

  if (!view) {
    return;
  }

  view.updateConfiguration(key, value);

  if (UPDATABLE_CONFIGURATION_OPTIONS_THAT_REQUIRE_UNVAULTED_PAYMENT_METHODS_TO_BE_REMOVED.indexOf(property) === -1) {
    return;
  }

  this._removeUnvaultedPaymentMethods(function (paymentMethod) {
    return paymentMethod.type === constants.paymentMethodTypes[property];
  });
  this._navigateToInitialView();
};

/**
 * Removes the currently selected payment method and returns the customer to the payment options view. Does not remove vaulted payment methods.
 * @public
 * @returns {void}
 * @example
 * dropinInstance.requestPaymentMethod(function (requestPaymentMethodError, payload) {
 *   if (requestPaymentMethodError) {
 *     // handle errors
 *     return;
 *   }
 *
 *   functionToSendNonceToServer(payload.nonce, function (transactionError, response) {
 *     if (transactionError) {
 *       // transaction sale with selected payment method failed
 *       // clear the selected payment method and add a message
 *       // to the checkout page about the failure
 *       dropinInstance.clearSelectedPaymentMethod();
 *       divForErrorMessages.textContent = 'my error message about entering a different payment method.';
 *     } else {
 *       // redirect to success page
 *     }
 *   });
 * });
 */
Dropin.prototype.clearSelectedPaymentMethod = function () {
  this._removeUnvaultedPaymentMethods();
  this._model.removeActivePaymentMethod();

  if (this._model.getPaymentMethods().length === 0) {
    this._navigateToInitialView();

    return;
  }

  this._mainView.showLoadingIndicator();

  this._model.refreshPaymentMethods().then(function () {
    this._navigateToInitialView();
    this._mainView.hideLoadingIndicator();
  }.bind(this));
};

Dropin.prototype._setUpDataCollector = function () {
  var self = this;
  var config = assign({}, self._merchantConfiguration.dataCollector, {client: self._client});

  this._model.asyncDependencyStarting();
  this._dataCollector = new DataCollector(config);

  this._dataCollector.initialize().then(function () {
    self._model.asyncDependencyReady();
  }).catch(function (err) {
    self._model.cancelInitialization(new DropinError({
      message: 'Data Collector failed to set up.',
      braintreeWebError: err
    }));
  });
};

Dropin.prototype._setUpThreeDSecure = function () {
  var self = this;
  var config = assign({}, this._merchantConfiguration.threeDSecure);

  this._model.asyncDependencyStarting();

  this._threeDSecure = new ThreeDSecure(this._client, config, this._strings.cardVerification);

  this._threeDSecure.initialize().then(function () {
    self._model.asyncDependencyReady();
  }).catch(function (err) {
    self._model.cancelInitialization(new DropinError({
      message: '3D Secure failed to set up.',
      braintreeWebError: err
    }));
  });
};

Dropin.prototype._setUpDependenciesAndViews = function () {
  if (this._merchantConfiguration.dataCollector) {
    this._setUpDataCollector();
  }

  if (this._merchantConfiguration.threeDSecure) {
    this._setUpThreeDSecure();
  }

  this._mainView = new MainView({
    client: this._client,
    element: this._dropinWrapper,
    model: this._model,
    strings: this._strings
  });
};

Dropin.prototype._removeUnvaultedPaymentMethods = function (filter) {
  filter = filter || function () { return true; };

  this._model.getPaymentMethods().forEach(function (paymentMethod) {
    if (filter(paymentMethod) && !paymentMethod.vaulted) {
      this._model.removePaymentMethod(paymentMethod);
    }
  }.bind(this));
};

Dropin.prototype._navigateToInitialView = function () {
  var hasNoSavedPaymentMethods, hasOnlyOneSupportedPaymentOption;
  var isOnMethodsView = this._mainView.primaryView.ID === paymentMethodsViewID;

  if (isOnMethodsView) {
    hasNoSavedPaymentMethods = this._model.getPaymentMethods().length === 0;

    if (hasNoSavedPaymentMethods) {
      hasOnlyOneSupportedPaymentOption = this._model.supportedPaymentOptions.length === 1;

      if (hasOnlyOneSupportedPaymentOption) {
        this._mainView.setPrimaryView(this._model.supportedPaymentOptions[0]);
      } else {
        this._mainView.setPrimaryView(paymentOptionsViewID);
      }
    }
  }
};

Dropin.prototype._supportsPaymentOption = function (paymentOption) {
  return this._model.supportedPaymentOptions.indexOf(paymentOption) !== -1;
};

Dropin.prototype._disableErroredPaymentMethods = function () {
  var paymentMethodOptionsElements;
  var failedDependencies = Object.keys(this._model.failedDependencies);

  if (failedDependencies.length === 0) {
    return;
  }

  paymentMethodOptionsElements = this._mainView.getOptionsElements();

  failedDependencies.forEach(function (paymentMethodId) {
    var element = paymentMethodOptionsElements[paymentMethodId];
    var div = element.div;
    var clickHandler = element.clickHandler;
    var error = this._model.failedDependencies[paymentMethodId];
    var errorMessageDiv = div.querySelector('.braintree-option__disabled-message');

    classlist.add(div, 'braintree-disabled');
    div.removeEventListener('click', clickHandler);
    errorMessageDiv.innerHTML = constants.errors.DEVELOPER_MISCONFIGURATION_MESSAGE;
    console.error(error); // eslint-disable-line no-console
  }.bind(this));
};

Dropin.prototype._handleAppSwitch = function () {
  if (this._model.appSwitchError) {
    this._mainView.setPrimaryView(this._model.appSwitchError.id);
    this._model.reportError(this._model.appSwitchError.error);
  } else if (this._model.appSwitchPayload) {
    this._model.addPaymentMethod(this._model.appSwitchPayload);
  }
};

/**
 * Requests a payment method object which includes the payment method nonce used by by the [Braintree Server SDKs](https://developers.braintreepayments.com/start/hello-server/).
 *
 * If a payment method is not available, an error will appear in the UI. When a callback is used, an error will be passed to it. If no callback is used, the returned Promise will be rejected with an error.
 * @public
 * @param {callback} [callback] The first argument will be an error if no payment method is available and will otherwise be null. The second argument will be an object containing a payment method nonce; either a {@link Dropin~cardPaymentMethodPayload|cardPaymentMethodPayload}, a {@link Dropin~paypalPaymentMethodPayload|paypalPaymentMethodPayload}, a {@link Dropin~venmoPaymentMethodPayload|venmoPaymentMethodPayload}, a {@link Dropin~googlePayPaymentMethodPayload|googlePayPaymentMethodPayload} or an {@link Dropin~applePayPaymentMethodPayload|applePayPaymentMethodPayload}. If no callback is provided, `requestPaymentMethod` will return a promise.
 * @returns {void|Promise} Returns a promise if no callback is provided.
 * @example <caption>Requesting a payment method</caption>
 * var form = document.querySelector('#my-form');
 * var hiddenNonceInput = document.querySelector('#my-nonce-input');
 *
 * form.addEventListener('submit', function (event) {
 *  event.preventDefault();
 *
 *  dropinInstance.requestPaymentMethod(function (err, payload) {
 *    if (err) {
 *      // handle error
 *      return;
 *    }
 *    hiddenNonceInput.value = payload.nonce;
 *    form.submit();
 *  });
 * });
 * @example <caption>Requesting a payment method with data collector</caption>
 * var form = document.querySelector('#my-form');
 * var hiddenNonceInput = document.querySelector('#my-nonce-input');
 * var hiddenDeviceDataInput = document.querySelector('#my-device-data-input');
 *
 * form.addEventListener('submit', function (event) {
 *  event.preventDefault();
 *
 *  dropinInstance.requestPaymentMethod(function (err, payload) {
 *    if (err) {
 *      // handle error
 *      return;
 *    }
 *    hiddenNonceInput.value = payload.nonce;
 *    hiddenDeviceDataInput.value = payload.deviceData;
 *    form.submit();
 *  });
 * });
 *
 * @example <caption>Requesting a payment method with 3D Secure</caption>
 * var form = document.querySelector('#my-form');
 * var hiddenNonceInput = document.querySelector('#my-nonce-input');
 *
 * form.addEventListener('submit', function (event) {
 *  event.preventDefault();
 *
 *  dropinInstance.requestPaymentMethod(function (err, payload) {
 *    if (err) {
 *      // Handle error
 *      return;
 *    }
 *
 *    if (payload.liabilityShifted || payload.type !== 'CreditCard') {
 *      hiddenNonceInput.value = payload.nonce;
 *      form.submit();
 *    } else {
 *      // Decide if you will force the user to enter a different payment method
 *      // if liablity was not shifted
 *      dropinInstance.clearSelectedPaymentMethod();
 *    }
 *  });
 * });
 */
Dropin.prototype.requestPaymentMethod = function () {
  return this._mainView.requestPaymentMethod().then(function (payload) {
    if (this._threeDSecure && payload.type === constants.paymentMethodTypes.card && payload.liabilityShifted == null) {
      return this._threeDSecure.verify(payload.nonce).then(function (newPayload) {
        payload.nonce = newPayload.nonce;
        payload.liabilityShifted = newPayload.liabilityShifted;
        payload.liabilityShiftPossible = newPayload.liabilityShiftPossible;

        return payload;
      });
    }

    return payload;
  }.bind(this)).then(function (payload) {
    if (this._dataCollector) {
      payload.deviceData = this._dataCollector.getDeviceData();
    }

    return payload;
  }.bind(this)).then(function (payload) {
    return formatPaymentMethodPayload(payload);
  });
};

Dropin.prototype._removeStylesheet = function () {
  var stylesheet = document.getElementById(constants.STYLESHEET_ID);

  if (stylesheet) {
    stylesheet.parentNode.removeChild(stylesheet);
  }
};

Dropin.prototype._injectStylesheet = function () {
  var stylesheetUrl, assetsUrl;

  if (document.getElementById(constants.STYLESHEET_ID)) { return; }

  assetsUrl = this._client.getConfiguration().gatewayConfiguration.assetsUrl;
  stylesheetUrl = assetsUrl + '/web/dropin/' + VERSION + '/css/dropin.css';

  assets.loadStylesheet({
    href: stylesheetUrl,
    id: constants.STYLESHEET_ID
  });
};

/**
 * Cleanly remove anything set up by {@link module:braintree-web-drop-in|dropin.create}. This may be be useful in a single-page app.
 * @public
 * @param {callback} [callback] Called on completion, containing an error if one occurred. No data is returned if teardown completes successfully. If no callback is provided, `teardown` will return a promise.
 * @returns {void|Promise} Returns a promise if no callback is provided.
 */
Dropin.prototype.teardown = function () {
  var teardownError;
  var promise = Promise.resolve();
  var self = this;

  this._removeStylesheet();

  if (this._mainView) {
    promise.then(function () {
      return self._mainView.teardown().catch(function (err) {
        teardownError = err;
      });
    });
  }

  if (this._dataCollector) {
    promise.then(function () {
      return this._dataCollector.teardown().catch(function (error) {
        teardownError = new DropinError({
          message: 'Drop-in errored tearing down Data Collector.',
          braintreeWebError: error
        });
      });
    }.bind(this));
  }

  if (this._threeDSecure) {
    promise.then(function () {
      return this._threeDSecure.teardown().catch(function (error) {
        teardownError = new DropinError({
          message: 'Drop-in errored tearing down 3D Secure.',
          braintreeWebError: error
        });
      });
    }.bind(this));
  }

  return promise.then(function () {
    return self._removeDropinWrapper();
  }).then(function () {
    if (teardownError) {
      return Promise.reject(teardownError);
    }

    return Promise.resolve();
  });
};

/**
 * Returns a boolean indicating if a payment method is available through {@link Dropin#requestPaymentMethod|requestPaymentMethod}. Particularly useful for detecting if using a client token with a customer ID to show vaulted payment methods.
 * @public
 * @returns {Boolean} True if a payment method is available, otherwise false.
 */
Dropin.prototype.isPaymentMethodRequestable = function () {
  return this._model.isPaymentMethodRequestable();
};

Dropin.prototype._removeDropinWrapper = function () {
  this._dropinWrapper.parentNode.removeChild(this._dropinWrapper);

  return Promise.resolve();
};

function formatPaymentMethodPayload(paymentMethod) {
  var formattedPaymentMethod = {
    nonce: paymentMethod.nonce,
    details: paymentMethod.details,
    type: paymentMethod.type
  };

  if (paymentMethod.vaulted != null) {
    formattedPaymentMethod.vaulted = paymentMethod.vaulted;
  }

  if (paymentMethod.type === constants.paymentMethodTypes.card) {
    formattedPaymentMethod.description = paymentMethod.description;
  }

  if (paymentMethod.type === constants.paymentMethodTypes.googlePay) {
    formattedPaymentMethod.details.rawPaymentData = paymentMethod.rawPaymentData;
  }

  if (typeof paymentMethod.liabilityShiftPossible === 'boolean') {
    formattedPaymentMethod.liabilityShifted = paymentMethod.liabilityShifted;
    formattedPaymentMethod.liabilityShiftPossible = paymentMethod.liabilityShiftPossible;
  }

  if (paymentMethod.deviceData) {
    formattedPaymentMethod.deviceData = paymentMethod.deviceData;
  }

  if (paymentMethod.binData) {
    formattedPaymentMethod.binData = paymentMethod.binData;
  }

  return formattedPaymentMethod;
}

module.exports = wrapPrototype(Dropin);

},{"./constants":117,"./dropin-model":118,"./lib/analytics":122,"./lib/assets":123,"./lib/assign":124,"./lib/classlist":126,"./lib/data-collector":128,"./lib/dropin-error":129,"./lib/event-emitter":130,"./lib/is-utf-8":134,"./lib/promise":137,"./lib/sanitize-html":138,"./lib/three-d-secure":140,"./lib/uuid":142,"./translations":152,"./views/main-view":169,"./views/payment-methods-view":171,"./views/payment-options-view":172,"@braintree/wrap-promise":21}],120:[function(require,module,exports){
'use strict';
/**
 * @module braintree-web-drop-in
 * @description There are two ways to integrate Drop-in into your page: a script tag integration and a JavaScript integration using [`dropin.create`](#.create).
 *
 * The script tag integration is the fastest way to integrate. All you need to do is add the Drop-in script inside your form element where you want Drop-in to appear and include a `data-braintree-dropin-authorization` property with your [tokenization key](https://developers.braintreepayments.com/guides/authorization/tokenization-key/javascript/v3) or [client token](https://developers.braintreepayments.com/guides/authorization/client-token).
 *
 * When your form is submitted, Drop-in will intercept the form submission and attempt to tokenize the payment method. If the tokenization is successful, it will insert the payment method nonce into a hidden input with the name `payment_method_nonce` and then submit your form. If the tokenization is unsuccessful, a relevant error will be shown in the UI.
 *
 * If you have data collector enabled, the device data will be injected into a hidden input with the name `device_data` before form submission.
 *
 * Specify creation options as data attributes in your script tag, as shown in the examples below. The following configuration properties may be set:
 *
 * * `data-locale`
 * * `data-card.cardholder-name.required`
 * * `data-payment-option-priority`
 * * `data-data-collector.kount`
 * * `data-data-collector.paypal`
 * * `data-paypal.amount`
 * * `data-paypal.currency`
 * * `data-paypal.flow`
 * * `data-paypal-credit.amount`
 * * `data-paypal-credit.currency`
 * * `data-paypal-credit.flow`
 *
 * For more control and customization, use [`dropin.create` instead](#.create).
 *
 * See our [demo app](../../script-tag-integration.html) for an example of using our script tag integration.
 *
 * @example
 * <caption>A full example accepting only cards</caption>
 * <!DOCTYPE html>
 * <html lang="en">
 *   <head>
 *     <meta charset="UTF-8">
 *     <title>Checkout</title>
 *   </head>
 *   <body>
 *     <form id="payment-form" action="/" method="post">
 *       <script src="https://js.braintreegateway.com/web/dropin/{@pkg version}/js/dropin.min.js"
 *        data-braintree-dropin-authorization="CLIENT_AUTHORIZATION"
 *       ></script>
 *       <input type="submit" value="Purchase"></input>
 *     </form>
 *   </body>
 * </html>
 *
 * @example
 * <caption>A full example accepting cards, PayPal, and PayPal credit</caption>
 * <!DOCTYPE html>
 * <html lang="en">
 *   <head>
 *     <meta charset="UTF-8">
 *     <title>Checkout</title>
 *   </head>
 *   <body>
 *     <form id="payment-form" action="/" method="post">
 *       <script src="https://js.braintreegateway.com/web/dropin/{@pkg version}/js/dropin.min.js"
 *        data-braintree-dropin-authorization="CLIENT_AUTHORIZATION"
 *        data-paypal.flow="checkout"
 *        data-paypal.amount="10.00"
 *        data-paypal.currency="USD"
 *        data-paypal-credit.flow="vault"
 *       ></script>
 *       <input type="submit" value="Purchase"></input>
 *     </form>
 *   </body>
 * </html>
 *
 * @example
 * <caption>Specifying a locale and payment option priority</caption>
 * <form id="payment-form" action="/" method="post">
 *   <script src="https://js.braintreegateway.com/web/dropin/{@pkg version}/js/dropin.min.js"
 *    data-braintree-dropin-authorization="CLIENT_AUTHORIZATION"
 *    data-locale="de_DE"
 *    data-payment-option-priority='["paypal","card", "paypalCredit"]'
 *    data-paypal.flow="checkout"
 *    data-paypal.amount="10.00"
 *    data-paypal.currency="USD"
 *    data-paypal-credit.flow="vault"
 *   ></script>
 *   <input type="submit" value="Purchase"></input>
 * </form>
 *
 * @example
 * <caption>Including an optional cardholder name field in card form</caption>
 * <form id="payment-form" action="/" method="post">
 *   <script src="https://js.braintreegateway.com/web/dropin/{@pkg version}/js/dropin.min.js"
 *    data-braintree-dropin-authorization="CLIENT_AUTHORIZATION"
 *    data-card.cardholder-name.required="false"
 *   ></script>
 *   <input type="submit" value="Purchase"></input>
 * </form>
 *
 * @example
 * <caption>Including a required cardholder name field in card form</caption>
 * <form id="payment-form" action="/" method="post">
 *   <script src="https://js.braintreegateway.com/web/dropin/{@pkg version}/js/dropin.min.js"
 *    data-braintree-dropin-authorization="CLIENT_AUTHORIZATION"
 *    data-card.cardholder-name.required="true"
 *   ></script>
 *   <input type="submit" value="Purchase"></input>
 * </form>
 */

var Dropin = require('./dropin');
var client = require('braintree-web/client');
var createFromScriptTag = require('./lib/create-from-script-tag');
var constants = require('./constants');
var analytics = require('./lib/analytics');
var DropinError = require('./lib/dropin-error');
var Promise = require('./lib/promise');
var wrapPromise = require('@braintree/wrap-promise');

var VERSION = "1.13.0";

/**
 * @typedef {object} cardCreateOptions The configuration options for cards. Internally, Drop-in uses [Hosted Fields](http://braintree.github.io/braintree-web/{@pkg bt-web-version}/module-braintree-web_hosted-fields.html) to render the card form. The `overrides.fields` and `overrides.styles` allow the Hosted Fields to be customized.
 *
 * @param {boolean|object} [cardholderName] Will enable a cardholder name field above the card number field. If set to an object, you can specify whether or not the field is required. If set to a `true`, it will default the field to being present, but not required.
 * @param {boolean} [cardholderName.required=false] When true, the cardholder name field will be required to request the payment method nonce.
 * @param {object} [overrides.fields] The Hosted Fields [`fields` options](http://braintree.github.io/braintree-web/{@pkg bt-web-version}/module-braintree-web_hosted-fields.html#~fieldOptions). Only `number`, `cvv`, `expirationDate` and `postalCode` can be configured. Each is a [Hosted Fields `field` object](http://braintree.github.io/braintree-web/{@pkg bt-web-version}/module-braintree-web_hosted-fields.html#~field). `selector` cannot be modified.
 * @param {object} [overrides.styles] The Hosted Fields [`styles` options](http://braintree.github.io/braintree-web/{@pkg bt-web-version}/module-braintree-web_hosted-fields.html#~styleOptions).
 * @param {boolean} [clearFieldsAfterTokenization=true] When false, the card form will not clear the card data when the customer returns to the card view after a succesful tokenization.
 */

/**
 * @typedef {object} dataCollectorOptions The configuration options for Data Collector. Requires [advanced fraud protection](https://developers.braintreepayments.com/guides/advanced-fraud-tools/client-side/javascript/v3) to be enabled in the Braintree gateway. Contact our [support team](https://developers.braintreepayments.com/forms/contact) to configure your Kount ID. The device data will be included on the {@link Dropin#requestPaymentMethod|requestPaymentMethod payload}.
 *
 * @param {boolean} [kount] If true, Kount fraud data collection is enabled. Required if `paypal` parameter is not used.
 * @param {boolean} [paypal] If true, PayPal fraud data collection is enabled. Required if `kount` parameter is not used.
 */

/**
 * @typedef {object} threeDSecureOptions The configuration options for 3D Secure. Requires [3D Secure](https://developers.braintreepayments.com/guides/3d-secure/overview) to be enabled in the Braintree gateway. The liability shift information will be included on the {@link Dropin#requestPaymentMethod|requestPaymentMethod payload}.
 *
 * @param {string} amount The amount to verify with 3D Secure.
 */

/** @typedef {object} paypalCreateOptions The configuration options for PayPal and PayPalCredit. For a full list of options see the [PayPal Checkout client reference options](http://braintree.github.io/braintree-web/{@pkg bt-web-version}/PayPalCheckout.html#createPayment).
 *
 * @param {string} flow Either `checkout` for a one-time [Checkout with PayPal](https://developers.braintreepayments.com/guides/paypal/checkout-with-paypal/javascript/v3) flow or `vault` for a [Vault flow](https://developers.braintreepayments.com/guides/paypal/vault/javascript/v3). Required when using PayPal or PayPal Credit.
 * @param {string|number} [amount] The amount of the transaction. Required when using the Checkout flow.
 * @param {string} [currency] The currency code of the amount, such as `USD`. Required when using the Checkout flow.
 * @param {string} [buttonStyle] The style object to apply to the PayPal button. Button customization includes color, shape, size, and label. The options [found here](https://developer.paypal.com/docs/integration/direct/express-checkout/integration-jsv4/customize-button/#button-styles) are available.
 * @param {boolean} [commit] The user action to show on the PayPal review page. If true, a `Pay Now` button will be shown. If false, a `Continue` button will be shown.
 */

/** @typedef {object} applePayCreateOptions The configuration options for Apple Pay.
 *
 * @param {string} [buttonStyle=black] Configures the Apple Pay button style. Valid values are `black`, `white`, `white-outline`.
 * @param {string} displayName The canonical name for your store. Use a non-localized name. This parameter should be a UTF-8 string that is a maximum of 128 characters. The system may display this name to the user.
 * @param {external:ApplePayPaymentRequest} paymentRequest The payment request details to apply on top of those from Braintree.
 */

/** @typedef {object} googlePayCreateOptions The configuration options for Google Pay. Additional options from the few listed here are available, many have default values applied based on the settings found in the Braintree Gateway. For more information, see [Google's Documentation](https://developers.google.com/pay/api/web/object-reference#request-objects).
 *
 * @param {string} merchantId The ID provided by Google for processing transactions in production. Not necessary for testing in sandbox.
 * @param {external:GooglePayTransactionInfo} transactionInfo The transaction details necessary for processing the payment.
 */

/**
 * @typedef {object} ApplePayPaymentRequest An [Apple Pay Payment Request object](https://developer.apple.com/reference/applepayjs/1916082-applepay_js_data_types/paymentrequest).
 * @external ApplePayPaymentRequest
 * @see {@link https://developer.apple.com/reference/applepayjs/1916082-applepay_js_data_types/paymentrequest PaymentRequest}
 */

/**
 * @typedef {object} GooglePayTransactionInfo A [Google Pay TransactionInfo object](https://developers.google.com/pay/api/web/object-reference#TransactionInfo).
 * @external GooglePayTransactionInfo
 * @see {@link https://developers.google.com/pay/api/web/object-reference#TransactionInfo TransactionInfo}
 */

/** @typedef {object|boolean} venmoCreateOptions The configuration options for Venmo. If `true` is passed instead of a configuration object, the default settings listed will be used.
 *
 * @param {boolean} [allowNewBrowserTab=true] If false, it restricts supported browsers to those that can app switch to the Venmo app without opening a new tab.
 */

/**
 * @static
 * @function create
 * @description This function is the entry point for `braintree.dropin`. It is used for creating {@link Dropin} instances.
 * @param {object} options Object containing all {@link Dropin} options:
 * @param {string} options.authorization A [tokenization key](https://developers.braintreepayments.com/guides/authorization/tokenization-key/javascript/v3) or a [client token](https://developers.braintreepayments.com/guides/authorization/client-token). If authorization is a client token created with a [customer ID](https://developers.braintreepayments.com/guides/drop-in/javascript/v3#customer-id), Drop-in will render saved payment methods and automatically store any newly-added payment methods in their Vault record.
 * @param {string|HTMLElement} options.container A reference to an empty element, such as a `<div>`, where Drop-in will be included on your page or the selector for the empty element. e.g. `#dropin-container`.
 * @param {string} options.selector Deprecated: Now an alias for `options.container`.
 * @param {string} [options.locale=`en_US`] Use this option to change the language, links, and terminology used throughout Drop-in. Supported locales include:
 * `da_DK`,
 * `de_DE`,
 * `en_AU`,
 * `en_GB`,
 * `en_US`,
 * `es_ES`,
 * `fr_CA`,
 * `fr_FR`,
 * `id_ID`,
 * `it_IT`,
 * `ja_JP`,
 * `ko_KR`,
 * `nl_NL`,
 * `no_NO`,
 * `pl_PL`,
 * `pt_BR`,
 * `pt_PT`,
 * `ru_RU`,
 * `sv_SE`,
 * `th_TH`,
 * `zh_CN`,
 * `zh_HK`,
 * `zh_TW`.
 *
 * @param {object} [options.translations] To use your own translations, pass an object with the strings you wish to replace. This object must use the same structure as the object used internally for supported translations, which can be found [here](https://github.com/braintree/braintree-web-drop-in/blob/master/src/translations/en_US.js). Any strings that are not included will be those from the provided `locale` or `en_US` if no `locale` is provided. See below for an example of creating Drop-in with custom translations.
 * @param {array} [options.paymentOptionPriority] Use this option to indicate the order in which enabled payment options should appear when multiple payment options are enabled. By default, payment options will appear in this order: `['card', 'paypal', 'paypalCredit', 'venmo', 'applePay']`. Payment options omitted from this array will not be offered to the customer.
 *
 * @param {object} [options.card] The configuration options for cards. See [`cardCreateOptions`](#~cardCreateOptions) for all `card` options. If this option is omitted, cards will still appear as a payment option. To remove cards as a payment option, use `paymentOptionPriority`.
 * @param {object} [options.paypal] The configuration options for PayPal. To include a PayPal option in your Drop-in integration, include the `paypal` parameter and [enable PayPal in the Braintree Control Panel](https://developers.braintreepayments.com/guides/paypal/testing-go-live/#go-live). To test in Sandbox, you will need to [link a PayPal sandbox test account to your Braintree sandbox account](https://developers.braintreepayments.com/guides/paypal/testing-go-live/#linked-paypal-testing).
 *
 * Some of the PayPal configuration options are listed [here](#~paypalCreateOptions), but for a full list see the [PayPal Checkout client reference options](http://braintree.github.io/braintree-web/{@pkg bt-web-version}/PayPalCheckout.html#createPayment).
 *
 * PayPal is not [supported in Internet Explorer versions lower than 11](https://developer.paypal.com/docs/checkout/reference/faq/#which-browsers-does-paypal-checkout-support).
 *
 * @param {object} [options.paypalCredit] The configuration options for PayPal Credit. To include a PayPal Credit option in your Drop-in integration, include the `paypalCredit` parameter and [enable PayPal in the Braintree Control Panel](https://developers.braintreepayments.com/guides/paypal/testing-go-live/#go-live).
 *
 * Some of the PayPal Credit configuration options are listed [here](#~paypalCreateOptions), but for a full list see the [PayPal Checkout client reference options](http://braintree.github.io/braintree-web/{@pkg bt-web-version}/PayPalCheckout.html#createPayment). For more information on PayPal Credit, see the [Braintree Developer Docs](https://developers.braintreepayments.com/guides/paypal/paypal-credit/javascript/v3).
 *
 * PayPal Credit is not [supported in Internet Explorer versions lower than 11](https://developer.paypal.com/docs/checkout/reference/faq/#which-browsers-does-paypal-checkout-support).
 *
 * @param {object|boolean} [options.venmo] The configuration options for Pay with Venmo. To include a Venmo option in your Drop-in integration, include the `venmo` parameter and [follow the documentation for setting up Venmo in the Braintree control panel](https://articles.braintreepayments.com/guides/payment-methods/venmo#setup). If a user's browser does not support Venmo, the Venmo option will not be rendered.
 *
 * See [`venmoCreateOptions`](#~venmoCreateOptions) for `venmo` options.
 *
 * @param {object} [options.applePay] The configuration options for Apple Pay. To include an Apple Pay option in your Drop-in integration, include the `applePay` parameter and [enable Apple Pay in the Braintree Control Panel](https://developers.braintreepayments.com/guides/apple-pay/configuration/javascript/v3). If a user's browser does not support Apple Pay, the Apple Pay option will not be rendered. See [Apple's documentation](https://support.apple.com/en-us/HT201469) for browser and device support.
 *
 * See [`applePayCreateOptions`](#~applePayCreateOptions) for `applePay` options.
 *
 * @param {object} [options.googlePay] The configuration options for Google Pay. To include a Google Pay option in your Drop-in integration, include the `googlePay` parameter and [enable Google Pay in the Braintree Control Panel](https://developers.braintreepayments.com/guides/google-pay/configuration/javascript/v3). If a user's browser does not support Google Pay, the Google Pay option will not be rendered. See [Google's documentation](https://developers.google.com/pay/api/web/test-and-deploy) for browser and device support.
 *
 * See [`googlePayCreateOptions`](#~googlePayCreateOptions) for `googlePay` options.
 *
 * @param {object} [options.dataCollector] The configuration options for data collector. See [`dataCollectorOptions`](#~dataCollectorOptions) for all `dataCollector` options. If Data Collector is configured and fails to load, Drop-in creation will fail.
 *
 * @param {object} [options.threeDSecure] The configuration options for 3D Secure. See [`threeDSecureOptions`](#~threeDSecureOptions) for all `threeDSecure` options. If 3D Secure is configured and fails to load, Drop-in creation will fail.
 *
 * @param {boolean} [options.vaultManager=false] Whether or not to allow a customer to delete saved payment methods when used with a [client token with a customer id](https://developers.braintreepayments.com/reference/request/client-token/generate/#customer_id). *Note:* Deleting a payment method from Drop-in will permanently delete the payment method, so this option is not recomended for merchants using Braintree's recurring billing system. This feature is not supported in Internet Explorer 9.
 *
 * @param {boolean} [options.preselectVaultedPaymentMethod=true] Whether or not to initialize Drop-in with a vaulted payment method pre-selected. Only applicable when using a [client token with a customer id](https://developers.braintreepayments.com/reference/request/client-token/generate/#customer_id) and a customer with saved payment methods.
 *
 * @param {function} [callback] The second argument, `data`, is the {@link Dropin} instance. Returns a promise if no callback is provided.
 * @returns {void|Promise} Returns a promise if no callback is provided.
 * @example
 * <caption>A full example of accepting credit cards with callback API</caption>
 * <!DOCTYPE html>
 * <html lang="en">
 *   <head>
 *     <meta charset="UTF-8">
 *     <title>Checkout</title>
 *   </head>
 *   <body>
 *     <div id="dropin-container"></div>
 *     <button id="submit-button">Purchase</button>
 *
 *     <script src="https://js.braintreegateway.com/web/dropin/{@pkg version}/js/dropin.min.js"></script>
 *
 *     <script>
 *       var submitButton = document.querySelector('#submit-button');
 *
 *       braintree.dropin.create({
 *         authorization: 'CLIENT_AUTHORIZATION',
 *         container: '#dropin-container'
 *       }, function (err, dropinInstance) {
 *         if (err) {
 *           // Handle any errors that might've occurred when creating Drop-in
 *           console.error(err);
 *           return;
 *         }
 *         submitButton.addEventListener('click', function () {
 *           dropinInstance.requestPaymentMethod(function (err, payload) {
 *             if (err) {
 *               // Handle errors in requesting payment method
 *             }
 *
 *             // Send payload.nonce to your server
 *           });
 *         });
 *       });
 *     </script>
 *   </body>
 * </html>
 * @example
 * <caption>A full example of accepting credit cards with promise API</caption>
 * <!DOCTYPE html>
 * <html lang="en">
 *   <head>
 *     <meta charset="UTF-8">
 *     <title>Checkout</title>
 *   </head>
 *   <body>
 *     <div id="dropin-container"></div>
 *     <button id="submit-button">Purchase</button>
 *
 *     <script src="https://js.braintreegateway.com/web/dropin/{@pkg version}/js/dropin.min.js"></script>
 *
 *     <script>
 *       var submitButton = document.querySelector('#submit-button');
 *
 *       braintree.dropin.create({
 *         authorization: 'CLIENT_AUTHORIZATION',
 *         container: '#dropin-container'
 *       }).then(function (dropinInstance) {
 *         submitButton.addEventListener('click', function () {
 *           dropinInstance.requestPaymentMethod().then(function (payload) {
 *             // Send payload.nonce to your server
 *           }).catch(function (err) {
 *             // Handle errors in requesting payment method
 *           });
 *         });
 *       }).catch(function (err) {
 *         // Handle any errors that might've occurred when creating Drop-in
 *         console.error(err);
 *       });
 *     </script>
 *   </body>
 * </html>
 * @example
 * <caption>Setting up a Drop-in instance to accept credit cards, PayPal, PayPal Credit, Venmo, and Apple Pay</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   applePay: {
 *     displayName: 'Merchant Name',
 *     paymentRequest: {
   *     label: 'Localized Name',
 *       total: '10.00'
 *     }
 *   },
 *   paypal: {
 *     flow: 'checkout',
 *     amount: '10.00',
 *     currency: 'USD'
 *   },
 *  paypalCredit: {
 *    flow: 'checkout',
 *    amount: '10.00',
 *    currency: 'USD'
 *   },
 *   venmo: true
 * }, function (err, dropinInstance) {
 *   // Set up a handler to request a payment method and
 *   // submit the payment method nonce to your server
 * });
 * @example
 * <caption>Setting up a Drop-in instance to accept Venmo with restricted browser support</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   venmo: {
 *     allowNewBrowserTab: false
 *   }
 * }, function (err, dropinInstance) {
 *   // Set up a handler to request a payment method and
 *   // submit the payment method nonce to your server
 * });
 *
 * @example
 * <caption>Submitting the payment method nonce to the server using a form</caption>
 * <!DOCTYPE html>
 * <html lang="en">
 *   <head>
 *     <meta charset="UTF-8">
 *     <title>Checkout</title>
 *   </head>
 *   <body>
 *     <form id="payment-form" action="/" method="post">
 *       <div id="dropin-container"></div>
 *       <input type="submit" value="Purchase"></input>
 *       <input type="hidden" id="nonce" name="payment_method_nonce"></input>
 *     </form>
 *
 *     <script src="https://js.braintreegateway.com/web/dropin/{@pkg version}/js/dropin.min.js"></script>
 *
 *     <script>
 *       var form = document.querySelector('#payment-form');
 *       var nonceInput = document.querySelector('#nonce');
 *
 *       braintree.dropin.create({
 *         authorization: 'CLIENT_AUTHORIZATION',
 *         container: '#dropin-container'
 *       }, function (err, dropinInstance) {
 *         if (err) {
 *           // Handle any errors that might've occurred when creating Drop-in
 *           console.error(err);
 *           return;
 *         }
 *         form.addEventListener('submit', function (event) {
 *           event.preventDefault();
 *
 *           dropinInstance.requestPaymentMethod(function (err, payload) {
 *             if (err) {
 *               // Handle errors in requesting payment method
 *               return;
 *             }
 *
 *             // Send payload.nonce to your server
 *             nonceInput.value = payload.nonce;
 *             form.submit();
 *           });
 *         });
 *       });
 *     </script>
 *   </body>
 * </html>
 *
 * @example
 * <caption>Use your own translations</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   translations: {
 *     payingWith: 'You are paying with {{paymentSource}}',
 *     chooseAnotherWayToPay: 'My custom chooseAnotherWayToPay string',
 *     // Any other custom translation strings
 *   }
 * }, callback);
 *
 * @example
 * <caption>Customizing Drop-in with card form overrides</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   card: {
 *     overrides: {
 *       fields: {
 *         number: {
 *           placeholder: '1111 1111 1111 1111' // Update the number field placeholder
 *         },
 *         postalCode: {
 *           minlength: 5 // Set the minimum length of the postal code field
 *         },
 *         cvv: null // Remove the CVV field from your form
 *       },
 *       styles: {
 *         input: {
 *           'font-size': '18px' // Change the font size for all inputs
 *         },
 *         ':focus': {
 *           color: 'red' // Change the focus color to red for all inputs
 *         }
 *       }
 *     }
 *   }
 * }, callback);
 *
 * @example
 * <caption>Mask Card Inputs</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   card: {
 *     overrides: {
 *       fields: {
 *         number: {
 *           maskInput: {
 *             showLastFour: true
 *           }
 *         },
 *         cvv: {
 *           maskInput: true
 *         }
 *       }
 *     }
 *   }
 * }, callback);
 *
 * @example
 * <caption>Including a cardholder name field</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   card: {
 *     cardholderName: true
 *   }
 * }, callback);
 *
 * @example
 * <caption>Including a required cardholder name field</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   card: {
 *     cardholderName: {
 *       required: true
 *     }
 *   }
 * }, callback);
 *
 * @example
 * <caption>Enabling 3D Secure</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   threeDSecure: {
 *     amount: '10.00'
 *   }
 * }, callback);
 *
 * @example
 * <caption>Enabled Vault Manager</caption>
 * braintree.dropin.create({
 *   authorization: 'CLIENT_AUTHORIZATION',
 *   container: '#dropin-container',
 *   vaultManager: true
 * }, callback);
 */

function create(options) {
  if (!options.authorization) {
    return Promise.reject(new DropinError('options.authorization is required.'));
  }

  return client.create({
    authorization: options.authorization
  }).catch(function (err) {
    return Promise.reject(new DropinError({
      message: 'There was an error creating Drop-in.',
      braintreeWebError: err
    }));
  }).then(function (clientInstance) {
    clientInstance = setAnalyticsIntegration(clientInstance);

    if (clientInstance.getConfiguration().authorizationType === 'TOKENIZATION_KEY') {
      analytics.sendEvent(clientInstance, 'started.tokenization-key');
    } else {
      analytics.sendEvent(clientInstance, 'started.client-token');
    }

    return new Promise(function (resolve, reject) {
      new Dropin({
        merchantConfiguration: options,
        client: clientInstance
      })._initialize(function (err, instance) {
        if (err) {
          reject(err);

          return;
        }

        resolve(instance);
      });
    });
  });
}

function setAnalyticsIntegration(clientInstance) {
  var configuration = clientInstance.getConfiguration();

  configuration.analyticsMetadata.integration = constants.INTEGRATION;
  configuration.analyticsMetadata.integrationType = constants.INTEGRATION;
  configuration.analyticsMetadata.dropinVersion = VERSION;

  clientInstance.getConfiguration = function () {
    return configuration;
  };

  return clientInstance;
}

// we check for document's existence to support server side rendering
createFromScriptTag(create, typeof document !== 'undefined' && document.querySelector('script[data-braintree-dropin-authorization]'));

module.exports = {
  create: wrapPromise(create),
  /**
   * @description The current version of Drop-in, i.e. `{@pkg version}`.
   * @type {string}
   */
  VERSION: VERSION
};

},{"./constants":117,"./dropin":119,"./lib/analytics":122,"./lib/create-from-script-tag":127,"./lib/dropin-error":129,"./lib/promise":137,"@braintree/wrap-promise":21,"braintree-web/client":30}],121:[function(require,module,exports){
'use strict';

function addSelectionEventHandler(element, func) {
  element.addEventListener('click', func);
  element.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
      func();
    }
  });
}

module.exports = addSelectionEventHandler;

},{}],122:[function(require,module,exports){
'use strict';

var atob = require('./polyfill').atob;
var constants = require('../constants');
var braintreeClientVersion = require('braintree-web/client').VERSION;

function _millisToSeconds(millis) {
  return Math.floor(millis / 1000);
}

function sendAnalyticsEvent(client, kind, callback) {
  var configuration = client.getConfiguration();
  var analyticsRequest = client._request;
  var timestamp = _millisToSeconds(Date.now());
  var url = configuration.gatewayConfiguration.analytics.url;
  var data = {
    analytics: [{
      kind: constants.ANALYTICS_PREFIX + kind,
      timestamp: timestamp
    }],
    _meta: configuration.analyticsMetadata,
    braintreeLibraryVersion: braintreeClientVersion
  };

  if (configuration.authorizationType === 'TOKENIZATION_KEY') {
    data.tokenizationKey = configuration.authorization;
  } else {
    data.authorizationFingerprint = JSON.parse(atob(configuration.authorization)).authorizationFingerprint;
  }

  analyticsRequest({
    url: url,
    method: 'post',
    data: data,
    timeout: constants.ANALYTICS_REQUEST_TIMEOUT_MS
  }, callback);
}

module.exports = {
  sendEvent: sendAnalyticsEvent
};

},{"../constants":117,"./polyfill":136,"braintree-web/client":30}],123:[function(require,module,exports){
'use strict';

var Promise = require('./promise');

function loadScript(options) {
  var script = document.createElement('script');
  var attrs = options.dataAttributes || {};
  var container = options.container || document.head;

  script.src = options.src;
  script.id = options.id;
  script.async = true;

  Object.keys(attrs).forEach(function (key) {
    script.setAttribute('data-' + key, attrs[key]);
  });

  return new Promise(function (resolve, reject) {
    script.addEventListener('load', resolve);
    script.addEventListener('error', function () {
      reject(new Error(options.src + ' failed to load.'));
    });
    script.addEventListener('abort', function () {
      reject(new Error(options.src + ' has aborted.'));
    });
    container.appendChild(script);
  });
}

function loadStylesheet(options) {
  var stylesheet = document.createElement('link');
  var container = options.container || document.head;

  stylesheet.setAttribute('rel', 'stylesheet');
  stylesheet.setAttribute('type', 'text/css');
  stylesheet.setAttribute('href', options.href);
  stylesheet.setAttribute('id', options.id);

  if (container.firstChild) {
    container.insertBefore(stylesheet, container.firstChild);
  } else {
    container.appendChild(stylesheet);
  }
}

module.exports = {
  loadScript: loadScript,
  loadStylesheet: loadStylesheet
};

},{"./promise":137}],124:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"dup":63}],125:[function(require,module,exports){
'use strict';

var isIe9 = require('@braintree/browser-detection/is-ie9');
var isIe10 = require('@braintree/browser-detection/is-ie10');

module.exports = {
  isIe9: isIe9,
  isIe10: isIe10
};

},{"@braintree/browser-detection/is-ie10":5,"@braintree/browser-detection/is-ie9":7}],126:[function(require,module,exports){
'use strict';

function _classesOf(element) {
  return element.className.trim().split(/\s+/);
}

function _hasClass(element, classname) {
  return new RegExp('\\b' + classname + '\\b').test(element.className);
}

function add(element) {
  var toAdd = Array.prototype.slice.call(arguments, 1);
  var className = _classesOf(element).filter(function (classname) {
    return toAdd.indexOf(classname) === -1;
  }).concat(toAdd).join(' ');

  element.className = className;
}

function remove(element) {
  var toRemove = Array.prototype.slice.call(arguments, 1);
  var className = _classesOf(element).filter(function (classname) {
    return toRemove.indexOf(classname) === -1;
  }).join(' ');

  element.className = className;
}

function toggle(element, classname, adding) {
  if (arguments.length < 3) {
    if (_hasClass(element, classname)) {
      remove(element, classname);
    } else {
      add(element, classname);
    }
  } else if (adding) {
    add(element, classname);
  } else {
    remove(element, classname);
  }
}

module.exports = {
  add: add,
  remove: remove,
  toggle: toggle
};

},{}],127:[function(require,module,exports){
'use strict';

var analytics = require('./analytics');
var find = require('./find-parent-form');
var uuid = require('./uuid');
var DropinError = require('./dropin-error');
var kebabCaseToCamelCase = require('./kebab-case-to-camel-case');
var WHITELISTED_DATA_ATTRIBUTES = [
  'locale',
  'payment-option-priority',

  'data-collector.kount',
  'data-collector.paypal',

  // camelcase version was accidentally used initially.
  // we add the kebab case version to match the docs, but
  // we retain the camelcase version for backwards compatibility
  'card.cardholderName',
  'card.cardholderName.required',
  'card.cardholder-name',
  'card.cardholder-name.required',

  'paypal.amount',
  'paypal.currency',
  'paypal.flow',
  'paypal.landing-page-type',

  'paypal-credit.amount',
  'paypal-credit.currency',
  'paypal-credit.flow',
  'paypal-credit.landing-page-type'
];

function injectHiddenInput(name, value, form) {
  var input = form.querySelector('[name="' + name + '"]');

  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    form.appendChild(input);
  }

  input.value = value;
}

function addCompositeKeyValuePairToObject(obj, key, value) {
  var decomposedKeys = key.split('.');
  var topLevelKey = kebabCaseToCamelCase(decomposedKeys[0]);

  if (decomposedKeys.length === 1) {
    obj[topLevelKey] = deserialize(value);
  } else {
    obj[topLevelKey] = obj[topLevelKey] || {};
    addCompositeKeyValuePairToObject(obj[topLevelKey], decomposedKeys.slice(1).join('.'), value);
  }
}

function deserialize(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

function createFromScriptTag(createFunction, scriptTag) {
  var authorization, container, createOptions, form;

  if (!scriptTag) {
    return;
  }

  authorization = scriptTag.getAttribute('data-braintree-dropin-authorization');

  if (!authorization) {
    throw new DropinError('Authorization not found in data-braintree-dropin-authorization attribute');
  }

  container = document.createElement('div');
  container.id = 'braintree-dropin-' + uuid();

  form = find.findParentForm(scriptTag);

  if (!form) {
    throw new DropinError('No form found for script tag integration.');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  scriptTag.parentNode.insertBefore(container, scriptTag);

  createOptions = {
    authorization: authorization,
    container: container
  };

  WHITELISTED_DATA_ATTRIBUTES.forEach(function (compositeKey) {
    var value = scriptTag.getAttribute('data-' + compositeKey);

    if (value == null) {
      return;
    }

    addCompositeKeyValuePairToObject(createOptions, compositeKey, value);
  });

  createFunction(createOptions).then(function (instance) {
    analytics.sendEvent(instance._client, 'integration-type.script-tag');
    form.addEventListener('submit', function () {
      instance.requestPaymentMethod(function (requestPaymentError, payload) {
        if (requestPaymentError) {
          return;
        }

        injectHiddenInput('payment_method_nonce', payload.nonce, form);

        if (payload.deviceData) {
          injectHiddenInput('device_data', payload.deviceData, form);
        }

        form.submit();
      });
    });
  });
}

module.exports = createFromScriptTag;

},{"./analytics":122,"./dropin-error":129,"./find-parent-form":131,"./kebab-case-to-camel-case":135,"./uuid":142}],128:[function(require,module,exports){
(function (global){
'use strict';

var constants = require('../constants');
var assets = require('./assets');
var Promise = require('./promise');

function DataCollector(config) {
  this._config = config;
}

DataCollector.prototype.initialize = function () {
  var self = this;

  return Promise.resolve().then(function () {
    var braintreeWebVersion;

    if (global.braintree && global.braintree.dataCollector) {
      return Promise.resolve();
    }

    braintreeWebVersion = self._config.client.getVersion();

    return assets.loadScript({
      src: 'https://js.braintreegateway.com/web/' + braintreeWebVersion + '/js/data-collector.min.js',
      id: constants.DATA_COLLECTOR_SCRIPT_ID
    });
  }).then(function () {
    return global.braintree.dataCollector.create(self._config);
  }).then(function (instance) {
    self._instance = instance;
  });
};

DataCollector.prototype.getDeviceData = function () {
  return this._instance.deviceData;
};

DataCollector.prototype.teardown = function () {
  return this._instance.teardown();
};

module.exports = DataCollector;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../constants":117,"./assets":123,"./promise":137}],129:[function(require,module,exports){
'use strict';

function isBraintreeWebError(err) {
  return err.name === 'BraintreeError';
}

function DropinError(err) {
  this.name = 'DropinError';

  if (typeof err === 'string') {
    this.message = err;
  } else {
    this.message = err.message;
  }

  if (isBraintreeWebError(err)) {
    this._braintreeWebError = err;
  } else {
    this._braintreeWebError = err.braintreeWebError;
  }
}

DropinError.prototype = Object.create(Error.prototype);
DropinError.prototype.constructor = DropinError;

module.exports = DropinError;

},{}],130:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"dup":79}],131:[function(require,module,exports){
'use strict';

function findParentForm(element) {
  var parentNode = element.parentNode;

  if (!parentNode || parentNode.nodeName === 'FORM') {
    return parentNode;
  }

  return findParentForm(parentNode);
}

module.exports = {
  findParentForm: findParentForm
};

},{}],132:[function(require,module,exports){
'use strict';

var atob = require('./polyfill').atob;

module.exports = function (client) {
  var authorizationFingerprint;
  var configuration = client.getConfiguration();

  if (configuration.authorizationType !== 'TOKENIZATION_KEY') {
    authorizationFingerprint = JSON.parse(atob(configuration.authorization)).authorizationFingerprint;

    return !authorizationFingerprint || authorizationFingerprint.indexOf('customer_id=') === -1;
  }

  return true;
};

},{"./polyfill":136}],133:[function(require,module,exports){
(function (global){
'use strict';

function isHTTPS() {
  return global.location.protocol === 'https:';
}

module.exports = {
  isHTTPS: isHTTPS
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],134:[function(require,module,exports){
(function (global){
'use strict';

module.exports = function (win) {
  win = win || global;

  return Boolean(win.document.characterSet && win.document.characterSet.toLowerCase() === 'utf-8');
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],135:[function(require,module,exports){
'use strict';

function kebabCaseToCamelCase(kebab) {
  var parts = kebab.split('-');
  var first = parts.shift();
  var capitalizedParts = parts.map(function (part) {
    return part.charAt(0).toUpperCase() + part.substring(1);
  });

  return [first].concat(capitalizedParts).join('');
}

module.exports = kebabCaseToCamelCase;

},{}],136:[function(require,module,exports){
(function (global){
'use strict';
/* eslint-disable no-mixed-operators */

var atobNormalized = typeof global.atob === 'function' ? global.atob : atob;

function atob(base64String) {
  var a, b, c, b1, b2, b3, b4, i;
  var base64Matcher = new RegExp('^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})([=]{1,2})?$');
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var result = '';

  if (!base64Matcher.test(base64String)) {
    throw new Error('Non base64 encoded input passed to window.atob polyfill');
  }

  i = 0;
  do {
    b1 = characters.indexOf(base64String.charAt(i++));
    b2 = characters.indexOf(base64String.charAt(i++));
    b3 = characters.indexOf(base64String.charAt(i++));
    b4 = characters.indexOf(base64String.charAt(i++));

    a = (b1 & 0x3F) << 2 | b2 >> 4 & 0x3;
    b = (b2 & 0xF) << 4 | b3 >> 2 & 0xF;
    c = (b3 & 0x3) << 6 | b4 & 0x3F;

    result += String.fromCharCode(a) + (b ? String.fromCharCode(b) : '') + (c ? String.fromCharCode(c) : '');
  } while (i < base64String.length);

  return result;
}

module.exports = {
  atob: function (base64String) {
    return atobNormalized.call(global, base64String);
  },
  _atob: atob
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],137:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"dup":87,"promise-polyfill":113}],138:[function(require,module,exports){
'use strict';

module.exports = function (string) {
  if (typeof string !== 'string') {
    return '';
  }

  return string
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

},{}],139:[function(require,module,exports){
'use strict';

module.exports = function () {
  var el = document.createElement('div');
  var prop = 'flex-basis: 1px';
  var prefixes = [
    '-webkit-',
    '-moz-',
    '-ms-',
    '-o-',
    ''
  ];

  prefixes.forEach(function (prefix) {
    el.style.cssText += prefix + prop;
  });

  return Boolean(el.style.length);
};

},{}],140:[function(require,module,exports){
'use strict';


var classlist = require('./classlist');
var threeDSecure = require('braintree-web/three-d-secure');
var Promise = require('./promise');

function ThreeDSecure(client, merchantConfiguration, cardVerificationString) {
  this._client = client;
  this._config = merchantConfiguration;
  this._modal = this._setupModal(cardVerificationString);
}

ThreeDSecure.prototype.initialize = function () {
  var self = this;

  return threeDSecure.create({
    client: this._client
  }).then(function (instance) {
    self._instance = instance;
  });
};

ThreeDSecure.prototype.verify = function (nonce) {
  var self = this;

  this._revealModal();

  return Promise.all([
    this._waitForThreeDSecure(),
    this._instance.verifyCard({
      nonce: nonce,
      amount: this._config.amount,
      showLoader: false,
      addFrame: function (err, iframe) {
        var modalBody = self._modal.querySelector('.braintree-three-d-secure__modal-body');

        iframe.onload = function () {
          classlist.add(modalBody, 'braintree-three-d-secure__frame-active');
        };

        modalBody.appendChild(iframe);
      },
      removeFrame: function () {
        self._cleanupModal();
      }
    }).then(function (payload) {
      self._resolveThreeDSecure();

      return payload;
    })
  ]).then(function (result) {
    self._cleanupModal();

    return result[1];
  }).catch(function (err) {
    self._cleanupModal();

    if (err.type === 'THREE_D_SECURE_CANCELLED') {
      return Promise.resolve(err.payload);
    }

    return Promise.reject(err);
  });
};

ThreeDSecure.prototype.cancel = function () {
  var self = this;

  return this._instance.cancelVerifyCard().then(function (payload) {
    self._rejectThreeDSecure({
      type: 'THREE_D_SECURE_CANCELLED',
      payload: {
        nonce: payload.nonce,
        liabilityShifted: payload.liabilityShifted,
        liabilityShiftPossible: payload.liabilityShiftPossible
      }
    });
  }).catch(function () {
    // only reason this would reject
    // is if there is no verification in progress
    // so we just swallow the error
  }).then(function () {
    self._cleanupModal();
  });
};

ThreeDSecure.prototype.updateConfiguration = function (key, value) {
  this._config[key] = value;
};

ThreeDSecure.prototype.teardown = function () {
  return this._instance.teardown();
};

ThreeDSecure.prototype._cleanupModal = function () {
  var iframe = this._modal.querySelector('iframe');

  classlist.remove(this._modal.querySelector('.braintree-three-d-secure__modal'), 'braintree-three-d-secure__frame_visible');
  classlist.remove(this._modal.querySelector('.braintree-three-d-secure__backdrop'), 'braintree-three-d-secure__frame_visible');

  if (iframe && iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
  setTimeout(function () {
    if (this._modal.parentNode) {
      this._modal.parentNode.removeChild(this._modal);
    }
  }.bind(this), 300);
};

ThreeDSecure.prototype._setupModal = function (cardVerificationString) {
  var self = this;
  var modal = document.createElement('div');

  modal.innerHTML = "<div class=\"braintree-three-d-secure\">\n  <div class=\"braintree-three-d-secure__backdrop\"></div>\n  <div class=\"braintree-three-d-secure__modal\">\n    <div data-braintree-id=\"three-d-secure-loading-container\" class=\"braintree-loader__container\">\n      <div data-braintree-id=\"three-d-secure-loading-indicator\" class=\"braintree-loader__indicator\">\n        <svg width=\"14\" height=\"16\" class=\"braintree-loader__lock\">\n          <use xlink:href=\"#iconLockLoader\"></use>\n        </svg>\n      </div>\n    </div>\n    <div class=\"braintree-three-d-secure__modal-header\">\n      {{cardVerification}}\n      <div class=\"braintree-three-d-secure__modal-close\">\n        <svg width=\"21\" height=\"21\">\n          <use xlink:href=\"#iconClose\"></use>\n        </svg>\n      </div>\n    </div>\n    <div class=\"braintree-three-d-secure__modal-body\">\n    </div>\n  </div>\n</div>\n"
    .replace('{{cardVerification}}', cardVerificationString);

  modal.querySelector('.braintree-three-d-secure__modal-close').addEventListener('click', function () {
    self.cancel();
  });

  return modal;
};

ThreeDSecure.prototype._waitForThreeDSecure = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    self._resolveThreeDSecure = resolve;
    self._rejectThreeDSecure = reject;
  });
};

ThreeDSecure.prototype._revealModal = function () {
  document.body.appendChild(this._modal);
  classlist.add(this._modal.querySelector('.braintree-three-d-secure__backdrop'), 'braintree-three-d-secure__frame_visible');
  setTimeout(function () {
    classlist.add(this._modal.querySelector('.braintree-three-d-secure__modal'), 'braintree-three-d-secure__frame_visible');
  }.bind(this), 10);
};

module.exports = ThreeDSecure;

},{"./classlist":126,"./promise":137,"braintree-web/three-d-secure":97}],141:[function(require,module,exports){
'use strict';

var browserDetection = require('./browser-detection');

function isHidden(element) {
  if (!element) { // no parentNode, so nothing containing the element is hidden
    return false;
  }

  if (element.style.display === 'none') {
    return true;
  }

  return isHidden(element.parentNode);
}

function onTransitionEnd(element, propertyName, callback) {
  if (browserDetection.isIe9() || isHidden(element)) {
    callback();

    return;
  }

  function transitionEventListener(event) {
    if (event.propertyName === propertyName) {
      element.removeEventListener('transitionend', transitionEventListener);
      callback();
    }
  }

  element.addEventListener('transitionend', transitionEventListener);
}

module.exports = {
  onTransitionEnd: onTransitionEnd
};

},{"./browser-detection":125}],142:[function(require,module,exports){
'use strict';
/* eslint-disable no-mixed-operators */

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;

    return v.toString(16);
  });
}

module.exports = uuid;

},{}],143:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Betaler med {{paymentSource}}",
  "chooseAnotherWayToPay": "Vælg en anden betalingsmetode",
  "chooseAWayToPay": "Vælg, hvordan du vil betale",
  "otherWaysToPay": "Andre betalingsmetoder",
  "edit": "Rediger",
  "doneEditing": "Udført",
  "editPaymentMethods": "Rediger betalingsmetoder",
  "CreditCardDeleteConfirmationMessage": "Vil du slette {{secondaryIdentifier}}-kortet, der slutter på {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Vil du slette PayPal-kontoen {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Er du sikker på, at du vil slette Venmo-kontoen med brugernavnet {{identifier}}?",
  "genericDeleteConfirmationMessage": "Er du sikker på, at du vil slette denne betalingsmetode?",
  "deleteCancelButton": "Annuller",
  "deleteConfirmationButton": "Slet",
  "cardVerification": "Bekræftelse af kort",
  "fieldEmptyForCvv": "Du skal angive kontrolcifrene.",
  "fieldEmptyForExpirationDate": "Du skal angive udløbsdatoen.",
  "fieldEmptyForCardholderName": "Du skal angive kortindehaverens navn.",
  "fieldTooLongForCardholderName": "Kortejerens navn skal være mindre end 256 tegn.",
  "fieldEmptyForNumber": "Du skal angive et nummer.",
  "fieldEmptyForPostalCode": "Du skal angive et postnummer.",
  "fieldInvalidForCvv": "Sikkerhedskoden er ugyldig.",
  "fieldInvalidForExpirationDate": "Udløbsdatoen er ugyldig.",
  "fieldInvalidForNumber": "Kortnummeret er ugyldigt.",
  "fieldInvalidForPostalCode": "Postnummeret er ugyldigt.",
  "genericError": "Der opstod en fejl.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Dette betalingskort er allerede en gemt betalingsmetode.",
  "hostedFieldsFailedTokenizationError": "Tjek oplysningerne, og prøv igen.",
  "hostedFieldsFieldsInvalidError": "Tjek oplysningerne, og prøv igen.",
  "hostedFieldsTokenizationNetworkErrorError": "Netværksfejl. Prøv igen.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Betalingskortet blev ikke bekræftet. Kontrollér oplysningerne, og prøv igen.",
  "paypalAccountTokenizationFailedError": "PayPal-kontoen blev ikke tilføjet. Prøv igen.",
  "paypalFlowFailedError": "Der kunne ikke oprettes forbindelse til PayPal. Prøv igen.",
  "paypalTokenizationRequestActiveError": "PayPal-betalingen er i gang med at blive autoriseret.",
  "venmoCanceledError": "Der opstod en fejl. Sørg for, at du har den seneste version af Venmo-appen installeret på din enhed, og at din browser understøtter skift til Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Vi kunne ikke slette betalingsmetode. Prøv igen.",
  "venmoAppFailedError": "Venmo-appen blev ikke fundet på din enhed.",
  "unsupportedCardTypeError": "Korttypen understøttes ikke. Prøv et andet kort.",
  "applePayTokenizationError": "Der opstod en netværksfejl under behandlingen af betalingen med Apple Pay. Prøv igen.",
  "applePayActiveCardError": "Knyt et understøttet kort til din Apple Pay-e-pung.",
  "cardholderNameLabel": "Kortindehaverens navn",
  "cardNumberLabel": "Kortnummer",
  "cvvLabel": "Kontrolcifre",
  "cvvThreeDigitLabelSubheading": "(3 cifre)",
  "cvvFourDigitLabelSubheading": "(4 cifre)",
  "cardholderNamePlaceholder": "Kortindehaverens navn",
  "expirationDateLabel": "Udløbsdato",
  "expirationDateLabelSubheading": "(MM/ÅÅ)",
  "expirationDatePlaceholder": "MM/ÅÅ",
  "postalCodeLabel": "Postnummer",
  "payWithCard": "Betal med kort",
  "endingIn": "Der slutter på {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Kort",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],144:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Zahlen mit {{paymentSource}}",
  "chooseAnotherWayToPay": "Andere Zahlungsmethode wählen",
  "chooseAWayToPay": "Wie möchten Sie bezahlen?",
  "otherWaysToPay": "Andere Zahlungsmethoden",
  "edit": "Bearbeiten",
  "doneEditing": "Fertig",
  "editPaymentMethods": "Zahlungsquellen bearbeiten",
  "CreditCardDeleteConfirmationMessage": "{{secondaryIdentifier}} Karte mit den Endziffern {{identifier}} löschen?",
  "PayPalAccountDeleteConfirmationMessage": "PayPal-Konto {{identifier}} löschen?",
  "VenmoAccountDeleteConfirmationMessage": "Wollen Sie das Venmo-Konto mit dem Benutzernamen {{identifier}} wirklich löschen?",
  "genericDeleteConfirmationMessage": "Wollen Sie diese Zahlungsquelle wirklich löschen?",
  "deleteCancelButton": "Abbrechen",
  "deleteConfirmationButton": "Löschen",
  "cardVerification": "Kartenbestätigung",
  "fieldEmptyForCvv": "Geben Sie die Kartenprüfnummer ein.",
  "fieldEmptyForExpirationDate": "Geben Sie das Ablaufdatum ein.",
  "fieldEmptyForCardholderName": "Geben Sie den Namen des Karteninhabers ein.",
  "fieldTooLongForCardholderName": "Der Name des Karteninhabers darf 255 Zeichen nicht übersteigen.",
  "fieldEmptyForNumber": "Geben Sie die Nummer ein.",
  "fieldEmptyForPostalCode": "Geben Sie die PLZ ein.",
  "fieldInvalidForCvv": "Die Kartenprüfnummer ist ungültig.",
  "fieldInvalidForExpirationDate": "Das Ablaufdatum ist ungültig.",
  "fieldInvalidForNumber": "Die Kreditkartennummer ist ungültig.",
  "fieldInvalidForPostalCode": "Die PLZ ist ungültig.",
  "genericError": "Bei uns ist ein Problem aufgetreten.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Diese Kreditkarte ist bereits als gespeicherte Zahlungsmethode vorhanden.",
  "hostedFieldsFailedTokenizationError": "Überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
  "hostedFieldsFieldsInvalidError": "Überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
  "hostedFieldsTokenizationNetworkErrorError": "Netzwerkfehler. Versuchen Sie es erneut.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Überprüfung der Karte fehlgeschlagen. Überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
  "paypalAccountTokenizationFailedError": "Beim Hinzufügen des PayPal-Kontos ist ein Problem aufgetreten. Versuchen Sie es erneut.",
  "paypalFlowFailedError": "Beim Verbinden mit PayPal ist ein Problem aufgetreten. Versuchen Sie es erneut.",
  "paypalTokenizationRequestActiveError": "Die PayPal-Zahlung wird bereits autorisiert.",
  "venmoCanceledError": "Etwas ist schief gelaufen. Vergewissern Sie sich, dass Sie die neueste Version der Venmo-App auf Ihrem Gerät installiert haben und Ihr Browser den Wechsel zu Venmo unterstützt.",
  "vaultManagerPaymentMethodDeletionError": "Die Zahlungsquelle konnte nicht gelöscht werden. Versuchen Sie es erneut.",
  "venmoAppFailedError": "Die Venmo-App wurde auf Ihrem Gerät nicht gefunden.",
  "unsupportedCardTypeError": "Dieser Kreditkartentyp wird nicht unterstützt. Versuchen Sie es mit einer anderen Karte.",
  "applePayTokenizationError": "Netzwerkfehler bei der Zahlungsabwicklung mit Apple Pay. Versuchen Sie es erneut.",
  "applePayActiveCardError": "Fügen Sie der Apple-Pay-Börse eine unterstützte Kreditkarte hinzu.",
  "cardholderNameLabel": "Name des Karteninhabers",
  "cardNumberLabel": "Kartennummer",
  "cvvLabel": "Prüfnr.",
  "cvvThreeDigitLabelSubheading": "(3-stellig)",
  "cvvFourDigitLabelSubheading": "(4-stellig)",
  "cardholderNamePlaceholder": "Name des Karteninhabers",
  "expirationDateLabel": "Gültig bis",
  "expirationDateLabelSubheading": "(MM/JJ)",
  "expirationDatePlaceholder": "MM/JJ",
  "postalCodeLabel": "PLZ",
  "payWithCard": "Mit Kreditkarte zahlen",
  "endingIn": "Mit den Endziffern {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Kreditkarte",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],145:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Paying with {{paymentSource}}",
  "chooseAnotherWayToPay": "Choose another way to pay",
  "chooseAWayToPay": "Choose a way to pay",
  "otherWaysToPay": "Other ways to pay",
  "edit": "Edit",
  "doneEditing": "Done",
  "editPaymentMethods": "Edit payment methods",
  "CreditCardDeleteConfirmationMessage": "Delete {{secondaryIdentifier}} card ending in {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Delete PayPal account {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Are you sure you want to delete the Venmo account with username {{identifier}}?",
  "genericDeleteConfirmationMessage": "Are you sure you want to delete this payment method?",
  "deleteCancelButton": "Cancel",
  "deleteConfirmationButton": "Delete",
  "cardVerification": "Card verification",
  "fieldEmptyForCvv": "Please fill out a CVV.",
  "fieldEmptyForExpirationDate": "Please fill out an expiry date.",
  "fieldEmptyForCardholderName": "Please fill out a cardholder name.",
  "fieldTooLongForCardholderName": "Cardholder name must be less than 256 characters.",
  "fieldEmptyForNumber": "Please fill out a number.",
  "fieldEmptyForPostalCode": "Please fill out a postcode.",
  "fieldInvalidForCvv": "This security code is not valid.",
  "fieldInvalidForExpirationDate": "This expiry date is not valid.",
  "fieldInvalidForNumber": "This card number is not valid.",
  "fieldInvalidForPostalCode": "This postcode is not valid.",
  "genericError": "Something went wrong on our end.",
  "hostedFieldsTokenizationFailOnDuplicateError": "This credit card already exists as a saved payment method.",
  "hostedFieldsFailedTokenizationError": "Check your entries and try again.",
  "hostedFieldsFieldsInvalidError": "Check your entries and try again.",
  "hostedFieldsTokenizationNetworkErrorError": "Network error. Please try again.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Credit card verification failed. Check your entries and try again.",
  "paypalAccountTokenizationFailedError": "Something went wrong while adding the PayPal account. Please try again.",
  "paypalFlowFailedError": "Something went wrong while connecting to PayPal. Please try again.",
  "paypalTokenizationRequestActiveError": "PayPal payment authorisation is already in progress.",
  "venmoCanceledError": "We're sorry, something seems to have gone wrong. Please ensure you have the most recent version of the Venmo app installed on your device and your browser supports switching to Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Unable to delete payment method, try again.",
  "venmoAppFailedError": "The Venmo app wasn't found on your device.",
  "unsupportedCardTypeError": "This card type is not supported. Please try another card.",
  "applePayTokenizationError": "A network error occurred while processing the Apple Pay payment. Please try again.",
  "applePayActiveCardError": "Link a supported card to your Apple Pay wallet.",
  "cardholderNameLabel": "Cardholder Name",
  "cardNumberLabel": "Card Number",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 digits)",
  "cvvFourDigitLabelSubheading": "(4 digits)",
  "cardholderNamePlaceholder": "Cardholder Name",
  "expirationDateLabel": "Expiry date",
  "expirationDateLabelSubheading": "(MM/YY)",
  "expirationDatePlaceholder": "MM/YY",
  "postalCodeLabel": "Postcode",
  "payWithCard": "Pay with credit or debit card",
  "endingIn": "Ending in {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Card",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],146:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Paying with {{paymentSource}}",
  "chooseAnotherWayToPay": "Choose another way to pay",
  "chooseAWayToPay": "Choose a way to pay",
  "otherWaysToPay": "Other ways to pay",
  "edit": "Edit",
  "doneEditing": "Done",
  "editPaymentMethods": "Edit funding sources",
  "CreditCardDeleteConfirmationMessage": "Delete {{secondaryIdentifier}} card ending in {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Delete PayPal account {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Are you sure you want to delete the Venmo account with username {{identifier}}?",
  "genericDeleteConfirmationMessage": "Are you sure you want to delete this funding source?",
  "deleteCancelButton": "Cancel",
  "deleteConfirmationButton": "Delete",
  "cardVerification": "Card Verification",
  "fieldEmptyForCvv": "Please fill in a CSC.",
  "fieldEmptyForExpirationDate": "Please fill in an expiry date.",
  "fieldEmptyForCardholderName": "Please fill in a cardholder name.",
  "fieldTooLongForCardholderName": "Cardholder name must be less than 256 characters.",
  "fieldEmptyForNumber": "Please fill in a number.",
  "fieldEmptyForPostalCode": "Please fill in a postcode.",
  "fieldInvalidForCvv": "This security code is not valid.",
  "fieldInvalidForExpirationDate": "This expiry date is not valid.",
  "fieldInvalidForNumber": "This card number is not valid.",
  "fieldInvalidForPostalCode": "This postcode is not valid.",
  "genericError": "Something went wrong on our end.",
  "hostedFieldsTokenizationFailOnDuplicateError": "This credit card has already been added to your account as a funding source.",
  "hostedFieldsFailedTokenizationError": "Please check your information and try again.",
  "hostedFieldsFieldsInvalidError": "Please check your information and try again.",
  "hostedFieldsTokenizationNetworkErrorError": "Network error. Please try again.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Credit card verification failed. Please check your information and try again.",
  "paypalAccountTokenizationFailedError": "Something went wrong while adding the PayPal account. Please try again.",
  "paypalFlowFailedError": "Something went wrong while connecting to PayPal. Please try again.",
  "paypalTokenizationRequestActiveError": "PayPal payment authorisation is already in progress.",
  "venmoCanceledError": "We're sorry, something seems to have gone wrong. Make sure you have the most recent version of the Venmo app installed on your device and your browser supports the switch to Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Unable to delete funding source, try again.",
  "venmoAppFailedError": "The Venmo app isn't on your device.",
  "unsupportedCardTypeError": "This card type is not supported. Please try another card.",
  "applePayTokenizationError": "A network error occurred while processing the Apple Pay payment. Please try again.",
  "applePayActiveCardError": "Add a supported card to your Apple Pay wallet.",
  "cardholderNameLabel": "Cardholder Name",
  "cardNumberLabel": "Card Number",
  "cvvLabel": "CSC",
  "cvvThreeDigitLabelSubheading": "(3 digits)",
  "cvvFourDigitLabelSubheading": "(4 digits)",
  "cardholderNamePlaceholder": "Cardholder Name",
  "expirationDateLabel": "Expiry Date",
  "expirationDateLabelSubheading": "(MM/YY)",
  "expirationDatePlaceholder": "MM/YY",
  "postalCodeLabel": "Postcode",
  "payWithCard": "Pay with card",
  "endingIn": "Ending in {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Card",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],147:[function(require,module,exports){
'use strict';

module.exports = {
  payingWith: 'Paying with {{paymentSource}}',
  chooseAnotherWayToPay: 'Choose another way to pay',
  chooseAWayToPay: 'Choose a way to pay',
  otherWaysToPay: 'Other ways to pay',
  edit: 'Edit',
  doneEditing: 'Done',
  editPaymentMethods: 'Edit payment methods',
  CreditCardDeleteConfirmationMessage: 'Delete {{secondaryIdentifier}} card ending in {{identifier}}?',
  PayPalAccountDeleteConfirmationMessage: 'Delete PayPal account {{identifier}}?',
  VenmoAccountDeleteConfirmationMessage: 'Are you sure you want to delete Venmo account with username {{identifier}}?',
  genericDeleteConfirmationMessage: 'Are you sure you want to delete this payment method?',
  deleteCancelButton: 'Cancel',
  deleteConfirmationButton: 'Delete',
  cardVerification: 'Card Verification',
  // Errors
  fieldEmptyForCvv: 'Please fill out a CVV.',
  fieldEmptyForExpirationDate: 'Please fill out an expiration date.',
  fieldEmptyForCardholderName: 'Please fill out a cardholder name.',
  fieldEmptyForNumber: 'Please fill out a card number.',
  fieldEmptyForPostalCode: 'Please fill out a postal code.',
  fieldInvalidForCvv: 'This security code is not valid.',
  fieldInvalidForExpirationDate: 'This expiration date is not valid.',
  fieldInvalidForNumber: 'This card number is not valid.',
  fieldInvalidForPostalCode: 'This postal code is not valid.',
  fieldTooLongForCardholderName: 'Cardholder name must be less than 256 characters.',
  genericError: 'Something went wrong on our end.',
  hostedFieldsTokenizationFailOnDuplicateError: 'This credit card already exists as a saved payment method.',
  hostedFieldsFailedTokenizationError: 'Please check your information and try again.',
  hostedFieldsTokenizationCvvVerificationFailedError: 'Credit card verification failed. Please check your information and try again.',
  hostedFieldsTokenizationNetworkErrorError: 'Network error. Please try again.',
  hostedFieldsFieldsInvalidError: 'Please check your information and try again.',
  paypalAccountTokenizationFailedError: 'Something went wrong adding the PayPal account. Please try again.',
  paypalFlowFailedError: 'Something went wrong connecting to PayPal. Please try again.',
  paypalTokenizationRequestActiveError: 'PayPal payment authorization is already in progress.',
  applePayTokenizationError: 'A network error occurred while processing the Apple Pay payment. Please try again.',
  applePayActiveCardError: 'Add a supported card to your Apple Pay wallet.',
  vaultManagerPaymentMethodDeletionError: 'Unable to delete payment method, try again.',
  venmoCanceledError: 'Something went wrong. Ensure you have the most recent version of the Venmo app installed on your device and your browser supports switching to Venmo.',
  venmoAppFailedError: 'The Venmo app could not be found on your device.',
  unsupportedCardTypeError: 'This card type is not supported. Please try another card.',
  // Card form
  cardholderNameLabel: 'Cardholder Name',
  cardNumberLabel: 'Card Number',
  cvvLabel: 'CVV',
  cvvThreeDigitLabelSubheading: '(3 digits)',
  cvvFourDigitLabelSubheading: '(4 digits)',
  expirationDateLabel: 'Expiration Date',
  expirationDateLabelSubheading: '(MM/YY)',
  cardholderNamePlaceholder: 'Cardholder Name',
  expirationDatePlaceholder: 'MM/YY',
  postalCodeLabel: 'Postal Code',
  payWithCard: 'Pay with card',
  // Payment Method descriptions
  endingIn: 'Ending in {{lastFourCardDigits}}',
  Card: 'Card',
  PayPal: 'PayPal',
  'PayPal Credit': 'PayPal Credit',
  'Apple Pay': 'Apple Pay',
  'Google Pay': 'Google Pay',
  'Venmo': 'Venmo',
  'American Express': 'American Express',
  Discover: 'Discover',
  'Diners Club': 'Diners Club',
  MasterCard: 'Mastercard',
  Visa: 'Visa',
  JCB: 'JCB',
  Maestro: 'Maestro',
  UnionPay: 'UnionPay'
};

},{}],148:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Pago con {{paymentSource}}",
  "chooseAnotherWayToPay": "Selecciona otra forma de pago.",
  "chooseAWayToPay": "Selecciona una forma de pago.",
  "otherWaysToPay": "Otras formas de pago",
  "edit": "Modificar",
  "doneEditing": "Hecho",
  "editPaymentMethods": "Editar formas de pago",
  "CreditCardDeleteConfirmationMessage": "¿Quieres eliminar la tarjeta {{secondaryIdentifier}} que termina en {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "¿Quieres eliminar la cuenta PayPal {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "¿Seguro de que deseas eliminar la cuenta de Venmo con nombre de usuario {{identifier}}?",
  "genericDeleteConfirmationMessage": "¿Seguro que deseas eliminar esta forma de pago?",
  "deleteCancelButton": "Cancelar",
  "deleteConfirmationButton": "Eliminar",
  "cardVerification": "Verificación de tarjeta",
  "fieldEmptyForCvv": "Escribe el código CVV.",
  "fieldEmptyForExpirationDate": "Escribe la fecha de vencimiento.",
  "fieldEmptyForCardholderName": "Escribe el nombre de un titular de la tarjeta.",
  "fieldTooLongForCardholderName": "El nombre del titular de la tarjeta debe tener menos de 256 caracteres.",
  "fieldEmptyForNumber": "Escribe un número.",
  "fieldEmptyForPostalCode": "Escribe el código postal.",
  "fieldInvalidForCvv": "Este código de seguridad no es válido.",
  "fieldInvalidForExpirationDate": "Esta fecha de vencimiento no es válida.",
  "fieldInvalidForNumber": "Este número de tarjeta no es válido.",
  "fieldInvalidForPostalCode": "Este código postal no es válido.",
  "genericError": "Hemos tenido algún problema.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Esta tarjeta de crédito ya existe como forma de pago guardada.",
  "hostedFieldsFailedTokenizationError": "Comprueba la información e inténtalo de nuevo.",
  "hostedFieldsFieldsInvalidError": "Comprueba la información e inténtalo de nuevo.",
  "hostedFieldsTokenizationNetworkErrorError": "Error de red. Inténtalo de nuevo.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Error de verificación de la tarjeta de crédito. Comprueba la información e inténtalo de nuevo.",
  "paypalAccountTokenizationFailedError": "Se ha producido un error al vincular la cuenta PayPal. Inténtalo de nuevo.",
  "paypalFlowFailedError": "Se ha producido un error al conectarse a PayPal. Inténtalo de nuevo.",
  "paypalTokenizationRequestActiveError": "Ya hay una autorización de pago de PayPal en curso.",
  "venmoCanceledError": "Ha habido un problema. Asegúrate de que tienes la versión más reciente de la aplicación de Venmo instalada en tu dispositivo y de que tu navegador es compatible con cambiar a Venmo.",
  "vaultManagerPaymentMethodDeletionError": "No se ha podido eliminar la forma de pago. Inténtalo de nuevo.",
  "venmoAppFailedError": "No se ha encontrado la aplicación de Venmo en tu dispositivo.",
  "unsupportedCardTypeError": "No se admite este tipo de tarjeta. Prueba con otra tarjeta.",
  "applePayTokenizationError": "Se ha producido un error de red al procesar el pago con Apple Pay. Inténtalo de nuevo.",
  "applePayActiveCardError": "Añade una tarjeta admitida a tu Wallet de Apple Pay.",
  "cardholderNameLabel": "Nombre del titular de la tarjeta",
  "cardNumberLabel": "Número de tarjeta",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 dígitos)",
  "cvvFourDigitLabelSubheading": "(4 dígitos)",
  "cardholderNamePlaceholder": "Nombre del titular de la tarjeta",
  "expirationDateLabel": "Fecha de vencimiento",
  "expirationDateLabelSubheading": "(MM/AA)",
  "expirationDatePlaceholder": "MM/AA",
  "postalCodeLabel": "Código postal",
  "payWithCard": "Pagar con tarjeta",
  "endingIn": "Terminada en {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Tarjeta",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],149:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Payer avec {{paymentSource}}",
  "chooseAnotherWayToPay": "Choisir un autre mode de paiement",
  "chooseAWayToPay": "Choisir le mode de paiement",
  "otherWaysToPay": "Autres modes de paiement",
  "edit": "Modifier",
  "doneEditing": "Terminé",
  "editPaymentMethods": "Modifier les modes de paiement",
  "CreditCardDeleteConfirmationMessage": "Supprimer la carte {{secondaryIdentifier}} se terminant par {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Supprimer le compte PayPal {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Souhaitez-vous vraiment supprimer le compte Venmo avec le nom d’utilisateur {{identifier}}?",
  "genericDeleteConfirmationMessage": "Voulez-vous vraiment supprimer ce mode de paiement?",
  "deleteCancelButton": "Annuler",
  "deleteConfirmationButton": "Supprimer",
  "cardVerification": "Vérification de la carte",
  "fieldEmptyForCvv": "Veuillez saisir un cryptogramme visuel.",
  "fieldEmptyForExpirationDate": "Veuillez saisir une date d'expiration.",
  "fieldEmptyForCardholderName": "Veuillez saisir un nom de titulaire de la carte.",
  "fieldTooLongForCardholderName": "Le nom du titulaire de la carte doit contenir moins de 256 caractères.",
  "fieldEmptyForNumber": "Veuillez saisir un numéro.",
  "fieldEmptyForPostalCode": "Veuillez saisir un code postal.",
  "fieldInvalidForCvv": "Ce cryptogramme visuel n'est pas valide.",
  "fieldInvalidForExpirationDate": "Cette date d'expiration n'est pas valide.",
  "fieldInvalidForNumber": "Ce numéro de carte n'est pas valide.",
  "fieldInvalidForPostalCode": "Ce code postal n'est pas valide.",
  "genericError": "Une erreur s'est produite de notre côté.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Cette carte de crédit existe déjà comme mode de paiement enregistré.",
  "hostedFieldsFailedTokenizationError": "Vérifiez vos informations, puis réessayez.",
  "hostedFieldsFieldsInvalidError": "Vérifiez vos informations, puis réessayez.",
  "hostedFieldsTokenizationNetworkErrorError": "Erreur réseau. Veuillez réessayer.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "La vérification de la carte de crédit a échoué. Vérifiez vos informations, puis réessayez.",
  "paypalAccountTokenizationFailedError": "Une erreur s'est produite lors de l'enregistrement du compte PayPal. Veuillez réessayer.",
  "paypalFlowFailedError": "Une erreur s'est produite au cours de la connexion à PayPal. Veuillez réessayer.",
  "paypalTokenizationRequestActiveError": "L'autorisation de paiement PayPal est déjà en cours.",
  "venmoCanceledError": "Une erreur s'est produite. Assurez-vous que la version la plus récente de l'application Venmo est installée sur votre appareil et que votre navigateur prend Venmo en charge.",
  "vaultManagerPaymentMethodDeletionError": "Impossible de supprimer le mode de paiement, essayez de nouveau.",
  "venmoAppFailedError": "L'application Venmo est introuvable sur votre appareil.",
  "unsupportedCardTypeError": "Ce type de carte n'est pas pris en charge. Veuillez essayer une autre carte.",
  "applePayTokenizationError": "Une erreur de réseau s'est produite lors du traitement du paiement avec Apple Pay. Veuillez réessayer.",
  "applePayActiveCardError": "Ajoutez une carte prise en charge à Apple Pay.",
  "cardholderNameLabel": "Nom du titulaire de la carte",
  "cardNumberLabel": "Numéro de carte",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 chiffres)",
  "cvvFourDigitLabelSubheading": "(4 chiffres)",
  "cardholderNamePlaceholder": "Nom du titulaire de la carte",
  "expirationDateLabel": "Date d'expiration",
  "expirationDateLabelSubheading": "(MM/AA)",
  "expirationDatePlaceholder": "MM/AA",
  "postalCodeLabel": "Code postal",
  "payWithCard": "Payer par carte",
  "endingIn": "Se terminant par {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Carte",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],150:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Payer avec {{paymentSource}}",
  "chooseAnotherWayToPay": "Choisissez une autre façon de payer.",
  "chooseAWayToPay": "Choisissez comment payer.",
  "otherWaysToPay": "Autres façons de payer",
  "edit": "Modifier",
  "doneEditing": "Terminé",
  "editPaymentMethods": "Modifier les sources d'approvisionnement",
  "CreditCardDeleteConfirmationMessage": "Supprimer la carte {{secondaryIdentifier}} se terminant par {{identifier}} ?",
  "PayPalAccountDeleteConfirmationMessage": "Supprimer le compte PayPal {{identifier}} ?",
  "VenmoAccountDeleteConfirmationMessage": "Êtes-vous sûr de vouloir supprimer le compte Venmo avec le nom d'utilisateur {{identifier}} ?",
  "genericDeleteConfirmationMessage": "Êtes-vous sûr de vouloir supprimer cette source d'approvisionnement ?",
  "deleteCancelButton": "Annuler",
  "deleteConfirmationButton": "Supprimer",
  "cardVerification": "Vérification de la carte",
  "fieldEmptyForCvv": "Entrez un cryptogramme visuel.",
  "fieldEmptyForExpirationDate": "Entrez une date d'expiration.",
  "fieldEmptyForCardholderName": "Entrez un nom du titulaire de la carte.",
  "fieldTooLongForCardholderName": "Le nom du titulaire de la carte doit contenir moins de 256 caractères.",
  "fieldEmptyForNumber": "Entrez un numéro.",
  "fieldEmptyForPostalCode": "Entrez un code postal.",
  "fieldInvalidForCvv": "Ce cryptogramme visuel n'est pas valide.",
  "fieldInvalidForExpirationDate": "Cette date d'expiration n'est pas valide.",
  "fieldInvalidForNumber": "Ce numéro de carte n'est pas valide.",
  "fieldInvalidForPostalCode": "Ce code postal n'est pas valide.",
  "genericError": "Une erreur est survenue.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Cette carte bancaire existe déjà comme mode de paiement enregistré.",
  "hostedFieldsFailedTokenizationError": "Vérifiez vos informations et réessayez.",
  "hostedFieldsFieldsInvalidError": "Vérifiez vos informations et réessayez.",
  "hostedFieldsTokenizationNetworkErrorError": "Erreur réseau. Réessayez.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Échec de vérification de la carte bancaire. Vérifiez vos informations et réessayez.",
  "paypalAccountTokenizationFailedError": "Une erreur est survenue lors de l'ajout du compte PayPal. Réessayez.",
  "paypalFlowFailedError": "Une erreur est survenue lors de la connexion à PayPal. Réessayez.",
  "paypalTokenizationRequestActiveError": "L'autorisation de paiement PayPal est déjà en cours.",
  "venmoCanceledError": "Une erreur est survenue. Vérifiez que vous disposez de la dernière version de l'application Venmo sur votre appareil et que votre navigateur prend en charge la redirection vers Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Impossible de supprimer la source d'approvisionnement. Réessayez.",
  "venmoAppFailedError": "L'application Venmo est introuvable sur votre appareil.",
  "unsupportedCardTypeError": "Ce type de carte n'est pas pris en charge. Essayez une autre carte.",
  "applePayTokenizationError": "Une erreur réseau s'est produite lors du traitement du paiement Apple Pay. Réessayez.",
  "applePayActiveCardError": "Enregistrez une carte prise en charge sur Apple Pay.",
  "cardholderNameLabel": "Nom du titulaire de la carte",
  "cardNumberLabel": "Nº de carte",
  "cvvLabel": "Cryptogramme visuel",
  "cvvThreeDigitLabelSubheading": "(3 chiffres)",
  "cvvFourDigitLabelSubheading": "(4 chiffres)",
  "cardholderNamePlaceholder": "Nom du titulaire de la carte",
  "expirationDateLabel": "Date d'expiration",
  "expirationDateLabelSubheading": "(MM/AA)",
  "expirationDatePlaceholder": "MM/AA",
  "postalCodeLabel": "Code postal",
  "payWithCard": "Payer par carte",
  "endingIn": "Se terminant par {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Carte",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],151:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Membayar dengan {{paymentSource}}",
  "chooseAnotherWayToPay": "Pilih metode pembayaran lain",
  "chooseAWayToPay": "Pilih metode pembayaran",
  "otherWaysToPay": "Metode pembayaran lain",
  "edit": "Edit",
  "doneEditing": "Selesai",
  "editPaymentMethods": "Edit metode pembayaran",
  "CreditCardDeleteConfirmationMessage": "Hapus kartu {{secondaryIdentifier}} yang berakhiran {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Hapus {{identifier}} rekening PayPal?",
  "VenmoAccountDeleteConfirmationMessage": "Apakah Anda yakin akan menghapus rekening Venmo dengan nama pengguna {{identifier}}?",
  "genericDeleteConfirmationMessage": "Apakah Anda yakin akan menghapus metode pembayaran ini?",
  "deleteCancelButton": "Batalkan",
  "deleteConfirmationButton": "Hapus",
  "cardVerification": "Verifikasi Kartu",
  "fieldEmptyForCvv": "Masukkan CVV.",
  "fieldEmptyForExpirationDate": "Masukkan tanggal akhir berlaku.",
  "fieldEmptyForCardholderName": "Masukkan nama pemegang kartu.",
  "fieldTooLongForCardholderName": "Nama pemegang kartu harus kurang dari 256 karakter.",
  "fieldEmptyForNumber": "Masukkan nomor.",
  "fieldEmptyForPostalCode": "Masukkan kode pos.",
  "fieldInvalidForCvv": "Kode keamanan ini tidak valid.",
  "fieldInvalidForExpirationDate": "Tanggal akhir berlaku ini tidak valid.",
  "fieldInvalidForNumber": "Nomor kartu ini tidak valid.",
  "fieldInvalidForPostalCode": "Kode pos ini tidak valid.",
  "genericError": "Terjadi kesalahan pada sistem kami.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Kartu kredit ini sudah dimasukkan sebagai metode pembayaran tersimpan.",
  "hostedFieldsFailedTokenizationError": "Periksa informasi Anda dan coba lagi.",
  "hostedFieldsFieldsInvalidError": "Periksa informasi Anda dan coba lagi.",
  "hostedFieldsTokenizationNetworkErrorError": "Masalah jaringan. Coba lagi.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Verifikasi kartu kredit gagal. Periksa informasi Anda dan coba lagi.",
  "paypalAccountTokenizationFailedError": "Terjadi kesalahan saat menambahkan rekening PayPal. Coba lagi.",
  "paypalFlowFailedError": "Terjadi kesalahan saat menyambung ke PayPal. Coba lagi.",
  "paypalTokenizationRequestActiveError": "Otorisasi pembayaran PayPal sedang diproses.",
  "venmoCanceledError": "Terdapat kesalahan. Pastikan Anda telah menginstal aplikasi Venmo versi terbaru pada perangkat dan peramban Anda mendukung untuk beralih ke Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Tidak dapat menghapus metode pembayaran, coba lagi.",
  "venmoAppFailedError": "Aplikasi Venmo tidak dapat ditemukan pada perangkat Anda.",
  "unsupportedCardTypeError": "Jenis kartu ini tidak didukung. Coba kartu lainnya.",
  "applePayTokenizationError": "Terjadi kesalahan jaringan sewaktu memproses pembayaran melalui Apple Pay. Coba lagi.",
  "applePayActiveCardError": "Tambahkan kartu yang didukung ke wallet Apple Pay.",
  "cardholderNameLabel": "Nama Pemegang Kartu",
  "cardNumberLabel": "Nomor Kartu",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 angka)",
  "cvvFourDigitLabelSubheading": "(4 angka)",
  "cardholderNamePlaceholder": "Nama Pemegang Kartu",
  "expirationDateLabel": "Tanggal Kedaluwarsa",
  "expirationDateLabelSubheading": "(BB/TT)",
  "expirationDatePlaceholder": "BB/TT",
  "postalCodeLabel": "Kode Pos",
  "payWithCard": "Bayar dengan kartu",
  "endingIn": "Berakhiran {{lastTwoCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Kartu",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],152:[function(require,module,exports){
/* eslint-disable camelcase */
'use strict';

var assign = require('../lib/assign').assign;

var fiveCharacterLocales = {
  da_DK: require('./da_DK'),
  de_DE: require('./de_DE'),
  en_US: require('./en_US'),
  en_AU: require('./en_AU'),
  en_GB: require('./en_GB'),
  es_ES: require('./es_ES'),
  fr_CA: require('./fr_CA'),
  fr_FR: require('./fr_FR'),
  id_ID: require('./id_ID'),
  it_IT: require('./it_IT'),
  ja_JP: require('./ja_JP'),
  ko_KR: require('./ko_KR'),
  nl_NL: require('./nl_NL'),
  no_NO: require('./no_NO'),
  pl_PL: require('./pl_PL'),
  pt_BR: require('./pt_BR'),
  pt_PT: require('./pt_PT'),
  ru_RU: require('./ru_RU'),
  sv_SE: require('./sv_SE'),
  th_TH: require('./th_TH'),
  zh_CN: require('./zh_CN'),
  zh_HK: require('./zh_HK'),
  zh_TW: require('./zh_TW')
};

var twoCharacterLocaleAliases = {
  da: fiveCharacterLocales.da_DK,
  de: fiveCharacterLocales.de_DE,
  en: fiveCharacterLocales.en_US,
  es: fiveCharacterLocales.es_ES,
  fr: fiveCharacterLocales.fr_FR,
  id: fiveCharacterLocales.id_ID,
  it: fiveCharacterLocales.it_IT,
  ja: fiveCharacterLocales.ja_JP,
  ko: fiveCharacterLocales.ko_KR,
  nl: fiveCharacterLocales.nl_NL,
  no: fiveCharacterLocales.no_NO,
  pl: fiveCharacterLocales.pl_PL,
  pt: fiveCharacterLocales.pt_PT,
  ru: fiveCharacterLocales.ru_RU,
  sv: fiveCharacterLocales.sv_SE,
  th: fiveCharacterLocales.th_TH,
  zh: fiveCharacterLocales.zh_CN
};

module.exports = {
  twoCharacterLocaleAliases: twoCharacterLocaleAliases,
  fiveCharacterLocales: fiveCharacterLocales,
  translations: assign({}, twoCharacterLocaleAliases, fiveCharacterLocales)
};
/* eslint-enable camelcase */

},{"../lib/assign":124,"./da_DK":143,"./de_DE":144,"./en_AU":145,"./en_GB":146,"./en_US":147,"./es_ES":148,"./fr_CA":149,"./fr_FR":150,"./id_ID":151,"./it_IT":153,"./ja_JP":154,"./ko_KR":155,"./nl_NL":156,"./no_NO":157,"./pl_PL":158,"./pt_BR":159,"./pt_PT":160,"./ru_RU":161,"./sv_SE":162,"./th_TH":163,"./zh_CN":164,"./zh_HK":165,"./zh_TW":166}],153:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Pagamento con {{paymentSource}}",
  "chooseAnotherWayToPay": "Scegli di pagare in un altro modo",
  "chooseAWayToPay": "Scegli come pagare",
  "otherWaysToPay": "Altri modi di pagare",
  "edit": "Modifica",
  "doneEditing": "Fine",
  "editPaymentMethods": "Modifica i metodi di pagamento",
  "CreditCardDeleteConfirmationMessage": "Eliminare la carta {{secondaryIdentifier}} le cui ultime cifre sono {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Eliminare il conto PayPal {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Vuoi eliminare il conto Venmo con nome utente {{identifier}}?",
  "genericDeleteConfirmationMessage": "Vuoi eliminare questo metodo di pagamento?",
  "deleteCancelButton": "Annulla",
  "deleteConfirmationButton": "Rimuovi",
  "cardVerification": "Codice di sicurezza",
  "fieldEmptyForCvv": "Immetti il codice di sicurezza (CVV).",
  "fieldEmptyForExpirationDate": "Immetti la data di scadenza.",
  "fieldEmptyForCardholderName": "Immetti il nome del titolare della carta.",
  "fieldTooLongForCardholderName": "Il nome del titolare della carta deve avere meno di 256 caratteri.",
  "fieldEmptyForNumber": "Immetti il numero di carta.",
  "fieldEmptyForPostalCode": "Immetti il CAP.",
  "fieldInvalidForCvv": "Il codice di sicurezza non è valido.",
  "fieldInvalidForExpirationDate": "La data di scadenza non è valida.",
  "fieldInvalidForNumber": "Il numero di carta non è valido.",
  "fieldInvalidForPostalCode": "Il CAP non è valido.",
  "genericError": "Si è verificato un errore nei nostri sistemi.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Questa carta di credito è già registrata come metodo di pagamento salvato.",
  "hostedFieldsFailedTokenizationError": "Controlla e riprova.",
  "hostedFieldsFieldsInvalidError": "Controlla e riprova.",
  "hostedFieldsTokenizationNetworkErrorError": "Errore di rete. Riprova.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "La verifica della carta di credito non è andata a buon fine. Controlla i dati e riprova.",
  "paypalAccountTokenizationFailedError": "Si è verificato un errore nel collegamento del conto PayPal. Riprova.",
  "paypalFlowFailedError": "Si è verificato un errore di connessione a PayPal. Riprova.",
  "paypalTokenizationRequestActiveError": "L'autorizzazione di pagamento PayPal è già in corso.",
  "venmoCanceledError": "Si è verificato un errore. Assicurati di avere la versione più recente dell'app Venmo installata sul tuo dispositivo e che il browser supporti l'uso di Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Impossibile eliminare il metodo di pagamento; riprova.",
  "venmoAppFailedError": "Impossibile trovare l'app Venmo sul dispositivo in uso.",
  "unsupportedCardTypeError": "Questo tipo di carta non è supportato. Prova con un'altra carta.",
  "applePayTokenizationError": "Si è verificato un errore di rete durante l'elaborazione del pagamento con Apple Pay. Riprova.",
  "applePayActiveCardError": "Collega una carta supportata al tuo Apple Pay Wallet.",
  "cardholderNameLabel": "Titolare della carta",
  "cardNumberLabel": "Numero di carta",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 cifre)",
  "cvvFourDigitLabelSubheading": "(4 cifre)",
  "cardholderNamePlaceholder": "Titolare della carta",
  "expirationDateLabel": "Data di scadenza",
  "expirationDateLabelSubheading": "(MM/AA)",
  "expirationDatePlaceholder": "MM/AA",
  "postalCodeLabel": "CAP",
  "payWithCard": "Paga con una carta",
  "endingIn": "Le cui ultime cifre sono {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Carta",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],154:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "{{paymentSource}}で支払う",
  "chooseAnotherWayToPay": "別の支払方法を選択する",
  "chooseAWayToPay": "支払方法を選択する",
  "otherWaysToPay": "その他の支払方法",
  "edit": "編集",
  "doneEditing": "完了",
  "editPaymentMethods": "支払方法の編集",
  "CreditCardDeleteConfirmationMessage": "末尾が{{identifier}}の{{secondaryIdentifier}}カードを削除しますか?",
  "PayPalAccountDeleteConfirmationMessage": "PayPalアカウント{{identifier}}を削除しますか?",
  "VenmoAccountDeleteConfirmationMessage": "ユーザー名{{identifier}}のVenmoアカウントを削除してよろしいですか?",
  "genericDeleteConfirmationMessage": "この支払い方法を削除してよろしいですか?",
  "deleteCancelButton": "キャンセル",
  "deleteConfirmationButton": "削除",
  "cardVerification": "カード確認",
  "fieldEmptyForCvv": "セキュリティコードを入力してください。",
  "fieldEmptyForExpirationDate": "有効期限を入力してください。",
  "fieldEmptyForCardholderName": "カード保有者の名前を入力してください。",
  "fieldTooLongForCardholderName": "カード保有者の名前は256文字未満にしてください。",
  "fieldEmptyForNumber": "番号を入力してください。",
  "fieldEmptyForPostalCode": "郵便番号を入力してください。",
  "fieldInvalidForCvv": "このセキュリティコードは無効です。",
  "fieldInvalidForExpirationDate": "この有効期限は無効です。",
  "fieldInvalidForNumber": "このカード番号は無効です。",
  "fieldInvalidForPostalCode": "この郵便番号は無効です。",
  "genericError": "弊社側で問題が発生しました。",
  "hostedFieldsTokenizationFailOnDuplicateError": "このクレジットカードは、保存済みの支払方法としてすでに登録されています。",
  "hostedFieldsFailedTokenizationError": "情報を確認してもう一度お試しください。",
  "hostedFieldsFieldsInvalidError": "情報を確認してもう一度お試しください。",
  "hostedFieldsTokenizationNetworkErrorError": "ネットワークエラーです。もう一度お試しください。",
  "hostedFieldsTokenizationCvvVerificationFailedError": "クレジットカードの認証に失敗しました。情報を確認してもう一度お試しください。",
  "paypalAccountTokenizationFailedError": "PayPalアカウントの追加で問題が発生しました。もう一度お試しください。",
  "paypalFlowFailedError": "PayPalへの接続に問題が発生しました。もう一度お試しください。",
  "paypalTokenizationRequestActiveError": "PayPal支払いの承認はすでに処理中です。",
  "venmoCanceledError": "問題が発生しました。お客さまの端末にインストールされているVenmoアプリが最新のバージョンであること、お使いのブラウザがVenmoへの切り替えをサポートしていることを確認してください。",
  "vaultManagerPaymentMethodDeletionError": "支払方法を削除できません。もう一度お試しください。",
  "venmoAppFailedError": "お客さまの端末でVenmoアプリが見つかりませんでした。",
  "unsupportedCardTypeError": "このカードタイプはサポートされていません。別のカードをご使用ください。",
  "applePayTokenizationError": "Apple Payの支払いを処理する際にネットワークエラーが発生しました。もう一度お試しください。",
  "applePayActiveCardError": "Apple Payウォレットに対応しているカードを追加してください。",
  "cardholderNameLabel": "カード保有者の名前",
  "cardNumberLabel": "カード番号",
  "cvvLabel": "セキュリティコード",
  "cvvThreeDigitLabelSubheading": "(3桁)",
  "cvvFourDigitLabelSubheading": "(4桁)",
  "cardholderNamePlaceholder": "カード保有者の名前",
  "expirationDateLabel": "有効期限",
  "expirationDateLabelSubheading": "(MM/YY)",
  "expirationDatePlaceholder": "MM/YY",
  "postalCodeLabel": "郵便番号",
  "payWithCard": "カードで支払う",
  "endingIn": "末尾が{{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "カード",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "銀聯(UnionPay)"
};

},{}],155:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "{{paymentSource}}(으)로 결제",
  "chooseAnotherWayToPay": "다른 결제수단 선택",
  "chooseAWayToPay": "결제수단 선택",
  "otherWaysToPay": "다른 방법으로 결제",
  "edit": "편집",
  "doneEditing": "완료",
  "editPaymentMethods": "결제수단 편집",
  "CreditCardDeleteConfirmationMessage": "끝번호가 {{identifier}}인 {{secondaryIdentifier}} 카드를 삭제하시겠어요?",
  "PayPalAccountDeleteConfirmationMessage": "PayPal 계정 {{identifier}}을(를) 삭제하시겠어요?",
  "VenmoAccountDeleteConfirmationMessage": "사용자 이름이 {{identifier}}인 Venmo 계정을 삭제하시겠어요?",
  "genericDeleteConfirmationMessage": "이 결제수단을 삭제하시겠어요?",
  "deleteCancelButton": "취소",
  "deleteConfirmationButton": "삭제",
  "cardVerification": "카드 인증",
  "fieldEmptyForCvv": "CVV를 입력하세요.",
  "fieldEmptyForExpirationDate": "만료일을 입력하세요.",
  "fieldEmptyForCardholderName": "카드 소유자 이름을 입력하세요.",
  "fieldTooLongForCardholderName": "카드 소유자 이름은 256자 미만이어야 합니다.",
  "fieldEmptyForNumber": "번호를 입력하세요.",
  "fieldEmptyForPostalCode": "우편번호를 입력하세요.",
  "fieldInvalidForCvv": "이 보안 코드가 올바르지 않습니다.",
  "fieldInvalidForExpirationDate": "이 만료일이 올바르지 않습니다.",
  "fieldInvalidForNumber": "이 카드 번호가 올바르지 않습니다.",
  "fieldInvalidForPostalCode": "이 우편번호가 올바르지 않습니다.",
  "genericError": "저희 쪽에 문제가 발생했습니다.",
  "hostedFieldsTokenizationFailOnDuplicateError": "저장된 결제수단에 이미 이 신용카드가 존재합니다.",
  "hostedFieldsFailedTokenizationError": "정보를 확인하고 다시 시도해 주세요.",
  "hostedFieldsFieldsInvalidError": "정보를 확인하고 다시 시도해 주세요.",
  "hostedFieldsTokenizationNetworkErrorError": "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "신용카드 인증에 실패했습니다. 정보를 확인하고 다시 시도해 주세요.",
  "paypalAccountTokenizationFailedError": "PayPal 계정을 추가하는 동안 문제가 발생했습니다. 다시 시도해 주세요.",
  "paypalFlowFailedError": "PayPal 계정을 연결하는 동안 문제가 발생했습니다. 다시 시도해 주세요.",
  "paypalTokenizationRequestActiveError": "PayPal 결제 승인이 이미 진행 중입니다.",
  "venmoCanceledError": "오류가 발생했습니다. 기기에 최신 버전의 Venmo 앱이 설치되어 있으며 브라우저가 Venmo로 전환 기능을 지원하는지 확인하세요.",
  "vaultManagerPaymentMethodDeletionError": "결제수단을 삭제할 수 없습니다. 다시 시도해 주세요.",
  "venmoAppFailedError": "기기에서 Venmo 앱을 찾을 수 없습니다.",
  "unsupportedCardTypeError": "이 카드 형식은 지원되지 않습니다. 다른 카드로 시도해 주세요.",
  "applePayTokenizationError": "Apple Pay 결제를 처리하는 동안 네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
  "applePayActiveCardError": "Apple Pay 전자지갑에 지원되는 카드를 추가하세요.",
  "cardholderNameLabel": "카드 소유자 이름",
  "cardNumberLabel": "카드 번호",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3자리)",
  "cvvFourDigitLabelSubheading": "(4자리)",
  "cardholderNamePlaceholder": "카드 소유자 이름",
  "expirationDateLabel": "만료일",
  "expirationDateLabelSubheading": "(MM/YY)",
  "expirationDatePlaceholder": "MM/YY",
  "postalCodeLabel": "우편번호",
  "payWithCard": "카드로 결제",
  "endingIn": "끝번호: {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "카드",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],156:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Betalen met {{paymentSource}}",
  "chooseAnotherWayToPay": "Kies een andere betaalmethode",
  "chooseAWayToPay": "Kies een betaalwijze",
  "otherWaysToPay": "Andere manieren om te betalen",
  "edit": "Bewerk",
  "doneEditing": "Gereed",
  "editPaymentMethods": "Betaalmethoden aanpassen",
  "CreditCardDeleteConfirmationMessage": "{{secondaryIdentifier}}-kaart eindigend op {{identifier}} verwijderen?",
  "PayPalAccountDeleteConfirmationMessage": "PayPal-rekening {{identifier}} verwijderen?",
  "VenmoAccountDeleteConfirmationMessage": "Weet u zeker dat u Venmo-rekening met gebruikersnaam {{identifier}} wilt verwijderen?",
  "genericDeleteConfirmationMessage": "Weet u zeker dat u deze betaalmethode wilt verwijderen?",
  "deleteCancelButton": "Annuleren",
  "deleteConfirmationButton": "Verwijderen",
  "cardVerification": "Kaartcontrole",
  "fieldEmptyForCvv": "Vul een CSC in.",
  "fieldEmptyForExpirationDate": "Vul een vervaldatum in.",
  "fieldEmptyForCardholderName": "Vul een naam voor de kaarthouder in.",
  "fieldTooLongForCardholderName": "De naam van de kaarthouder moet korter zijn dan 256 tekens.",
  "fieldEmptyForNumber": "Vul een nummer in.",
  "fieldEmptyForPostalCode": "Vul een postcode in.",
  "fieldInvalidForCvv": "Deze CSC is ongeldig.",
  "fieldInvalidForExpirationDate": "Deze vervaldatum is ongeldig.",
  "fieldInvalidForNumber": "Dit creditcardnummer is ongeldig.",
  "fieldInvalidForPostalCode": "Deze postcode is ongeldig.",
  "genericError": "Er is iets fout gegaan.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Deze creditcard staat al geregistreerd als een opgeslagen betaalmethode.",
  "hostedFieldsFailedTokenizationError": "Controleer uw gegevens en probeer het opnieuw.",
  "hostedFieldsFieldsInvalidError": "Controleer uw gegevens en probeer het opnieuw.",
  "hostedFieldsTokenizationNetworkErrorError": "Netwerkfout. Probeer het opnieuw.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "De controle van de creditcard is mislukt. Controleer uw gegevens en probeer het opnieuw.",
  "paypalAccountTokenizationFailedError": "Er is iets misgegaan bij het toevoegen van de PayPal-rekening. Probeer het opnieuw.",
  "paypalFlowFailedError": "Er is iets misgegaan bij de verbinding met PayPal. Probeer het opnieuw.",
  "paypalTokenizationRequestActiveError": "De autorisatie van de PayPal-betaling is al in behandeling.",
  "venmoCanceledError": "Er ging iets fout. Controleer of de meest recente versie van de Venmo-app op je apparaat is geïnstalleerd en dat je browser overschakelen naar Venmo ondersteunt.",
  "vaultManagerPaymentMethodDeletionError": "Kan de betaalmethode niet verwijderen, probeer het opnieuw.",
  "venmoAppFailedError": "De Venmo-app is niet aangetroffen op je apparaat.",
  "unsupportedCardTypeError": "Dit type creditcard wordt niet ondersteund. Gebruik een andere creditcard.",
  "applePayTokenizationError": "Er is een netwerkfout opgetreden bij het verwerken van de Apple Pay-betaling. Probeer het opnieuw.",
  "applePayActiveCardError": "Voeg een ondersteunde creditcard toe aan je Apple Pay-wallet.",
  "cardholderNameLabel": "Naam kaarthouder",
  "cardNumberLabel": "Creditcardnummer",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 cijfers)",
  "cvvFourDigitLabelSubheading": "(4 cijfers)",
  "cardholderNamePlaceholder": "Naam kaarthouder",
  "expirationDateLabel": "VervaldatumB",
  "expirationDateLabelSubheading": "(MM/JJ)",
  "expirationDatePlaceholder": "MM/JJ",
  "postalCodeLabel": "Postcode",
  "payWithCard": "Betalen met creditcard",
  "endingIn": "Eindigend op {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Creditcard",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],157:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Betaling med {{paymentSource}}",
  "chooseAnotherWayToPay": "Velg en annen måte å betale på",
  "chooseAWayToPay": "Velg betalingsmåte",
  "otherWaysToPay": "Andre måter å betale på",
  "edit": "Rediger",
  "doneEditing": "Fullført",
  "editPaymentMethods": "Endre betalingsmetodene dine",
  "CreditCardDeleteConfirmationMessage": "Vil du slette {{secondaryIdentifier}}-kortet som slutter på {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Vil du slette PayPal-kontoen {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Er du sikker på at du vil slette Venmo-kontoen med brukernavnet {{identifier}}?",
  "genericDeleteConfirmationMessage": "Er du sikker på at du vil slette denne betalingsmetoden?",
  "deleteCancelButton": "Avbryt",
  "deleteConfirmationButton": "Slett",
  "cardVerification": "Kortbekreftelse",
  "fieldEmptyForCvv": "Oppgi en kortsikkerhetskode (CVV).",
  "fieldEmptyForExpirationDate": "Oppgi en utløpsdato.",
  "fieldEmptyForCardholderName": "Oppgi et navn for kortinnehaveren.",
  "fieldTooLongForCardholderName": "Makslengden for kortinnehaverens navn er 256 tegn.",
  "fieldEmptyForNumber": "Oppgi et nummer.",
  "fieldEmptyForPostalCode": "Oppgi et postnummer.",
  "fieldInvalidForCvv": "Denne sikkerhetskoden er ikke gyldig.",
  "fieldInvalidForExpirationDate": "Denne utløpsdatoen er ikke gyldig.",
  "fieldInvalidForNumber": "Dette kortnummeret er ikke gyldig.",
  "fieldInvalidForPostalCode": "Dette postnummeret er ikke gyldig.",
  "genericError": "Noe gikk galt hos oss.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Dette betalingskortet eksisterer allerede som en lagret betalingsmetode.",
  "hostedFieldsFailedTokenizationError": "Kontroller informasjonen og prøv på nytt.",
  "hostedFieldsFieldsInvalidError": "Kontroller informasjonen og prøv på nytt.",
  "hostedFieldsTokenizationNetworkErrorError": "Nettverksfeil. Prøv på nytt.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Bekreftelsen av betalingskortet mislyktes. Kontroller informasjonen og prøv på nytt.",
  "paypalAccountTokenizationFailedError": "Noe gikk galt da PayPal-kontoen ble lagt til. Prøv på nytt.",
  "paypalFlowFailedError": "Det oppsto et problem med tilkoblingen til PayPal. Prøv på nytt.",
  "paypalTokenizationRequestActiveError": "Godkjenning av PayPal-betalingen pågår allerede",
  "venmoCanceledError": "Noe gikk galt. Kontroller at du har installert den nyeste versjonen av Venmo-appen på enheten og at nettleseren din støtter bytte til Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Kunne ikke slette betalingsmetoden. Prøv på nytt.",
  "venmoAppFailedError": "Finner ikke Venmo-appen på enheten.",
  "unsupportedCardTypeError": "Denne korttypen støttes ikke. Prøv med et annet kort.",
  "applePayTokenizationError": "Det oppsto en nettverksfeil under behandlingen av Apple Pay-betalingen. Prøv på nytt.",
  "applePayActiveCardError": "Legg til et kort som støttes i Apple Pay-lommeboken din.",
  "cardholderNameLabel": "Kortinnehaverens navn",
  "cardNumberLabel": "Kortnummer",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 siffer)",
  "cvvFourDigitLabelSubheading": "(4 siffer)",
  "cardholderNamePlaceholder": "Kortinnehaverens navn",
  "expirationDateLabel": "Utløpsdato",
  "expirationDateLabelSubheading": "(MM/ÅÅ)",
  "expirationDatePlaceholder": "MM/ÅÅ",
  "postalCodeLabel": "Postnummer",
  "payWithCard": "Betal med kort",
  "endingIn": "Slutter på {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Kort",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],158:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Źródło finansowania płatności: {{paymentSource}}",
  "chooseAnotherWayToPay": "Wybierz inne źródło finansowania płatności",
  "chooseAWayToPay": "Wybierz źródło finansowania płatności",
  "otherWaysToPay": "Inne źródła finansowania płatności",
  "edit": "Edytuj",
  "doneEditing": "Gotowe",
  "editPaymentMethods": "Edytuj źródła finansowania płatności",
  "CreditCardDeleteConfirmationMessage": "Usunąć kartę {{secondaryIdentifier}} o numerze zakończonym cyframi {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Usunąć konto PayPal {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Czy na pewno chcesz usunąć konto Venmo z nazwą użytkownika {{identifier}}?",
  "genericDeleteConfirmationMessage": "Czy na pewno chcesz usunąć to źródło finansowania płatności?",
  "deleteCancelButton": "Anuluj",
  "deleteConfirmationButton": "Usuń",
  "cardVerification": "Weryfikacja karty",
  "fieldEmptyForCvv": "Podaj kod bezpieczeństwa.",
  "fieldEmptyForExpirationDate": "Podaj datę ważności.",
  "fieldEmptyForCardholderName": "Podaj imię i nazwisko posiadacza karty.",
  "fieldTooLongForCardholderName": "Imię i nazwisko posiadacza karty musi mieć mniej niż 256 znaków.",
  "fieldEmptyForNumber": "Podaj numer.",
  "fieldEmptyForPostalCode": "Podaj kod pocztowy.",
  "fieldInvalidForCvv": "Podany kod bezpieczeństwa jest nieprawidłowy.",
  "fieldInvalidForExpirationDate": "Podana data ważności jest nieprawidłowa.",
  "fieldInvalidForNumber": "Podany numer karty jest nieprawidłowy.",
  "fieldInvalidForPostalCode": "Podany kod pocztowy jest nieprawidłowy.",
  "genericError": "Wystąpił błąd po naszej stronie.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Ta karta kredytowa jest już zapisana jako źródło finansowania płatności.",
  "hostedFieldsFailedTokenizationError": "Sprawdź swoje informacje i spróbuj ponownie.",
  "hostedFieldsFieldsInvalidError": "Sprawdź swoje informacje i spróbuj ponownie.",
  "hostedFieldsTokenizationNetworkErrorError": "Błąd sieci. Spróbuj ponownie.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Weryfikacja karty kredytowej nie powiodła się. Sprawdź swoje informacje i spróbuj ponownie.",
  "paypalAccountTokenizationFailedError": "Coś poszło nie tak podczas dodawania konta PayPal. Spróbuj ponownie.",
  "paypalFlowFailedError": "Coś poszło nie tak podczas łączenia z systemem PayPal. Spróbuj ponownie.",
  "paypalTokenizationRequestActiveError": "Autoryzacja płatności PayPal jest już w trakcie realizacji.",
  "venmoCanceledError": "Wystąpił problem. Upewnij się, czy na swoim urządzeniu masz zainstalowaną najnowszą wersję aplikacji Venmo i Twoja przeglądarka ją obsługuje.",
  "vaultManagerPaymentMethodDeletionError": "Nie można usunąć źródła finansowania płatności. Spróbuj ponownie.",
  "venmoAppFailedError": "Nie można odnaleźć aplikacji Venmo na urządzeniu.",
  "unsupportedCardTypeError": "Ten typ karty nie jest obsługiwany. Spróbuj użyć innej karty.",
  "applePayTokenizationError": "Wystąpił błąd sieci podczas przetwarzania płatności Apple Pay. Spróbuj ponownie.",
  "applePayActiveCardError": "Dodaj obsługiwaną kartę do portfela Apple Pay.",
  "cardholderNameLabel": "Imię i nazwisko posiadacza karty",
  "cardNumberLabel": "Numer karty",
  "cvvLabel": "Kod CVC",
  "cvvThreeDigitLabelSubheading": "(3 cyfry)",
  "cvvFourDigitLabelSubheading": "(4 cyfry)",
  "cardholderNamePlaceholder": "Imię i nazwisko posiadacza karty",
  "expirationDateLabel": "Data ważności",
  "expirationDateLabelSubheading": "(MM/RR)",
  "expirationDatePlaceholder": "MM/RR",
  "postalCodeLabel": "Kod pocztowy",
  "payWithCard": "Zapłać kartą",
  "endingIn": "O numerze zakończonym cyframi {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Karta",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],159:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Pagando com {{paymentSource}}",
  "chooseAnotherWayToPay": "Escolher outro meio de pagamento",
  "chooseAWayToPay": "Escolher um meio de pagamento",
  "otherWaysToPay": "Outro meio de pagamento",
  "edit": "Editar",
  "doneEditing": "Concluído",
  "editPaymentMethods": "Editar meios de pagamento",
  "CreditCardDeleteConfirmationMessage": "Excluir cartão com {{secondaryIdentifier}} com final {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Excluir conta do PayPal {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Tem certeza de que deseja excluir a conta do Venmo com o nome de usuário {{identifier}}?",
  "genericDeleteConfirmationMessage": "Tem certeza de que deseja excluir este meio de pagamento?",
  "deleteCancelButton": "Cancelar",
  "deleteConfirmationButton": "Excluir",
  "cardVerification": "Verificação do cartão",
  "fieldEmptyForCvv": "Informe o Código de Segurança.",
  "fieldEmptyForExpirationDate": "Informe a data de vencimento.",
  "fieldEmptyForCardholderName": "Informe o nome do titular do cartão.",
  "fieldTooLongForCardholderName": "O nome do titular do cartão deve ter menos de 256 caracteres.",
  "fieldEmptyForNumber": "Informe um número.",
  "fieldEmptyForPostalCode": "Informe um CEP.",
  "fieldInvalidForCvv": "Este código de segurança não é válido.",
  "fieldInvalidForExpirationDate": "Esta data de vencimento não é válida.",
  "fieldInvalidForNumber": "O número do cartão não é válido.",
  "fieldInvalidForPostalCode": "Este CEP não é válido.",
  "genericError": "Ocorreu um erro.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Este cartão de crédito já está salvo em seus meios de pagamento.",
  "hostedFieldsFailedTokenizationError": "Verifique as informações e tente novamente.",
  "hostedFieldsFieldsInvalidError": "Verifique as informações e tente novamente.",
  "hostedFieldsTokenizationNetworkErrorError": "Erro de rede. Tente novamente.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Falha ao verificar o cartão de crédito. Verifique as informações e tente novamente.",
  "paypalAccountTokenizationFailedError": "Ocorreu um erro ao adicionar a conta do PayPal. Tente novamente.",
  "paypalFlowFailedError": "Ocorreu um erro de conexão com o PayPal. Tente novamente.",
  "paypalTokenizationRequestActiveError": "A autorização de pagamento do PayPal já está em andamento.",
  "venmoCanceledError": "Ocorreu um erro. Certifique-se de ter a versão mais recente do aplicativo Venmo instalado no seu dispositivo e que o seu navegador suporte a mudança para o Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Não é possível excluir o meio de pagamento, tente novamente.",
  "venmoAppFailedError": "Não foi possível encontrar o aplicativo Venmo no seu dispositivo.",
  "unsupportedCardTypeError": "Este tipo de cartão não é aceito. Experimente outro cartão.",
  "applePayTokenizationError": "Ocorreu um erro de rede ao processar o pagamento com Apple Pay. Tente novamente.",
  "applePayActiveCardError": "Adicione cartão suportado à sua carteira do Apple Pay.",
  "cardholderNameLabel": "Nome do titular do cartão",
  "cardNumberLabel": "Número do cartão",
  "cvvLabel": "CSC",
  "cvvThreeDigitLabelSubheading": "(3 dígitos)",
  "cvvFourDigitLabelSubheading": "(4 dígitos)",
  "cardholderNamePlaceholder": "Nome do titular do cartão",
  "expirationDateLabel": "Data de vencimento",
  "expirationDateLabelSubheading": "(MM/AA)",
  "expirationDatePlaceholder": "MM/AA",
  "postalCodeLabel": "CEP",
  "payWithCard": "Pague com seu cartão",
  "endingIn": "Com final {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Cartão",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],160:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Pagar com {{paymentSource}}",
  "chooseAnotherWayToPay": "Escolher outra forma de pagamento",
  "chooseAWayToPay": "Escolha um meio de pagamento",
  "otherWaysToPay": "Outras formas de pagamento",
  "edit": "Editar",
  "doneEditing": "Concluído",
  "editPaymentMethods": "Editar meios de pagamento",
  "CreditCardDeleteConfirmationMessage": "Eliminar o cartão {{secondaryIdentifier}} terminado em {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Eliminar {{identifier}} da conta PayPal?",
  "VenmoAccountDeleteConfirmationMessage": "Tem a certeza de que pretende eliminar a conta Venmo com o nome de utilizador {{identifier}}?",
  "genericDeleteConfirmationMessage": "Tem certeza de que pretende eliminar este meio de pagamento?",
  "deleteCancelButton": "Cancelar",
  "deleteConfirmationButton": "Eliminar",
  "cardVerification": "Verificação de cartão",
  "fieldEmptyForCvv": "Introduza o código CVV.",
  "fieldEmptyForExpirationDate": "Introduza a data de validade.",
  "fieldEmptyForCardholderName": "Introduza um nome do titular do cartão.",
  "fieldTooLongForCardholderName": "O nome do titular do cartão tem de ter menos de 256 carateres.",
  "fieldEmptyForNumber": "Introduza um número.",
  "fieldEmptyForPostalCode": "Introduza o código postal.",
  "fieldInvalidForCvv": "Este código de segurança não é válido.",
  "fieldInvalidForExpirationDate": "Esta data de validade não é correta.",
  "fieldInvalidForNumber": "Este número de cartão não é válido.",
  "fieldInvalidForPostalCode": "Este código postal não é válido.",
  "genericError": "Tudo indica que ocorreu um problema.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Este cartão de crédito já está registado como um meio de pagamento guardado.",
  "hostedFieldsFailedTokenizationError": "Verifique os dados e tente novamente.",
  "hostedFieldsFieldsInvalidError": "Verifique os dados e tente novamente.",
  "hostedFieldsTokenizationNetworkErrorError": "Erro de rede. Tente novamente.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "A verificação do cartão de crédito falhou. Verifique os dados e tente novamente.",
  "paypalAccountTokenizationFailedError": "Ocorreu um erro ao associar a conta PayPal. Tente novamente.",
  "paypalFlowFailedError": "Ocorreu um erro na ligação com PayPal. Tente novamente.",
  "paypalTokenizationRequestActiveError": "Já há uma autorização de pagamento PayPal em curso.",
  "venmoCanceledError": "Ocorreu um erro. Certifique-se de que tem a versão mais recente da aplicação Venmo instalada no seu dispositivo e que o navegador suporta a mudança para o Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Não é possível eliminar o meio de pagamento, tente novamente.",
  "venmoAppFailedError": "Não foi possível encontrar a aplicação Venmo no dispositivo.",
  "unsupportedCardTypeError": "Este tipo de cartão não é suportado. Tente usar outro cartão.",
  "applePayTokenizationError": "Ocorreu um erro de rede ao processar o pagamento com Apple Pay. Tente novamente.",
  "applePayActiveCardError": "Adicione um cartão suportado à sua carteira Apple Pay.",
  "cardholderNameLabel": "Nome do titular do cartão",
  "cardNumberLabel": "Número do cartão",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 dígitos)",
  "cvvFourDigitLabelSubheading": "(4 dígitos)",
  "cardholderNamePlaceholder": "Nome do titular do cartão",
  "expirationDateLabel": "Data de validade",
  "expirationDateLabelSubheading": "(MM/AA)",
  "expirationDatePlaceholder": "MM/AA",
  "postalCodeLabel": "Código postal",
  "payWithCard": "Pagar com cartão",
  "endingIn": "Terminado em {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Cartão",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],161:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Способы оплаты: {{paymentSource}}",
  "chooseAnotherWayToPay": "Выберите другой способ оплаты",
  "chooseAWayToPay": "Выберите способ оплаты",
  "otherWaysToPay": "Другие способы оплаты",
  "edit": "Редактировать",
  "doneEditing": "Готово",
  "editPaymentMethods": "Редактировать способы оплаты",
  "CreditCardDeleteConfirmationMessage": "Удалить карту {{secondaryIdentifier}}, оканчивающуюся на {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Удалить счет PayPal {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Вы действительно хотите удалить счет Venmo с именем пользователя {{identifier}}?",
  "genericDeleteConfirmationMessage": "Вы действительно хотите удалить этот способ оплаты?",
  "deleteCancelButton": "Отмена",
  "deleteConfirmationButton": "Удалить",
  "cardVerification": "Проверка карты",
  "fieldEmptyForCvv": "Укажите код безопасности.",
  "fieldEmptyForExpirationDate": "Укажите дату окончания срока действия.",
  "fieldEmptyForCardholderName": "Введите имя и фамилию владельца карты.",
  "fieldTooLongForCardholderName": "Имя владельца карты должно содержать не более 256 символов.",
  "fieldEmptyForNumber": "Введите номер.",
  "fieldEmptyForPostalCode": "Укажите почтовый индекс.",
  "fieldInvalidForCvv": "Этот код безопасности недействителен.",
  "fieldInvalidForExpirationDate": "Эта дата окончания срока действия недействительна.",
  "fieldInvalidForNumber": "Этот номер карты недействителен.",
  "fieldInvalidForPostalCode": "Этот почтовый индекс недействителен.",
  "genericError": "Возникла проблема с нашей стороны.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Эта кредитная карта уже указана как сохраненный источник средств.",
  "hostedFieldsFailedTokenizationError": "Проверьте правильность ввода данных и повторите попытку.",
  "hostedFieldsFieldsInvalidError": "Проверьте правильность ввода данных и повторите попытку.",
  "hostedFieldsTokenizationNetworkErrorError": "Ошибка сети. Повторите попытку.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Проверка банковской карты не выполнена. Проверьте правильность ввода данных и повторите попытку.",
  "paypalAccountTokenizationFailedError": "Что-то пошло не так — не удалось добавить учетную запись PayPal. Повторите попытку.",
  "paypalFlowFailedError": "Что-то пошло не так — не удалось подключиться к системе PayPal. Повторите попытку.",
  "paypalTokenizationRequestActiveError": "Выполняется авторизация платежа PayPal.",
  "venmoCanceledError": "Возникла ошибка. Просим вас убедиться, что у вас установлена новейшая версия приложения Venmo и ваш браузер поддерживает переключение к Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Не удалось удалить способ оплаты. Повторите попытку.",
  "venmoAppFailedError": "Приложение Venmo не обнаружено на вашем устройстве.",
  "unsupportedCardTypeError": "Этот тип карты не поддерживается. Попробуйте воспользоваться другой картой.",
  "applePayTokenizationError": "При обработке платежа через Apple Pay возникла сетевая ошибка. Повторите попытку.",
  "applePayActiveCardError": "Добавьте поддерживаемую карту к своему счету Apple Pay.",
  "cardholderNameLabel": "Имя и фамилия владельца",
  "cardNumberLabel": "Номер карты",
  "cvvLabel": "Код безопасности",
  "cvvThreeDigitLabelSubheading": "(3 цифры)",
  "cvvFourDigitLabelSubheading": "(4 цифры)",
  "cardholderNamePlaceholder": "Имя и фамилия владельца",
  "expirationDateLabel": "Срок действия",
  "expirationDateLabelSubheading": "(ММ/ГГ)",
  "expirationDatePlaceholder": "ММ/ГГ",
  "postalCodeLabel": "Индекс",
  "payWithCard": "Оплатить картой",
  "endingIn": "Последние четыре цифры номера карты: {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Карта",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],162:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "Betalas med {{paymentSource}}",
  "chooseAnotherWayToPay": "Välj ett annat sätt att betala",
  "chooseAWayToPay": "Välj hur du vill betala",
  "otherWaysToPay": "Andra sätt att betala",
  "edit": "Ändra",
  "doneEditing": "Klart",
  "editPaymentMethods": "Redigera betalningsmetoder",
  "CreditCardDeleteConfirmationMessage": "Ta bort {{secondaryIdentifier}}-kort som slutar på {{identifier}}?",
  "PayPalAccountDeleteConfirmationMessage": "Ta bort PayPal-konto {{identifier}}?",
  "VenmoAccountDeleteConfirmationMessage": "Är du säker på att du vill ta bort Venmo-konto med användarnamn {{identifier}}?",
  "genericDeleteConfirmationMessage": "Är du säker på att du vill ta bort den här betalningsmetoden?",
  "deleteCancelButton": "Avbryt",
  "deleteConfirmationButton": "Ta bort",
  "cardVerification": "Kortverifiering",
  "fieldEmptyForCvv": "Fyll i en CVV-kod.",
  "fieldEmptyForExpirationDate": "Fyll i ett utgångsdatum.",
  "fieldEmptyForCardholderName": "Fyll i kortinnehavarens namn.",
  "fieldTooLongForCardholderName": "Kortinnehavarens namn måste vara kortare än 256 tecken.",
  "fieldEmptyForNumber": "Fyll i ett nummer.",
  "fieldEmptyForPostalCode": "Fyll i ett postnummer.",
  "fieldInvalidForCvv": "Den här säkerhetskoden är inte giltig.",
  "fieldInvalidForExpirationDate": "Det här utgångsdatumet är inte giltigt.",
  "fieldInvalidForNumber": "Det här kortnumret är inte giltigt.",
  "fieldInvalidForPostalCode": "Det här postnumret är inte giltigt.",
  "genericError": "Ett fel uppstod.",
  "hostedFieldsTokenizationFailOnDuplicateError": "Det här betalkortet finns redan som en sparad betalningsmetod.",
  "hostedFieldsFailedTokenizationError": "Kontrollera uppgifterna och försök igen.",
  "hostedFieldsFieldsInvalidError": "Kontrollera uppgifterna och försök igen.",
  "hostedFieldsTokenizationNetworkErrorError": "Nätverksfel. Försök igen.",
  "hostedFieldsTokenizationCvvVerificationFailedError": "Verifieringen av betalkort misslyckades. Kontrollera uppgifterna och försök igen.",
  "paypalAccountTokenizationFailedError": "Ett fel uppstod när PayPal-kontot skulle läggas till. Försök igen.",
  "paypalFlowFailedError": "Ett fel uppstod när anslutningen till PayPal skulle upprättas. Försök igen.",
  "paypalTokenizationRequestActiveError": "Betalningsgodkännandet för PayPal behandlas redan.",
  "venmoCanceledError": "Något gick fel. Se till att du har den senaste versionen av Venmo-appen installerad på din enhet och att webbläsaren stöder att gå över till Venmo.",
  "vaultManagerPaymentMethodDeletionError": "Det gick inte att ta bort betalningsmetoden. Försök igen.",
  "venmoAppFailedError": "Venmo-appen kunde inte hittas på din enhet.",
  "unsupportedCardTypeError": "Den här korttypen stöds inte. Pröva med ett annat kort.",
  "applePayTokenizationError": "Ett nätverksfel inträffade när Apple Pay-betalningen skulle behandlas. Försök igen.",
  "applePayActiveCardError": "Lägg till ett kort som stöds i Apple Pay-e-plånboken.",
  "cardholderNameLabel": "Kortinnehavarens namn",
  "cardNumberLabel": "Kortnummer",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 siffror)",
  "cvvFourDigitLabelSubheading": "(4 siffror)",
  "cardholderNamePlaceholder": "Kortinnehavarens namn",
  "expirationDateLabel": "Utgångsdatum",
  "expirationDateLabelSubheading": "(MM/ÅÅ)",
  "expirationDatePlaceholder": "MM/ÅÅ",
  "postalCodeLabel": "Postnummer",
  "payWithCard": "Betala med kort",
  "endingIn": "Slutar på {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "Kort",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],163:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "การชำระเงินด้วย {{paymentSource}}",
  "chooseAnotherWayToPay": "เลือกวิธีอื่นเพื่อชำระเงิน",
  "chooseAWayToPay": "เลือกวิธีชำระเงิน",
  "otherWaysToPay": "วิธีอื่นๆ ในการชำระเงิน",
  "edit": "แก้ไข",
  "doneEditing": "เสร็จแล้ว",
  "editPaymentMethods": "แก้ไขวิธีการชำระเงิน",
  "CreditCardDeleteConfirmationMessage": "ลบบัตร {{secondaryIdentifier }} ที่ลงท้ายด้วย {{identifier}} หรือไม่",
  "PayPalAccountDeleteConfirmationMessage": "ลบ {{identifier}} บัญชี PayPal หรือไม่",
  "VenmoAccountDeleteConfirmationMessage": "คุณมั่นใจว่าต้องการลบบัญชี Venmo ที่มีชื่อผู้ใช้ {{identifier}} หรือไม่",
  "genericDeleteConfirmationMessage": "คุณมั่นใจว่าต้องการลบวิธีการชำระเงินนี้หรือไม่",
  "deleteCancelButton": "ยกเลิก",
  "deleteConfirmationButton": "ลบ",
  "cardVerification": "การตรวจสอบยืนยันบัตร",
  "fieldEmptyForCvv": "โปรดกรอก CVV (รหัสการตรวจสอบยืนยันบัตร)",
  "fieldEmptyForExpirationDate": "โปรดกรอกวันที่หมดอายุ",
  "fieldEmptyForCardholderName": "โปรดกรอกชื่อเจ้าของบัตร",
  "fieldTooLongForCardholderName": "ชื่อผู้ถือบัตรจะต้องไม่เกิน 256 อักขระ",
  "fieldEmptyForNumber": "โปรดกรอกหมายเลข",
  "fieldEmptyForPostalCode": "โปรดกรอกรหัสไปรษณีย์",
  "fieldInvalidForCvv": "รหัสความปลอดภัยนี้ไม่ถูกต้อง",
  "fieldInvalidForExpirationDate": "วันที่หมดอายุนี้ไม่ถูกต้อง",
  "fieldInvalidForNumber": "หมายเลขบัตรนี้ไม่ถูกต้อง",
  "fieldInvalidForPostalCode": "รหัสไปรษณีย์นี้ไม่ถูกต้อง",
  "genericError": "เกิดข้อผิดพลาดขึ้นในระบบของเรา",
  "hostedFieldsTokenizationFailOnDuplicateError": "บัตรเครดิตนี้ถูกบันทึกไว้เป็นวิธีการชำระเงิน",
  "hostedFieldsFailedTokenizationError": "โปรดตรวจสอบข้อมูลของคุณ แล้วลองใหม่อีกครั้ง",
  "hostedFieldsFieldsInvalidError": "โปรดตรวจสอบข้อมูลของคุณ แล้วลองใหม่อีกครั้ง",
  "hostedFieldsTokenizationNetworkErrorError": "ข้อผิดพลาดด้านเครือข่าย โปรดลองอีกครั้ง",
  "hostedFieldsTokenizationCvvVerificationFailedError": "การตรวจสอบยืนยันบัตรเครดิตล้มเหลว โปรดตรวจสอบข้อมูลของคุณ แล้วลองใหม่อีกครั้ง",
  "paypalAccountTokenizationFailedError": "เกิดข้อผิดพลาดในการเพิ่มบัญชี PayPal โปรดลองอีกครั้ง",
  "paypalFlowFailedError": "เกิดข้อผิดพลาดในการเชื่อมต่อกับ PayPal โปรดลองอีกครั้ง",
  "paypalTokenizationRequestActiveError": "การอนุญาตการชำระเงินของ PayPal อยู่ในระหว่างดำเนินการ",
  "venmoCanceledError": "เกิดข้อผิดพลาดบางประการ ตรวจสอบว่าคุณมีแอป Venmo เวอร์ชันล่าสุดติดตั้งในอุปกรณ์ของคุณ และมีเบราเซอร์ที่รองรับ Venmo",
  "vaultManagerPaymentMethodDeletionError": "ไม่สามารถลบวิธีการชำระเงินได้ ลองอีกครั้ง",
  "venmoAppFailedError": "ไม่พบแอป Venmo บนอุปกรณ์ของคุณ",
  "unsupportedCardTypeError": "ไม่รองรับบัตรประเภทนี้ โปรดลองใช้บัตรใบอื่น",
  "applePayTokenizationError": "เกิดข้อผิดพลาดด้านเครือข่ายขึ้นขณะดำเนินการชำระเงินด้วย Apple Pay โปรดลองอีกครั้ง",
  "applePayActiveCardError": "เพิ่มบัตรที่รองรับในกระเป๋าสตางค์ Apple Pay ของคุณ",
  "cardholderNameLabel": "ชื่อเจ้าของบัตร",
  "cardNumberLabel": "หมายเลขบัตร",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "(3 หลัก)",
  "cvvFourDigitLabelSubheading": "(4 หลัก)",
  "cardholderNamePlaceholder": "ชื่อเจ้าของบัตร",
  "expirationDateLabel": "วันหมดอายุ",
  "expirationDateLabelSubheading": "(ดด/ปป)",
  "expirationDatePlaceholder": "ดด/ปป",
  "postalCodeLabel": "รหัสไปรษณีย์",
  "payWithCard": "ชำระเงินด้วยบัตร",
  "endingIn": "ลงท้ายด้วย {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "บัตร",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],164:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "正在使用{{paymentSource}}付款",
  "chooseAnotherWayToPay": "选择其他付款方式",
  "chooseAWayToPay": "选择付款方式",
  "otherWaysToPay": "其他付款方式",
  "edit": "编辑",
  "doneEditing": "完成",
  "editPaymentMethods": "编辑付款方式",
  "CreditCardDeleteConfirmationMessage": "删除尾号为{{identifier}}的{{secondaryIdentifier}}卡？",
  "PayPalAccountDeleteConfirmationMessage": "删除PayPal账户{{identifier}}？",
  "VenmoAccountDeleteConfirmationMessage": "确定要删除用户名为{{identifier}}的Venmo账户吗？",
  "genericDeleteConfirmationMessage": "确定要删除该付款方式吗？",
  "deleteCancelButton": "取消",
  "deleteConfirmationButton": "删除",
  "cardVerification": "卡验证",
  "fieldEmptyForCvv": "请填写CVV。",
  "fieldEmptyForExpirationDate": "请填写有效期限。",
  "fieldEmptyForCardholderName": "请填写持卡人的姓名。",
  "fieldTooLongForCardholderName": "持卡人姓名必须少于256个字符。",
  "fieldEmptyForNumber": "请填写一个号码。",
  "fieldEmptyForPostalCode": "请填写邮政编码。",
  "fieldInvalidForCvv": "此安全代码无效。",
  "fieldInvalidForExpirationDate": "此有效期限无效。",
  "fieldInvalidForNumber": "此卡号无效。",
  "fieldInvalidForPostalCode": "此邮政编码无效。",
  "genericError": "我们遇到了一些问题",
  "hostedFieldsTokenizationFailOnDuplicateError": "此信用卡已作为保存后的付款方式存在。",
  "hostedFieldsFailedTokenizationError": "请检查您的信息，然后重试。",
  "hostedFieldsFieldsInvalidError": "请检查您的信息，然后重试。",
  "hostedFieldsTokenizationNetworkErrorError": "网络错误。请重试。",
  "hostedFieldsTokenizationCvvVerificationFailedError": "信用卡验证失败。请检查您的信息，然后重试。",
  "paypalAccountTokenizationFailedError": "添加PayPal账户时出错。请重试。",
  "paypalFlowFailedError": "连接到PayPal时出错。请重试。",
  "paypalTokenizationRequestActiveError": "PayPal付款授权已在进行中。",
  "venmoCanceledError": "我们遇到了问题。请确保您的设备上已安装最新版本的Venmo应用，并且您的浏览器支持切换到Venmo。",
  "vaultManagerPaymentMethodDeletionError": "无法删除付款方式，请重试。",
  "venmoAppFailedError": "在您的设备上找不到Venmo应用。",
  "unsupportedCardTypeError": "不支持该卡类型。请尝试其他卡。",
  "applePayTokenizationError": "处理Apple Pay付款时出现网络错误。请重试。",
  "applePayActiveCardError": "请添加受支持的卡到您的Apple Pay钱包。",
  "cardholderNameLabel": "持卡人姓名",
  "cardNumberLabel": "卡号",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "（3位数）",
  "cvvFourDigitLabelSubheading": "（4位数）",
  "cardholderNamePlaceholder": "持卡人姓名",
  "expirationDateLabel": "有效期限",
  "expirationDateLabelSubheading": "（MM/YY）",
  "expirationDatePlaceholder": "MM/YY",
  "postalCodeLabel": "邮政编码",
  "payWithCard": "用卡付款",
  "endingIn": "尾号为{{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "卡",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "银联"
};

},{}],165:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "付款方式為 {{paymentSource}}",
  "chooseAnotherWayToPay": "選擇其他付款方式",
  "chooseAWayToPay": "選擇付款方式",
  "otherWaysToPay": "其他付款方式",
  "edit": "編輯",
  "doneEditing": "完成",
  "editPaymentMethods": "編輯付款方式",
  "CreditCardDeleteConfirmationMessage": "要刪除末碼為 {{identifier}} 的 {{secondaryIdentifier}} 卡嗎？",
  "PayPalAccountDeleteConfirmationMessage": "要刪除 PayPal 帳戶 {{identifier}} 嗎？",
  "VenmoAccountDeleteConfirmationMessage": "確定要刪除使用者名稱為 {{identifier}} 的 Venmo 帳戶嗎？",
  "genericDeleteConfirmationMessage": "確定要刪除此付款方式嗎？",
  "deleteCancelButton": "取消",
  "deleteConfirmationButton": "刪除",
  "cardVerification": "信用卡認證",
  "fieldEmptyForCvv": "請填寫信用卡認證碼。",
  "fieldEmptyForExpirationDate": "請填寫到期日。",
  "fieldEmptyForCardholderName": "請填寫持卡人的名字。",
  "fieldTooLongForCardholderName": "持卡人姓名必須少於 256 個字元。",
  "fieldEmptyForNumber": "請填寫號碼。",
  "fieldEmptyForPostalCode": "請填寫郵遞區號。",
  "fieldInvalidForCvv": "此安全代碼無效。",
  "fieldInvalidForExpirationDate": "此到期日無效。",
  "fieldInvalidForNumber": "此卡號無效。",
  "fieldInvalidForPostalCode": "此郵遞區號無效。",
  "genericError": "系統發生錯誤。",
  "hostedFieldsTokenizationFailOnDuplicateError": "此信用卡已存在，為已儲存的付款方式。",
  "hostedFieldsFailedTokenizationError": "請檢查你的資料並再試一次。",
  "hostedFieldsFieldsInvalidError": "請檢查你的資料並再試一次。",
  "hostedFieldsTokenizationNetworkErrorError": "網絡錯誤。再試一次。",
  "hostedFieldsTokenizationCvvVerificationFailedError": "信用卡認證失敗。請檢查你的資料並再試一次。",
  "paypalAccountTokenizationFailedError": "加入 PayPal 帳戶時發生錯誤。再試一次。",
  "paypalFlowFailedError": "連接 PayPal 時發生錯誤。再試一次。",
  "paypalTokenizationRequestActiveError": "PayPal 付款授權已在處理中。",
  "venmoCanceledError": "系統發生錯誤，請確保你已在裝置上安裝最新版本的 Venmo 應用程式，而且你的瀏覽器支援切換至 Venmo。",
  "vaultManagerPaymentMethodDeletionError": "無法刪除付款方式，請再試一次。",
  "venmoAppFailedError": "在你的裝置上找不到 Venmo 應用程式。",
  "unsupportedCardTypeError": "不可使用此信用卡類型。請改用其他信用卡。",
  "applePayTokenizationError": "處理 Apple Pay 付款時發生網絡錯誤。再試一次。",
  "applePayActiveCardError": "在 Apple Pay 錢包中加入支援的信用卡。",
  "cardholderNameLabel": "持卡人名字",
  "cardNumberLabel": "卡號",
  "cvvLabel": "信用卡認證碼",
  "cvvThreeDigitLabelSubheading": "（3 位數）",
  "cvvFourDigitLabelSubheading": "（4 位數）",
  "cardholderNamePlaceholder": "持卡人名字",
  "expirationDateLabel": "到期日",
  "expirationDateLabelSubheading": "(MM/YY)",
  "expirationDatePlaceholder": "月 / 年",
  "postalCodeLabel": "郵遞區號",
  "payWithCard": "使用信用卡付款",
  "endingIn": "末碼為 {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "信用卡",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal Credit",
  "Google Pay": "Google Pay",
  "American Express": "American Express",
  "Discover": "Discover",
  "Diners Club": "Diners Club",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],166:[function(require,module,exports){
'use strict';

module.exports = {
  "payingWith": "以 {{paymentSource}} 付款",
  "chooseAnotherWayToPay": "選擇付款的以其他方式付款",
  "chooseAWayToPay": "選擇付款方式",
  "otherWaysToPay": "其他付款方式",
  "edit": "編輯",
  "doneEditing": "完成",
  "editPaymentMethods": "編輯付款方式",
  "CreditCardDeleteConfirmationMessage": "確定要刪除末碼為 {{identifier}} 的 {{secondaryIdentifier}} 卡片嗎？",
  "PayPalAccountDeleteConfirmationMessage": "確定要刪除 {{identifier}} PayPal 帳戶嗎？",
  "VenmoAccountDeleteConfirmationMessage": "確定要刪除用戶名稱為 {{identifier}} 的 Venmo 帳戶嗎？",
  "genericDeleteConfirmationMessage": "確定要刪除此付款方式？",
  "deleteCancelButton": "取消",
  "deleteConfirmationButton": "刪除",
  "cardVerification": "信用卡認證",
  "fieldEmptyForCvv": "請填妥信用卡驗證碼。",
  "fieldEmptyForExpirationDate": "請填妥到期日。",
  "fieldEmptyForCardholderName": "請填妥持卡人姓名。",
  "fieldTooLongForCardholderName": "持卡人姓名不能超過 256 個字元。",
  "fieldEmptyForNumber": "請填妥號碼。",
  "fieldEmptyForPostalCode": "請填寫郵遞區號。",
  "fieldInvalidForCvv": "這組安全代碼無效。",
  "fieldInvalidForExpirationDate": "此到期日無效。",
  "fieldInvalidForNumber": "此卡號無效。",
  "fieldInvalidForPostalCode": "此郵遞區號無效。",
  "genericError": "我們的系統發生問題。",
  "hostedFieldsTokenizationFailOnDuplicateError": "此信用卡已存在，為已儲存的付款方式。",
  "hostedFieldsFailedTokenizationError": "請檢查你的資料並重試。",
  "hostedFieldsFieldsInvalidError": "請檢查你的資料並重試。",
  "hostedFieldsTokenizationNetworkErrorError": "網路錯誤。請重試。",
  "hostedFieldsTokenizationCvvVerificationFailedError": "信用卡認證失敗。請檢查你的資料並重試。",
  "paypalAccountTokenizationFailedError": "新增 PayPal 帳戶時，系統發生錯誤。請重試。",
  "paypalFlowFailedError": "連結至 PayPal 時，系統發生錯誤。請重試。",
  "paypalTokenizationRequestActiveError": "PayPal 支付款項的授權已在處理中。",
  "venmoCanceledError": "系統發生錯誤。確認你的裝置上裝有最新版本的 Venmo 應用程式，而且瀏覽器支援切換至 Venmo。",
  "vaultManagerPaymentMethodDeletionError": "無法刪除付款方式，請再試一次。",
  "venmoAppFailedError": "你的裝置上找不到 Venmo 應用程式。",
  "unsupportedCardTypeError": "不支援此卡片類型。請改用其他卡片。",
  "applePayTokenizationError": "在處理 Apple Pay 付款時發生網路錯誤。請重試。",
  "applePayActiveCardError": "新增支援的卡片至你的 Apple Pay 錢包。",
  "cardholderNameLabel": "持卡人姓名",
  "cardNumberLabel": "卡號",
  "cvvLabel": "CVV",
  "cvvThreeDigitLabelSubheading": "（3 位數）",
  "cvvFourDigitLabelSubheading": "（4 位數）",
  "cardholderNamePlaceholder": "持卡人姓名",
  "expirationDateLabel": "到期日",
  "expirationDateLabelSubheading": "（月 / 年）",
  "expirationDatePlaceholder": "月 / 年",
  "postalCodeLabel": "郵遞區號",
  "payWithCard": "使用信用卡 / 扣帳卡付款",
  "endingIn": "末碼為 {{lastFourCardDigits}}",
  "Apple Pay": "Apple Pay",
  "Venmo": "Venmo",
  "Card": "信用卡或扣帳卡",
  "PayPal": "PayPal",
  "PayPal Credit": "PayPal 信貸",
  "Google Pay": "Google Pay",
  "American Express": "美國運通 (American Express)",
  "Discover": "Discover",
  "Diners Club": "大來國際 (Diners Club)",
  "MasterCard": "Mastercard",
  "Visa": "Visa",
  "JCB": "JCB",
  "Maestro": "Maestro",
  "UnionPay": "UnionPay"
};

},{}],167:[function(require,module,exports){
'use strict';

var assign = require('../lib/assign').assign;
var classlist = require('../lib/classlist');
var DropinError = require('../lib/dropin-error');
var errors = require('../constants').errors;
var Promise = require('../lib/promise');

function BaseView(options) {
  options = options || {};

  assign(this, options);
}

BaseView.prototype.getElementById = function (id) {
  if (!this.element) { return null; }

  return this.element.querySelector('[data-braintree-id="' + id + '"]');
};

BaseView.prototype.requestPaymentMethod = function () {
  return Promise.reject(new DropinError(errors.NO_PAYMENT_METHOD_ERROR));
};

BaseView.prototype.getPaymentMethod = function () {
  return this.activeMethodView && this.activeMethodView.paymentMethod;
};

BaseView.prototype.onSelection = function () {};

BaseView.prototype.teardown = function () {
  return Promise.resolve();
};

BaseView.prototype.preventUserAction = function () {
  if (this.element) {
    classlist.add(this.element, 'braintree-sheet--loading');
  }

  this.model.preventUserAction();
};

BaseView.prototype.allowUserAction = function () {
  if (this.element) {
    classlist.remove(this.element, 'braintree-sheet--loading');
  }

  this.model.allowUserAction();
};

module.exports = BaseView;

},{"../constants":117,"../lib/assign":124,"../lib/classlist":126,"../lib/dropin-error":129,"../lib/promise":137}],168:[function(require,module,exports){
'use strict';

var BaseView = require('./base-view');
var addSelectionEventHandler = require('../lib/add-selection-event-handler');
var paymentMethodTypes = require('../constants').paymentMethodTypes;

function DeleteConfirmationView() {
  BaseView.apply(this, arguments);

  this._initialize();
}

DeleteConfirmationView.prototype = Object.create(BaseView.prototype);
DeleteConfirmationView.prototype.constructor = DeleteConfirmationView;
DeleteConfirmationView.ID = DeleteConfirmationView.prototype.ID = 'delete-confirmation';

DeleteConfirmationView.prototype._initialize = function () {
  this._yesButton = this.getElementById('delete-confirmation__yes');
  this._noButton = this.getElementById('delete-confirmation__no');
  this._messageBox = this.getElementById('delete-confirmation__message');

  addSelectionEventHandler(this._yesButton, function () {
    this.model.deleteVaultedPaymentMethod();
  }.bind(this));
  addSelectionEventHandler(this._noButton, function () {
    this.model.cancelDeleteVaultedPaymentMethod();
  }.bind(this));
};

DeleteConfirmationView.prototype.applyPaymentMethod = function (paymentMethod) {
  var identifier, secondaryIdentifier;
  var messageText = this.strings[paymentMethod.type + 'DeleteConfirmationMessage'];

  if (messageText) {
    switch (paymentMethod.type) {
      case paymentMethodTypes.card:
        identifier = paymentMethod.details.lastFour;
        secondaryIdentifier = paymentMethod.details.cardType;
        break;
      case paymentMethodTypes.paypal:
        identifier = paymentMethod.details.email;
        break;
      case paymentMethodTypes.venmo:
        identifier = paymentMethod.details.username;
        break;
      default:
        break;
    }

    messageText = messageText.replace('{{identifier}}', identifier);
    if (secondaryIdentifier) {
      messageText = messageText.replace('{{secondaryIdentifier}}', secondaryIdentifier);
    }
  } else {
    messageText = this.strings.genericDeleteConfirmationMessage;
  }
  this._messageBox.innerText = messageText;
};

module.exports = DeleteConfirmationView;

},{"../constants":117,"../lib/add-selection-event-handler":121,"./base-view":167}],169:[function(require,module,exports){
'use strict';

var analytics = require('../lib/analytics');
var analyticsKinds = require('../constants').analyticsKinds;
var BaseView = require('./base-view');
var classlist = require('../lib/classlist');
var sheetViews = require('./payment-sheet-views');
var PaymentMethodsView = require('./payment-methods-view');
var PaymentOptionsView = require('./payment-options-view');
var DeleteConfirmationView = require('./delete-confirmation-view');
var addSelectionEventHandler = require('../lib/add-selection-event-handler');
var Promise = require('../lib/promise');
var supportsFlexbox = require('../lib/supports-flexbox');

var CHANGE_ACTIVE_PAYMENT_METHOD_TIMEOUT = require('../constants').CHANGE_ACTIVE_PAYMENT_METHOD_TIMEOUT;
var DEVELOPER_MISCONFIGURATION_MESSAGE = require('../constants').errors.DEVELOPER_MISCONFIGURATION_MESSAGE;

function MainView() {
  BaseView.apply(this, arguments);

  this.dependenciesInitializing = 0;

  this._initialize();
}

MainView.prototype = Object.create(BaseView.prototype);
MainView.prototype.constructor = MainView;

MainView.prototype._initialize = function () {
  var paymentOptionsView;

  this._hasMultiplePaymentOptions = this.model.supportedPaymentOptions.length > 1;

  this._views = {};

  this.sheetContainer = this.getElementById('sheet-container');
  this.sheetErrorText = this.getElementById('sheet-error-text');

  this.toggle = this.getElementById('toggle');
  this.disableWrapper = this.getElementById('disable-wrapper');
  this.lowerContainer = this.getElementById('lower-container');

  this.loadingContainer = this.getElementById('loading-container');
  this.dropinContainer = this.element.querySelector('.braintree-dropin');

  this.supportsFlexbox = supportsFlexbox();

  this.model.on('asyncDependenciesReady', this.hideLoadingIndicator.bind(this));

  this.model.on('errorOccurred', this.showSheetError.bind(this));
  this.model.on('errorCleared', this.hideSheetError.bind(this));
  this.model.on('preventUserAction', this.preventUserAction.bind(this));
  this.model.on('allowUserAction', this.allowUserAction.bind(this));

  this.paymentSheetViewIDs = Object.keys(sheetViews).reduce(function (ids, sheetViewKey) {
    var PaymentSheetView, paymentSheetView;

    if (this.model.supportedPaymentOptions.indexOf(sheetViewKey) !== -1) {
      PaymentSheetView = sheetViews[sheetViewKey];

      paymentSheetView = new PaymentSheetView({
        element: this.getElementById(PaymentSheetView.ID),
        mainView: this,
        model: this.model,
        client: this.client,
        strings: this.strings
      });
      paymentSheetView.initialize();

      this.addView(paymentSheetView);
      ids.push(paymentSheetView.ID);
    }

    return ids;
  }.bind(this), []);

  this.paymentMethodsViews = new PaymentMethodsView({
    element: this.element,
    model: this.model,
    strings: this.strings
  });
  this.addView(this.paymentMethodsViews);

  this.deleteConfirmationView = new DeleteConfirmationView({
    element: this.getElementById('delete-confirmation'),
    model: this.model,
    strings: this.strings
  });
  this.addView(this.deleteConfirmationView);

  addSelectionEventHandler(this.toggle, this.toggleAdditionalOptions.bind(this));

  this.model.on('changeActivePaymentMethod', function () {
    setTimeout(function () {
      this.setPrimaryView(PaymentMethodsView.ID);
    }.bind(this), CHANGE_ACTIVE_PAYMENT_METHOD_TIMEOUT);
  }.bind(this));

  this.model.on('changeActivePaymentView', function (id) {
    var activePaymentView = this.getView(id);

    if (id === PaymentMethodsView.ID) {
      classlist.add(this.paymentMethodsViews.container, 'braintree-methods--active');
      classlist.remove(this.sheetContainer, 'braintree-sheet--active');
    } else {
      setTimeout(function () {
        classlist.add(this.sheetContainer, 'braintree-sheet--active');
      }.bind(this), 0);
      classlist.remove(this.paymentMethodsViews.container, 'braintree-methods--active');
      if (!this.getView(id).getPaymentMethod()) {
        this.model.setPaymentMethodRequestable({
          isRequestable: false
        });
      }
    }

    activePaymentView.onSelection();
  }.bind(this));

  this.model.on('removeActivePaymentMethod', function () {
    var activePaymentView = this.getView(this.model.getActivePaymentView());

    if (activePaymentView && typeof activePaymentView.removeActivePaymentMethod === 'function') {
      activePaymentView.removeActivePaymentMethod();
    }
  }.bind(this));

  this.model.on('enableEditMode', this.enableEditMode.bind(this));

  this.model.on('disableEditMode', this.disableEditMode.bind(this));

  this.model.on('confirmPaymentMethodDeletion', this.openConfirmPaymentMethodDeletionDialog.bind(this));
  this.model.on('cancelVaultedPaymentMethodDeletion', this.cancelVaultedPaymentMethodDeletion.bind(this));
  this.model.on('startVaultedPaymentMethodDeletion', this.startVaultedPaymentMethodDeletion.bind(this));
  this.model.on('finishVaultedPaymentMethodDeletion', this.finishVaultedPaymentMethodDeletion.bind(this));

  if (this._hasMultiplePaymentOptions) {
    paymentOptionsView = new PaymentOptionsView({
      client: this.client,
      element: this.getElementById(PaymentOptionsView.ID),
      mainView: this,
      model: this.model,
      strings: this.strings
    });

    this.addView(paymentOptionsView);
  }

  this._sendToDefaultView();
};

MainView.prototype.addView = function (view) {
  this._views[view.ID] = view;
};

MainView.prototype.getView = function (id) {
  return this._views[id];
};

MainView.prototype.setPrimaryView = function (id, secondaryViewId) {
  var paymentMethod;

  setTimeout(function () {
    this.element.className = prefixShowClass(id);
    if (secondaryViewId) {
      classlist.add(this.element, prefixShowClass(secondaryViewId));
    }
  }.bind(this), 0);

  this.primaryView = this.getView(id);
  this.model.changeActivePaymentView(id);

  if (this.paymentSheetViewIDs.indexOf(id) !== -1) {
    if (this.model.getPaymentMethods().length > 0 || this.getView(PaymentOptionsView.ID)) {
      this.showToggle();
    } else {
      this.hideToggle();
    }
  } else if (id === PaymentMethodsView.ID) {
    this.showToggle();
    // Move options below the upper-container
    this.getElementById('lower-container').appendChild(this.getElementById('options'));
  } else if (id === PaymentOptionsView.ID) {
    this.hideToggle();
  }

  if (!this.supportsFlexbox) {
    this.element.setAttribute('data-braintree-no-flexbox', true);
  }

  paymentMethod = this.primaryView.getPaymentMethod();

  this.model.setPaymentMethodRequestable({
    isRequestable: Boolean(paymentMethod),
    type: paymentMethod && paymentMethod.type,
    selectedPaymentMethod: paymentMethod
  });

  this.model.clearError();
};

MainView.prototype.requestPaymentMethod = function () {
  var activePaymentView = this.getView(this.model.getActivePaymentView());

  return activePaymentView.requestPaymentMethod().then(function (payload) {
    analytics.sendEvent(this.client, 'request-payment-method.' + analyticsKinds[payload.type]);

    return payload;
  }.bind(this)).catch(function (err) {
    analytics.sendEvent(this.client, 'request-payment-method.error');

    return Promise.reject(err);
  }.bind(this));
};

MainView.prototype.hideLoadingIndicator = function () {
  classlist.add(this.dropinContainer, 'braintree-loaded');
  classlist.add(this.loadingContainer, 'braintree-hidden');
};

MainView.prototype.showLoadingIndicator = function () {
  classlist.remove(this.dropinContainer, 'braintree-loaded');
  classlist.remove(this.loadingContainer, 'braintree-hidden');
};

MainView.prototype.toggleAdditionalOptions = function () {
  var sheetViewID;
  var isPaymentSheetView = this.paymentSheetViewIDs.indexOf(this.primaryView.ID) !== -1;

  this.hideToggle();

  if (!this._hasMultiplePaymentOptions) {
    sheetViewID = this.paymentSheetViewIDs[0];

    classlist.add(this.element, prefixShowClass(sheetViewID));
    this.model.changeActivePaymentView(sheetViewID);
  } else if (isPaymentSheetView) {
    if (this.model.getPaymentMethods().length === 0) {
      this.setPrimaryView(PaymentOptionsView.ID);
    } else {
      this.setPrimaryView(PaymentMethodsView.ID, PaymentOptionsView.ID);
      this.hideToggle();
    }
  } else {
    classlist.add(this.element, prefixShowClass(PaymentOptionsView.ID));
  }
};

MainView.prototype.showToggle = function () {
  if (this.model.isInEditMode()) {
    return;
  }
  classlist.remove(this.toggle, 'braintree-hidden');
  classlist.add(this.lowerContainer, 'braintree-hidden');
};

MainView.prototype.hideToggle = function () {
  classlist.add(this.toggle, 'braintree-hidden');
  classlist.remove(this.lowerContainer, 'braintree-hidden');
};

MainView.prototype.showSheetError = function (error) {
  var errorMessage;
  var genericErrorMessage = this.strings.genericError;

  if (this.strings.hasOwnProperty(error)) {
    errorMessage = this.strings[error];
  } else if (error && error.code) {
    errorMessage = this.strings[snakeCaseToCamelCase(error.code) + 'Error'] || genericErrorMessage;
  } else if (error === 'developerError') {
    errorMessage = DEVELOPER_MISCONFIGURATION_MESSAGE;
  } else {
    errorMessage = genericErrorMessage;
  }

  classlist.add(this.dropinContainer, 'braintree-sheet--has-error');
  this.sheetErrorText.innerHTML = errorMessage;
};

MainView.prototype.hideSheetError = function () {
  classlist.remove(this.dropinContainer, 'braintree-sheet--has-error');
};

MainView.prototype.getOptionsElements = function () {
  return this._views.options.elements;
};

MainView.prototype.preventUserAction = function () {
  classlist.remove(this.disableWrapper, 'braintree-hidden');
};

MainView.prototype.allowUserAction = function () {
  classlist.add(this.disableWrapper, 'braintree-hidden');
};

MainView.prototype.teardown = function () {
  var error;
  var viewNames = Object.keys(this._views);
  var teardownPromises = viewNames.map(function (view) {
    return this._views[view].teardown().catch(function (err) {
      error = err;
    });
  }.bind(this));

  return Promise.all(teardownPromises).then(function () {
    if (error) {
      return Promise.reject(error);
    }

    return Promise.resolve();
  });
};

MainView.prototype.enableEditMode = function () {
  this.setPrimaryView(this.paymentMethodsViews.ID);
  this.paymentMethodsViews.enableEditMode();
  this.hideToggle();

  this.model.setPaymentMethodRequestable({
    isRequestable: false
  });
};

MainView.prototype.disableEditMode = function () {
  var paymentMethod;

  this.hideSheetError();
  this.paymentMethodsViews.disableEditMode();
  this.showToggle();

  paymentMethod = this.primaryView.getPaymentMethod();

  this.model.setPaymentMethodRequestable({
    isRequestable: Boolean(paymentMethod),
    type: paymentMethod && paymentMethod.type,
    selectedPaymentMethod: paymentMethod
  });
};

MainView.prototype.openConfirmPaymentMethodDeletionDialog = function (paymentMethod) {
  this.deleteConfirmationView.applyPaymentMethod(paymentMethod);
  this.setPrimaryView(this.deleteConfirmationView.ID);
};

MainView.prototype.cancelVaultedPaymentMethodDeletion = function () {
  this.setPrimaryView(this.paymentMethodsViews.ID);
};

MainView.prototype.startVaultedPaymentMethodDeletion = function () {
  this.element.className = '';
  this.showLoadingIndicator();
};

MainView.prototype.finishVaultedPaymentMethodDeletion = function (error) {
  var self = this;

  this.paymentMethodsViews.refreshPaymentMethods();

  if (error && this.model.getPaymentMethods().length > 0) {
    this.model.enableEditMode();
    this.showSheetError('vaultManagerPaymentMethodDeletionError');
  } else {
    this._sendToDefaultView();
  }

  return new Promise(function (resolve) {
    setTimeout(function () {
      // allow all the views to reset before hiding the loading indicator
      self.hideLoadingIndicator();
      resolve();
    }, 500);
  });
};

MainView.prototype._sendToDefaultView = function () {
  var paymentMethods = this.model.getPaymentMethods();
  var preselectVaultedPaymentMethod = this.model.merchantConfiguration.preselectVaultedPaymentMethod !== false;

  if (paymentMethods.length > 0) {
    if (preselectVaultedPaymentMethod) {
      this.model.changeActivePaymentMethod(paymentMethods[0]);
    } else {
      this.setPrimaryView(this.paymentMethodsViews.ID);
    }
  } else if (this._hasMultiplePaymentOptions) {
    this.setPrimaryView(PaymentOptionsView.ID);
  } else {
    this.setPrimaryView(this.paymentSheetViewIDs[0]);
  }
};
function snakeCaseToCamelCase(s) {
  return s.toLowerCase().replace(/(\_\w)/g, function (m) {
    return m[1].toUpperCase();
  });
}

function prefixShowClass(classname) {
  return 'braintree-show-' + classname;
}

module.exports = MainView;

},{"../constants":117,"../lib/add-selection-event-handler":121,"../lib/analytics":122,"../lib/classlist":126,"../lib/promise":137,"../lib/supports-flexbox":139,"./base-view":167,"./delete-confirmation-view":168,"./payment-methods-view":171,"./payment-options-view":172,"./payment-sheet-views":177}],170:[function(require,module,exports){
'use strict';

var BaseView = require('./base-view');
var classlist = require('../lib/classlist');
var constants = require('../constants');

var addSelectionEventHandler = require('../lib/add-selection-event-handler');

var paymentMethodHTML = "<div class=\"braintre-method__icon-container braintree-method__delete-container\">\n  <div class=\"braintree-method__icon braintree-method__delete\">\n    <svg width=\"48\" height=\"29\">\n      <use xlink:href=\"#iconX\"></use>\n    </svg>\n  </div>\n  <div class=\"braintree-method__disabled-description\">@DISABLE_MESSAGE</div>\n</div>\n\n<div class=\"braintree-method__logo\">\n  <svg width=\"40\" height=\"24\" class=\"@CLASSNAME\">\n    <use xlink:href=\"#@ICON\"></use>\n  </svg>\n</div>\n\n<div class=\"braintree-method__label\">@TITLE<br><div class=\"braintree-method__label--small\">@SUBTITLE</div></div>\n\n<div class=\"braintre-method__icon-container braintree-method__check-container\">\n  <div class=\"braintree-method__icon braintree-method__check\">\n    <svg height=\"100%\" width=\"100%\">\n      <use xlink:href=\"#iconCheck\"></use>\n    </svg>\n  </div>\n</div>\n";

function PaymentMethodView() {
  BaseView.apply(this, arguments);

  this._initialize();
}

PaymentMethodView.prototype = Object.create(BaseView.prototype);
PaymentMethodView.prototype.constructor = PaymentMethodView;

PaymentMethodView.prototype._initialize = function () {
  var endingInText;
  var html = paymentMethodHTML;
  var paymentMethodCardTypes = constants.paymentMethodCardTypes;
  var paymentMethodTypes = constants.paymentMethodTypes;

  this.element = document.createElement('div');
  this.element.className = 'braintree-method';
  this.element.setAttribute('tabindex', '0');

  addSelectionEventHandler(this.element, this._choosePaymentMethod.bind(this));

  html = html.replace(/@DISABLE_MESSAGE/g, this.strings.hasSubscription);

  switch (this.paymentMethod.type) {
    case paymentMethodTypes.applePay:
      html = html.replace(/@ICON/g, 'logoApplePay')
        .replace(/@CLASSNAME/g, '')
        .replace(/@TITLE/g, this.strings['Apple Pay'])
        .replace(/@SUBTITLE/g, '');
      break;
    case paymentMethodTypes.card:
      endingInText = this.strings.endingIn.replace('{{lastFourCardDigits}}', this.paymentMethod.details.lastFour);
      html = html.replace(/@ICON/g, 'icon-' + paymentMethodCardTypes[this.paymentMethod.details.cardType])
        .replace(/@CLASSNAME/g, ' braintree-icon--bordered')
        .replace(/@TITLE/g, endingInText)
        .replace(/@SUBTITLE/g, this.strings[this.paymentMethod.details.cardType]);
      break;
    case paymentMethodTypes.googlePay:
      html = html.replace(/@ICON/g, 'logoGooglePay')
        .replace(/@CLASSNAME/g, '')
        .replace(/@TITLE/g, this.strings['Google Pay'])
        .replace(/@SUBTITLE/g, '');
      break;
    case paymentMethodTypes.paypal:
      html = html.replace(/@ICON/g, 'logoPayPal')
        .replace(/@CLASSNAME/g, '')
        .replace(/@TITLE/g, this.paymentMethod.details.email)
        .replace(/@SUBTITLE/g, this.strings.PayPal);
      break;
    case paymentMethodTypes.venmo:
      html = html.replace(/@ICON/g, 'logoVenmo')
        .replace(/@CLASSNAME/g, '')
        .replace(/@TITLE/g, this.paymentMethod.details.username)
        .replace(/@SUBTITLE/g, this.strings.Venmo);
      break;
    default:
      break;
  }

  this.element.innerHTML = html;
  this.checkMark = this.element.querySelector('.braintree-method__check-container');
  addSelectionEventHandler(this.element.querySelector('.braintree-method__delete-container'), this._selectDelete.bind(this));
};

PaymentMethodView.prototype.setActive = function (isActive) {
  // setTimeout required to animate addition of new payment methods
  setTimeout(function () {
    classlist.toggle(this.element, 'braintree-method--active', isActive);
  }.bind(this), 0);
};

PaymentMethodView.prototype.enableEditMode = function () {
  classlist.add(this.checkMark, 'braintree-hidden');
  if (this.paymentMethod.hasSubscription) {
    classlist.add(this.element, 'braintree-method--disabled');
  }
};

PaymentMethodView.prototype.disableEditMode = function () {
  classlist.remove(this.checkMark, 'braintree-hidden');
  classlist.remove(this.element, 'braintree-method--disabled');
};

PaymentMethodView.prototype._choosePaymentMethod = function () {
  if (this.model.isInEditMode()) {
    return;
  }
  this.model.changeActivePaymentMethod(this.paymentMethod);
};

PaymentMethodView.prototype._selectDelete = function () {
  this.model.confirmPaymentMethodDeletion(this.paymentMethod);
};

module.exports = PaymentMethodView;

},{"../constants":117,"../lib/add-selection-event-handler":121,"../lib/classlist":126,"./base-view":167}],171:[function(require,module,exports){
'use strict';

var BaseView = require('./base-view');
var PaymentMethodView = require('./payment-method-view');
var DropinError = require('../lib/dropin-error');
var classlist = require('../lib/classlist');
var errors = require('../constants').errors;
var Promise = require('../lib/promise');
var addSelectionEventHandler = require('../lib/add-selection-event-handler');

var PAYMENT_METHOD_TYPE_TO_TRANSLATION_STRING = {
  CreditCard: 'Card',
  PayPalAccount: 'PayPal',
  ApplePayCard: 'Apple Pay',
  AndroidPayCard: 'Google Pay',
  VenmoAccount: 'Venmo'
};

function PaymentMethodsView() {
  BaseView.apply(this, arguments);

  this._initialize();
}

PaymentMethodsView.prototype = Object.create(BaseView.prototype);
PaymentMethodsView.prototype.constructor = PaymentMethodsView;
PaymentMethodsView.ID = PaymentMethodsView.prototype.ID = 'methods';

PaymentMethodsView.prototype._initialize = function () {
  this.views = [];
  this.container = this.getElementById('methods-container');
  this._headingLabel = this.getElementById('methods-label');
  this._editButton = this.getElementById('methods-edit');

  this.model.on('addPaymentMethod', this._addPaymentMethod.bind(this));
  this.model.on('changeActivePaymentMethod', this._changeActivePaymentMethodView.bind(this));
  this.model.on('refreshPaymentMethods', this.refreshPaymentMethods.bind(this));

  this.refreshPaymentMethods();

  if (this.model.merchantConfiguration.vaultManager) {
    this.model.on('removePaymentMethod', this._removePaymentMethod.bind(this));

    addSelectionEventHandler(this._editButton, function () {
      if (this.model.isInEditMode()) {
        this.model.disableEditMode();
      } else {
        this.model.enableEditMode();
      }
    }.bind(this));

    classlist.remove(this._editButton, 'braintree-hidden');
  }
};

PaymentMethodsView.prototype.removeActivePaymentMethod = function () {
  if (!this.activeMethodView) {
    return;
  }
  this.activeMethodView.setActive(false);
  this.activeMethodView = null;
  classlist.add(this._headingLabel, 'braintree-no-payment-method-selected');
};

PaymentMethodsView.prototype._getPaymentMethodString = function () {
  var stringKey, paymentMethodTypeString;

  if (!this.activeMethodView) {
    return '';
  }

  stringKey = PAYMENT_METHOD_TYPE_TO_TRANSLATION_STRING[this.activeMethodView.paymentMethod.type];
  paymentMethodTypeString = this.strings[stringKey];

  return this.strings.payingWith.replace('{{paymentSource}}', paymentMethodTypeString);
};

PaymentMethodsView.prototype.enableEditMode = function () {
  classlist.add(this.container, 'braintree-methods--edit');

  this._editButton.innerHTML = this.strings.deleteCancelButton;
  this._headingLabel.innerHTML = this.strings.editPaymentMethods;

  this.views.forEach(function (view) {
    view.enableEditMode();
  });
};

PaymentMethodsView.prototype.disableEditMode = function () {
  classlist.remove(this.container, 'braintree-methods--edit');

  this._editButton.innerHTML = this.strings.edit;
  this._headingLabel.innerHTML = this._getPaymentMethodString();

  this.views.forEach(function (view) {
    view.disableEditMode();
  });
};

PaymentMethodsView.prototype._addPaymentMethod = function (paymentMethod) {
  var paymentMethodView = new PaymentMethodView({
    model: this.model,
    paymentMethod: paymentMethod,
    strings: this.strings
  });

  if (this.model.isGuestCheckout && this.container.firstChild) {
    this.container.removeChild(this.container.firstChild);
    this.views.pop();
  }

  if (this.container.firstChild) {
    this.container.insertBefore(paymentMethodView.element, this.container.firstChild);
  } else {
    this.container.appendChild(paymentMethodView.element);
  }

  this.views.push(paymentMethodView);
};

PaymentMethodsView.prototype._removePaymentMethod = function (paymentMethod) {
  var i;

  for (i = 0; i < this.views.length; i++) {
    if (this.views[i].paymentMethod === paymentMethod) {
      this.container.removeChild(this.views[i].element);
      this._headingLabel.innerHTML = '&nbsp;';
      this.views.splice(i, 1);
      break;
    }
  }
};

PaymentMethodsView.prototype._changeActivePaymentMethodView = function (paymentMethod) {
  var i;
  var previousActiveMethodView = this.activeMethodView;

  for (i = 0; i < this.views.length; i++) {
    if (this.views[i].paymentMethod === paymentMethod) {
      this.activeMethodView = this.views[i];
      this._headingLabel.innerHTML = this._getPaymentMethodString();
      break;
    }
  }

  if (previousActiveMethodView) {
    previousActiveMethodView.setActive(false);
  }
  this.activeMethodView.setActive(true);
  classlist.remove(this._headingLabel, 'braintree-no-payment-method-selected');
};

PaymentMethodsView.prototype.requestPaymentMethod = function () {
  if (!this.activeMethodView || this.model.isInEditMode()) {
    return Promise.reject(new DropinError(errors.NO_PAYMENT_METHOD_ERROR));
  }

  return Promise.resolve(this.activeMethodView.paymentMethod);
};

PaymentMethodsView.prototype.refreshPaymentMethods = function () {
  var i;
  var paymentMethods = this.model.getPaymentMethods();

  this.views.forEach(function (view) {
    this.container.removeChild(view.element);
  }.bind(this));

  this.views = [];

  for (i = paymentMethods.length - 1; i >= 0; i--) {
    this._addPaymentMethod(paymentMethods[i]);
  }
};

module.exports = PaymentMethodsView;

},{"../constants":117,"../lib/add-selection-event-handler":121,"../lib/classlist":126,"../lib/dropin-error":129,"../lib/promise":137,"./base-view":167,"./payment-method-view":170}],172:[function(require,module,exports){
'use strict';

var analytics = require('../lib/analytics');
var addSelectionEventHandler = require('../lib/add-selection-event-handler');
var BaseView = require('./base-view');

var paymentOptionIDs = require('../constants').paymentOptionIDs;

var paymentMethodOptionHTML = "<div class=\"braintree-option__logo\">\n  <svg width=\"48\" height=\"29\" class=\"@CLASSNAME\">\n    <use xlink:href=\"#@ICON\"></use>\n  </svg>\n</div>\n\n<div class=\"braintree-option__label\" aria-label=\"@OPTION_LABEL\">\n  @OPTION_TITLE\n  <div class=\"braintree-option__disabled-message\"></div>\n</div>\n";

function PaymentOptionsView() {
  BaseView.apply(this, arguments);

  this._initialize();
}

PaymentOptionsView.prototype = Object.create(BaseView.prototype);
PaymentOptionsView.prototype.constructor = PaymentOptionsView;
PaymentOptionsView.ID = PaymentOptionsView.prototype.ID = 'options';

PaymentOptionsView.prototype._initialize = function () {
  this.container = this.getElementById('payment-options-container');
  this.elements = {};

  this.model.supportedPaymentOptions.forEach(function (paymentOptionID) {
    this._addPaymentOption(paymentOptionID);
  }.bind(this));
};

PaymentOptionsView.prototype._addPaymentOption = function (paymentOptionID) {
  var paymentSource;
  var div = document.createElement('div');
  var html = paymentMethodOptionHTML;
  var clickHandler = function clickHandler() {
    this.mainView.setPrimaryView(paymentOptionID);
    this.model.selectPaymentOption(paymentOptionID);
    analytics.sendEvent(this.client, 'selected.' + paymentOptionIDs[paymentOptionID]);
  }.bind(this);

  div.className = 'braintree-option braintree-option__' + paymentOptionID;
  div.setAttribute('tabindex', '0');

  switch (paymentOptionID) {
    case paymentOptionIDs.applePay:
      paymentSource = this.strings['Apple Pay'];
      html = html.replace(/@ICON/g, 'logoApplePay');
      break;
    case paymentOptionIDs.card:
      paymentSource = this.strings.Card;
      html = html.replace(/@ICON/g, 'iconCardFront');
      html = html.replace(/@CLASSNAME/g, 'braintree-icon--bordered');
      break;
    case paymentOptionIDs.googlePay:
      paymentSource = this.strings['Google Pay'];
      html = html.replace(/@ICON/g, 'logoGooglePay');
      break;
    case paymentOptionIDs.paypal:
      paymentSource = this.strings.PayPal;
      html = html.replace(/@ICON/g, 'logoPayPal');
      break;
    case paymentOptionIDs.paypalCredit:
      paymentSource = this.strings['PayPal Credit'];
      html = html.replace(/@ICON/g, 'logoPayPalCredit');
      break;
    case paymentOptionIDs.venmo:
      paymentSource = this.strings.Venmo;
      html = html.replace(/@ICON/g, 'logoVenmo');
      break;
    default:
      break;
  }

  html = html.replace(/@OPTION_LABEL/g, this._generateOptionLabel(paymentSource));
  html = html.replace(/@OPTION_TITLE/g, paymentSource);
  html = html.replace(/@CLASSNAME/g, '');

  div.innerHTML = html;

  addSelectionEventHandler(div, clickHandler);

  this.container.appendChild(div);
  this.elements[paymentOptionID] = {
    div: div,
    clickHandler: clickHandler
  };
};

PaymentOptionsView.prototype._generateOptionLabel = function (paymentSourceString) {
  return this.strings.payingWith.replace('{{paymentSource}}', paymentSourceString);
};

module.exports = PaymentOptionsView;

},{"../constants":117,"../lib/add-selection-event-handler":121,"../lib/analytics":122,"./base-view":167}],173:[function(require,module,exports){
(function (global){
'use strict';

var assign = require('../../lib/assign').assign;
var BaseView = require('../base-view');
var btApplePay = require('braintree-web/apple-pay');
var DropinError = require('../../lib/dropin-error');
var isHTTPS = require('../../lib/is-https');
var Promise = require('../../lib/promise');
var paymentOptionIDs = require('../../constants').paymentOptionIDs;

function ApplePayView() {
  BaseView.apply(this, arguments);
}

ApplePayView.prototype = Object.create(BaseView.prototype);
ApplePayView.prototype.constructor = ApplePayView;
ApplePayView.ID = ApplePayView.prototype.ID = paymentOptionIDs.applePay;

ApplePayView.prototype.initialize = function () {
  var self = this;

  self.applePayConfiguration = assign({}, self.model.merchantConfiguration.applePay);

  self.model.asyncDependencyStarting();

  return btApplePay.create({client: this.client}).then(function (applePayInstance) {
    var buttonDiv = self.getElementById('apple-pay-button');

    self.applePayInstance = applePayInstance;

    self.model.on('changeActivePaymentView', function (paymentViewID) {
      if (paymentViewID !== self.ID) {
        return;
      }

      global.ApplePaySession.canMakePaymentsWithActiveCard(self.applePayInstance.merchantIdentifier).then(function (canMakePayments) {
        if (!canMakePayments) {
          self.model.reportError('applePayActiveCardError');
        }
      });
    });

    buttonDiv.onclick = self._showPaymentSheet.bind(self);
    buttonDiv.style['-apple-pay-button-style'] = self.model.merchantConfiguration.applePay.buttonStyle || 'black';

    self.model.asyncDependencyReady();
  }).catch(function (err) {
    self.model.asyncDependencyFailed({
      view: self.ID,
      error: new DropinError(err)
    });
  });
};

ApplePayView.prototype._showPaymentSheet = function () {
  var self = this;
  var request = self.applePayInstance.createPaymentRequest(this.applePayConfiguration.paymentRequest);
  var session = new global.ApplePaySession(2, request);

  session.onvalidatemerchant = function (event) {
    self.applePayInstance.performValidation({
      validationURL: event.validationURL,
      displayName: self.applePayConfiguration.displayName
    }).then(function (validationData) {
      session.completeMerchantValidation(validationData);
    }).catch(function (validationErr) {
      self.model.reportError(validationErr);
      session.abort();
    });
  };

  session.onpaymentauthorized = function (event) {
    self.applePayInstance.tokenize({
      token: event.payment.token
    }).then(function (payload) {
      session.completePayment(global.ApplePaySession.STATUS_SUCCESS);
      payload.payment = event.payment;
      self.model.addPaymentMethod(payload);
    }).catch(function (tokenizeErr) {
      self.model.reportError(tokenizeErr);
      session.completePayment(global.ApplePaySession.STATUS_FAILURE);
    });
  };

  session.begin();

  return false;
};

ApplePayView.prototype.updateConfiguration = function (key, value) {
  this.applePayConfiguration[key] = value;
};

ApplePayView.isEnabled = function (options) {
  var gatewayConfiguration = options.client.getConfiguration().gatewayConfiguration;
  var applePayEnabled = gatewayConfiguration.applePayWeb && Boolean(options.merchantConfiguration.applePay);
  var applePayBrowserSupported;

  if (!applePayEnabled) {
    return Promise.resolve(false);
  }

  applePayBrowserSupported = global.ApplePaySession && isHTTPS.isHTTPS();

  if (!applePayBrowserSupported) {
    return Promise.resolve(false);
  }

  return Promise.resolve(Boolean(global.ApplePaySession.canMakePayments()));
};

module.exports = ApplePayView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../constants":117,"../../lib/assign":124,"../../lib/dropin-error":129,"../../lib/is-https":133,"../../lib/promise":137,"../base-view":167,"braintree-web/apple-pay":24}],174:[function(require,module,exports){
(function (global){
'use strict';

var analytics = require('../../lib/analytics');
var assign = require('../../lib/assign').assign;
var browserDetection = require('../../lib/browser-detection');
var BaseView = require('../base-view');
var btPaypal = require('braintree-web/paypal-checkout');
var DropinError = require('../../lib/dropin-error');
var constants = require('../../constants');
var assets = require('../../lib/assets');
var translations = require('../../translations').fiveCharacterLocales;
var Promise = require('../../lib/promise');

var ASYNC_DEPENDENCY_TIMEOUT = 30000;
var READ_ONLY_CONFIGURATION_OPTIONS = ['offerCredit', 'locale'];
var DEFAULT_CHECKOUTJS_LOG_LEVEL = 'warn';

var paypalScriptLoadInProgressPromise;

function BasePayPalView() {
  BaseView.apply(this, arguments);
}

BasePayPalView.prototype = Object.create(BaseView.prototype);

BasePayPalView.prototype.initialize = function () {
  var asyncDependencyTimeoutHandler;
  var isCredit = Boolean(this._isPayPalCredit);
  var setupComplete = false;
  var self = this;
  var paypalType = isCredit ? 'paypalCredit' : 'paypal';
  var paypalConfiguration = this.model.merchantConfiguration[paypalType];

  this.paypalConfiguration = assign({}, paypalConfiguration);

  this.model.asyncDependencyStarting();
  asyncDependencyTimeoutHandler = setTimeout(function () {
    self.model.asyncDependencyFailed({
      view: self.ID,
      error: new DropinError('There was an error connecting to PayPal.')
    });
  }, ASYNC_DEPENDENCY_TIMEOUT);

  return btPaypal.create({client: this.client}).then(function (paypalInstance) {
    var checkoutJSConfiguration;
    var buttonSelector = '[data-braintree-id="paypal-button"]';
    var environment = self.client.getConfiguration().gatewayConfiguration.environment === 'production' ? 'production' : 'sandbox';
    var locale = self.model.merchantConfiguration.locale;

    self.paypalInstance = paypalInstance;

    self.paypalConfiguration.offerCredit = Boolean(isCredit);
    checkoutJSConfiguration = {
      env: environment,
      style: self.paypalConfiguration.buttonStyle || {},
      commit: self.paypalConfiguration.commit,
      payment: function () {
        return paypalInstance.createPayment(self.paypalConfiguration).catch(reportError);
      },
      onAuthorize: function (data) {
        return paypalInstance.tokenizePayment(data).then(function (tokenizePayload) {
          if (self.paypalConfiguration.flow === 'vault' && !self.model.isGuestCheckout) {
            tokenizePayload.vaulted = true;
          }
          self.model.addPaymentMethod(tokenizePayload);
        }).catch(reportError);
      },
      onError: reportError
    };

    if (locale && locale in translations) {
      self.paypalConfiguration.locale = locale;
      checkoutJSConfiguration.locale = locale;
    }

    if (isCredit) {
      buttonSelector = '[data-braintree-id="paypal-credit-button"]';
      checkoutJSConfiguration.style.label = 'credit';
    }

    return global.paypal.Button.render(checkoutJSConfiguration, buttonSelector).then(function () {
      self.model.asyncDependencyReady();
      setupComplete = true;
      clearTimeout(asyncDependencyTimeoutHandler);
    });
  }).catch(reportError);

  function reportError(err) {
    if (setupComplete) {
      self.model.reportError(err);
    } else {
      self.model.asyncDependencyFailed({
        view: self.ID,
        error: err
      });
      clearTimeout(asyncDependencyTimeoutHandler);
    }
  }
};

BasePayPalView.prototype.updateConfiguration = function (key, value) {
  if (READ_ONLY_CONFIGURATION_OPTIONS.indexOf(key) === -1) {
    this.paypalConfiguration[key] = value;
  }
};

BasePayPalView.isEnabled = function (options) {
  var gatewayConfiguration = options.client.getConfiguration().gatewayConfiguration;

  if (!gatewayConfiguration.paypalEnabled) {
    return Promise.resolve(false);
  }

  if (browserDetection.isIe9() || browserDetection.isIe10()) {
    analytics.sendEvent(options.client, options.viewID + '.checkout.js-browser-not-supported');

    return Promise.resolve(false);
  }

  if (global.paypal && global.paypal.Button) {
    return Promise.resolve(true);
  }

  if (paypalScriptLoadInProgressPromise) {
    return paypalScriptLoadInProgressPromise;
  }

  paypalScriptLoadInProgressPromise = assets.loadScript({
    src: constants.CHECKOUT_JS_SOURCE,
    id: constants.PAYPAL_CHECKOUT_SCRIPT_ID,
    dataAttributes: {
      'log-level': options.merchantConfiguration.paypal.logLevel || DEFAULT_CHECKOUTJS_LOG_LEVEL
    }
  }).then(function () {
    return Promise.resolve(true);
  }).catch(function () {
    return Promise.resolve(false);
  }).then(function (result) {
    paypalScriptLoadInProgressPromise = null;

    return Promise.resolve(result);
  });

  return paypalScriptLoadInProgressPromise;
};

module.exports = BasePayPalView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../constants":117,"../../lib/analytics":122,"../../lib/assets":123,"../../lib/assign":124,"../../lib/browser-detection":125,"../../lib/dropin-error":129,"../../lib/promise":137,"../../translations":152,"../base-view":167,"braintree-web/paypal-checkout":93}],175:[function(require,module,exports){
'use strict';

var assign = require('../../lib/assign').assign;

var BaseView = require('../base-view');
var classlist = require('../../lib/classlist');
var constants = require('../../constants');
var DropinError = require('../../lib/dropin-error');
var hostedFields = require('braintree-web/hosted-fields');
var isUtf8 = require('../../lib/is-utf-8');
var transitionHelper = require('../../lib/transition-helper');
var Promise = require('../../lib/promise');

var cardIconHTML = "<div data-braintree-id=\"visa-card-icon\" class=\"braintree-sheet__card-icon\">\n    <svg width=\"40\" height=\"24\">\n        <use xlink:href=\"#icon-visa\"></use>\n    </svg>\n</div>\n<div data-braintree-id=\"master-card-card-icon\" class=\"braintree-sheet__card-icon\">\n    <svg width=\"40\" height=\"24\">\n        <use xlink:href=\"#icon-master-card\"></use>\n    </svg>\n</div>\n<div data-braintree-id=\"unionpay-card-icon\" class=\"braintree-sheet__card-icon braintree-hidden\">\n    <svg width=\"40\" height=\"24\">\n        <use xlink:href=\"#icon-unionpay\"></use>\n    </svg>\n</div>\n<div data-braintree-id=\"american-express-card-icon\" class=\"braintree-sheet__card-icon\">\n    <svg width=\"40\" height=\"24\">\n        <use xlink:href=\"#icon-american-express\"></use>\n    </svg>\n</div>\n<div data-braintree-id=\"jcb-card-icon\" class=\"braintree-sheet__card-icon\">\n    <svg width=\"40\" height=\"24\">\n        <use xlink:href=\"#icon-jcb\"></use>\n    </svg>\n</div>\n<!-- Remove braintree-hidden class when supportedCardType accurately indicates Diners Club support -->\n<div data-braintree-id=\"diners-club-card-icon\" class=\"braintree-sheet__card-icon braintree-hidden\">\n    <svg width=\"40\" height=\"24\">\n        <use xlink:href=\"#icon-diners-club\"></use>\n    </svg>\n</div>\n<div data-braintree-id=\"discover-card-icon\" class=\"braintree-sheet__card-icon\">\n    <svg width=\"40\" height=\"24\">\n        <use xlink:href=\"#icon-discover\"></use>\n    </svg>\n</div>\n<div data-braintree-id=\"maestro-card-icon\" class=\"braintree-sheet__card-icon\">\n    <svg width=\"40\" height=\"24\">\n        <use xlink:href=\"#icon-maestro\"></use>\n    </svg>\n</div>\n";

function CardView() {
  BaseView.apply(this, arguments);
}

CardView.prototype = Object.create(BaseView.prototype);
CardView.prototype.constructor = CardView;
CardView.ID = CardView.prototype.ID = constants.paymentOptionIDs.card;

CardView.prototype.initialize = function () {
  var cvvFieldGroup, postalCodeFieldGroup;
  var cardholderNameField = this.getElementById('cardholder-name-field-group');
  var cardIcons = this.getElementById('card-view-icons');
  var hfOptions = this._generateHostedFieldsOptions();

  cardIcons.innerHTML = cardIconHTML;
  this._hideUnsupportedCardIcons();

  this.hasCVV = hfOptions.fields.cvv;
  this.hasCardholderName = Boolean(this.model.merchantConfiguration.card && this.model.merchantConfiguration.card.cardholderName);
  this.cardholderNameInput = cardholderNameField.querySelector('input');
  this.cardNumberIcon = this.getElementById('card-number-icon');
  this.cardNumberIconSvg = this.getElementById('card-number-icon-svg');
  this.cvvIcon = this.getElementById('cvv-icon');
  this.cvvIconSvg = this.getElementById('cvv-icon-svg');
  this.cvvLabelDescriptor = this.getElementById('cvv-label-descriptor');
  this.fieldErrors = {};
  this.extraInputs = [
    {
      fieldName: 'cardholderName',
      enabled: this.hasCardholderName,
      required: this.hasCardholderName && this.model.merchantConfiguration.card.cardholderName.required,
      requiredError: this.strings.fieldEmptyForCardholderName,
      validations: [
        {
          isValid: function (value) {
            return value.length < 256;
          },
          error: this.strings.fieldTooLongForCardholderName
        }
      ]
    }
  ];

  if (!this.hasCVV) {
    cvvFieldGroup = this.getElementById('cvv-field-group');
    cvvFieldGroup.parentNode.removeChild(cvvFieldGroup);
  }

  if (!hfOptions.fields.postalCode) {
    postalCodeFieldGroup = this.getElementById('postal-code-field-group');
    postalCodeFieldGroup.parentNode.removeChild(postalCodeFieldGroup);
  }

  this.extraInputs.forEach(function (extraInput) {
    if (extraInput.enabled) {
      this._setupExtraInput(extraInput);
    } else {
      this._removeExtraInput(extraInput);
    }
  }.bind(this));

  this.model.asyncDependencyStarting();

  return hostedFields.create(hfOptions).then(function (hostedFieldsInstance) {
    this.hostedFieldsInstance = hostedFieldsInstance;
    this.hostedFieldsInstance.on('blur', this._onBlurEvent.bind(this));
    this.hostedFieldsInstance.on('cardTypeChange', this._onCardTypeChangeEvent.bind(this));
    this.hostedFieldsInstance.on('focus', this._onFocusEvent.bind(this));
    this.hostedFieldsInstance.on('notEmpty', this._onNotEmptyEvent.bind(this));
    this.hostedFieldsInstance.on('validityChange', this._onValidityChangeEvent.bind(this));

    this.model.asyncDependencyReady();
  }.bind(this)).catch(function (err) {
    this.model.asyncDependencyFailed({
      view: this.ID,
      error: err
    });
  }.bind(this));
};

CardView.prototype._setupExtraInput = function (extraInput) {
  var self = this;
  var fieldNameKebab = camelCaseToKebabCase(extraInput.fieldName);
  var field = this.getElementById(fieldNameKebab + '-field-group');
  var input = field.querySelector('input');
  var nameContainer = field.querySelector('.braintree-form__hosted-field');

  input.addEventListener('keyup', function () {
    var valid = self._validateExtraInput(extraInput, true);

    classlist.toggle(nameContainer, 'braintree-form__field--valid', valid);

    if (valid) {
      self.hideFieldError(extraInput.fieldName);
    }

    self._sendRequestableEvent();
  }, false);

  if (extraInput.required) {
    input.addEventListener('blur', function () {
      // the active element inside the blur event is the document.body
      // by taking it out of the event loop, we can detect the new
      // active element (hosted field or other card view element)
      setTimeout(function () {
        if (isCardViewElement()) {
          self._validateExtraInput(extraInput, true);
        }
      }, 0);
    }, false);
  }
};

CardView.prototype._removeExtraInput = function (extraInput) {
  var field = this.getElementById(camelCaseToKebabCase(extraInput.fieldName) + '-field-group');

  field.parentNode.removeChild(field);
};

CardView.prototype._sendRequestableEvent = function () {
  if (!this._isTokenizing) {
    this.model.setPaymentMethodRequestable({
      isRequestable: this._validateForm(),
      type: constants.paymentMethodTypes.card
    });
  }
};

CardView.prototype._generateHostedFieldsOptions = function () {
  var challenges = this.client.getConfiguration().gatewayConfiguration.challenges;
  var hasCVVChallenge = challenges.indexOf('cvv') !== -1;
  var hasPostalCodeChallenge = challenges.indexOf('postal_code') !== -1;
  var overrides = this.model.merchantConfiguration.card && this.model.merchantConfiguration.card.overrides;
  var options = {
    client: this.client,
    fields: {
      number: {
        selector: this._generateFieldSelector('number'),
        placeholder: generateCardNumberPlaceholder()
      },
      expirationDate: {
        selector: this._generateFieldSelector('expiration'),
        placeholder: this.strings.expirationDatePlaceholder
      },
      cvv: {
        selector: this._generateFieldSelector('cvv'),
        placeholder: addBullets(3)
      },
      postalCode: {
        selector: this._generateFieldSelector('postal-code')
      }
    },
    styles: {
      input: {
        'font-size': '16px',
        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        color: '#000'
      },
      ':focus': {
        color: 'black'
      },
      '::-webkit-input-placeholder': {
        color: '#6a6a6a'
      },
      ':-moz-placeholder': {
        color: '#6a6a6a'
      },
      '::-moz-placeholder': {
        color: '#6a6a6a'
      },
      ':-ms-input-placeholder ': {
        color: '#6a6a6a'
      },
      'input::-ms-clear': {
        color: 'transparent'
      }
    }
  };

  if (!hasCVVChallenge) {
    delete options.fields.cvv;
  }

  if (!hasPostalCodeChallenge) {
    delete options.fields.postalCode;
  }

  if (!overrides) { return options; }

  if (overrides.fields) {
    if (overrides.fields.cvv && overrides.fields.cvv.placeholder) {
      this._hasCustomCVVPlaceholder = true;
    }

    Object.keys(overrides.fields).forEach(function (field) {
      if ((field === 'cvv' || field === 'postalCode') && overrides.fields[field] === null) {
        delete options.fields[field];

        return;
      }

      if (!options.fields[field]) {
        return;
      }

      assign(options.fields[field], overrides.fields[field], {
        selector: options.fields[field].selector
      });
    });
  }

  if (overrides.styles) {
    Object.keys(overrides.styles).forEach(function (style) {
      if (overrides.styles[style] === null) {
        delete options.styles[style];

        return;
      }

      normalizeStyles(overrides.styles[style]);
      options.styles[style] = options.styles[style] || {};

      assign(options.styles[style], overrides.styles[style]);
    });
  }

  return options;
};

CardView.prototype._validateForm = function (showFieldErrors) {
  var cardType, cardTypeSupported, state;
  var isValid = true;
  var supportedCardTypes = this.client.getConfiguration().gatewayConfiguration.creditCards.supportedCardTypes;

  if (!this.hostedFieldsInstance) {
    return false;
  }

  state = this.hostedFieldsInstance.getState();

  Object.keys(state.fields).forEach(function (key) {
    var field = state.fields[key];

    if (!showFieldErrors && !isValid) {
      // return early if form is already invalid
      // and we don't need to display all field errors
      return;
    }

    if (field.isEmpty) {
      isValid = false;

      if (showFieldErrors) {
        this.showFieldError(key, this.strings['fieldEmptyFor' + capitalize(key)]);
      }
    } else if (!field.isValid) {
      isValid = false;

      if (showFieldErrors) {
        this.showFieldError(key, this.strings['fieldInvalidFor' + capitalize(key)]);
      }
    }
  }.bind(this));

  if (state.fields.number.isValid) {
    cardType = constants.configurationCardTypes[state.cards[0].type];
    cardTypeSupported = supportedCardTypes.indexOf(cardType) !== -1;

    if (!cardTypeSupported) {
      isValid = false;

      if (showFieldErrors) {
        this.showFieldError('number', this.strings.unsupportedCardTypeError);
      }
    }
  }

  if (this.extraInputs) {
    this.extraInputs.forEach(function (extraInput) {
      var fieldIsValid;

      if (!extraInput.enabled) {
        return;
      }

      fieldIsValid = this._validateExtraInput(extraInput, showFieldErrors);

      isValid = isValid && fieldIsValid;
    }.bind(this));
  }

  return isValid;
};

CardView.prototype._validateExtraInput = function (extraInput, showFieldError) {
  var fieldNameKebab = camelCaseToKebabCase(extraInput.fieldName);
  var field = this.getElementById(fieldNameKebab + '-field-group');
  var input = field.querySelector('input');
  var valid = true;

  if (extraInput.required) {
    valid = input.value.length > 0;

    if (!valid && showFieldError) {
      this.showFieldError(extraInput.fieldName, extraInput.requiredError);
    }
  }

  extraInput.validations.forEach(function (validation) {
    var validationPassed = validation.isValid(input.value);

    if (!validationPassed && showFieldError) {
      this.showFieldError(extraInput.fieldName, validation.error);
    }

    valid = valid && validationPassed;
  }.bind(this));

  return valid;
};

CardView.prototype.getPaymentMethod = function () { // eslint-disable-line consistent-return
  var formIsValid = this._validateForm();

  if (formIsValid) {
    return {
      type: constants.paymentMethodTypes.card
    };
  }
};

CardView.prototype.tokenize = function () {
  var transitionCallback;
  var self = this;
  var state = self.hostedFieldsInstance.getState();
  var tokenizeOptions = {
    vault: !self.model.isGuestCheckout
  };

  this.model.clearError();

  if (!this._validateForm(true)) {
    self.model.reportError('hostedFieldsFieldsInvalidError');
    self.allowUserAction();

    return Promise.reject(new DropinError(constants.errors.NO_PAYMENT_METHOD_ERROR));
  }

  if (this.hasCardholderName) {
    tokenizeOptions.cardholderName = this.cardholderNameInput.value;
  }

  self._isTokenizing = true;

  return self.hostedFieldsInstance.tokenize(tokenizeOptions).then(function (payload) {
    var retainCardFields = self.model.merchantConfiguration.card &&
      self.model.merchantConfiguration.card.clearFieldsAfterTokenization === false;

    if (!retainCardFields) {
      Object.keys(state.fields).forEach(function (field) {
        self.hostedFieldsInstance.clear(field);
      });

      if (self.hasCardholderName) {
        self.cardholderNameInput.value = '';
      }
    }

    if (!self.model.isGuestCheckout) {
      payload.vaulted = true;
    }

    return new Promise(function (resolve) {
      transitionCallback = function () {
        // Wait for braintree-sheet--tokenized class to be added in IE 9
        // before attempting to remove it
        setTimeout(function () {
          self.model.addPaymentMethod(payload);
          resolve(payload);
          classlist.remove(self.element, 'braintree-sheet--tokenized');
        }, 0);
        self._isTokenizing = false;
      };

      transitionHelper.onTransitionEnd(self.element, 'max-height', transitionCallback);

      setTimeout(function () {
        self.allowUserAction();
      }, constants.CHANGE_ACTIVE_PAYMENT_METHOD_TIMEOUT);

      classlist.add(self.element, 'braintree-sheet--tokenized');
    });
  }).catch(function (err) {
    self._isTokenizing = false;
    // this is a little magical, but if the code property exists
    // in the translations with the word Error appended to the end,
    // then reportError will automatically print that translation.
    // See https://github.com/braintree/braintree-web-drop-in/blob/6ecba73f2f16e8b7ae2119702ac162a1a985908e/src/views/main-view.js#L255-L256
    self.model.reportError(err);
    self.allowUserAction();

    return Promise.reject(new DropinError({
      message: constants.errors.NO_PAYMENT_METHOD_ERROR,
      braintreeWebError: err
    }));
  });
};

CardView.prototype.showFieldError = function (field, errorMessage) {
  var fieldError;
  var fieldGroup = this.getElementById(camelCaseToKebabCase(field) + '-field-group');
  var input = fieldGroup.querySelector('input');

  if (!this.fieldErrors.hasOwnProperty(field)) {
    this.fieldErrors[field] = this.getElementById(camelCaseToKebabCase(field) + '-field-error');
  }

  classlist.add(fieldGroup, 'braintree-form__field-group--has-error');

  fieldError = this.fieldErrors[field];
  fieldError.innerHTML = errorMessage;

  if (input && isNormalFieldElement(input)) {
    input.setAttribute('aria-invalid', true);
  } else {
    this.hostedFieldsInstance.setAttribute({
      field: field,
      attribute: 'aria-invalid',
      value: true
    });
    this.hostedFieldsInstance.setMessage({
      field: field,
      message: errorMessage
    });
  }
};

CardView.prototype.hideFieldError = function (field) {
  var fieldGroup = this.getElementById(camelCaseToKebabCase(field) + '-field-group');
  var input = fieldGroup.querySelector('input');

  if (!this.fieldErrors.hasOwnProperty(field)) {
    this.fieldErrors[field] = this.getElementById(camelCaseToKebabCase(field) + '-field-error');
  }

  classlist.remove(fieldGroup, 'braintree-form__field-group--has-error');

  if (input && isNormalFieldElement(input)) {
    input.removeAttribute('aria-invalid');
  } else {
    this.hostedFieldsInstance.removeAttribute({
      field: field,
      attribute: 'aria-invalid'
    });
    this.hostedFieldsInstance.setMessage({
      field: field,
      message: ''
    });
  }
};

CardView.prototype.teardown = function () {
  return this.hostedFieldsInstance.teardown();
};

CardView.prototype._generateFieldSelector = function (field) {
  return '#braintree--dropin__' + this.model.componentID + ' .braintree-form-' + field;
};

CardView.prototype._onBlurEvent = function (event) {
  var field = event.fields[event.emittedBy];
  var fieldGroup = this.getElementById(camelCaseToKebabCase(event.emittedBy) + '-field-group');

  classlist.remove(fieldGroup, 'braintree-form__field-group--is-focused');

  if (shouldApplyFieldEmptyError(field)) {
    this.showFieldError(event.emittedBy, this.strings['fieldEmptyFor' + capitalize(event.emittedBy)]);
  } else if (!field.isEmpty && !field.isValid) {
    this.showFieldError(event.emittedBy, this.strings['fieldInvalidFor' + capitalize(event.emittedBy)]);
  } else if (event.emittedBy === 'number' && !this._isCardTypeSupported(event.cards[0].type)) {
    this.showFieldError('number', this.strings.unsupportedCardTypeError);
  }

  setTimeout(function () {
    // when focusing on a field by clicking the label,
    // we need to wait a bit for the iframe to be
    // focused properly before applying validations
    if (shouldApplyFieldEmptyError(field)) {
      this.showFieldError(event.emittedBy, this.strings['fieldEmptyFor' + capitalize(event.emittedBy)]);
    }
  }.bind(this), 150);
};

CardView.prototype._onCardTypeChangeEvent = function (event) {
  var cardType;
  var cardNumberHrefLink = '#iconCardFront';
  var cvvHrefLink = '#iconCVVBack';
  var cvvDescriptor = this.strings.cvvThreeDigitLabelSubheading;
  var cvvPlaceholder = addBullets(3);
  var numberFieldGroup = this.getElementById('number-field-group');

  if (event.cards.length === 1) {
    cardType = event.cards[0].type;
    cardNumberHrefLink = '#icon-' + cardType;
    if (cardType === 'american-express') {
      cvvHrefLink = '#iconCVVFront';
      cvvDescriptor = this.strings.cvvFourDigitLabelSubheading;
      cvvPlaceholder = addBullets(4);
    }
    // Keep icon visible when field is not focused
    classlist.add(numberFieldGroup, 'braintree-form__field-group--card-type-known');
  } else {
    classlist.remove(numberFieldGroup, 'braintree-form__field-group--card-type-known');
  }

  this.cardNumberIconSvg.setAttribute('xlink:href', cardNumberHrefLink);

  if (this.hasCVV) {
    this.cvvIconSvg.setAttribute('xlink:href', cvvHrefLink);
    this.cvvLabelDescriptor.innerHTML = cvvDescriptor;

    if (!this._hasCustomCVVPlaceholder) {
      this.hostedFieldsInstance.setAttribute({
        field: 'cvv',
        attribute: 'placeholder',
        value: cvvPlaceholder
      });
    }
  }
};

CardView.prototype._onFocusEvent = function (event) {
  var fieldGroup = this.getElementById(camelCaseToKebabCase(event.emittedBy) + '-field-group');

  classlist.add(fieldGroup, 'braintree-form__field-group--is-focused');
};

CardView.prototype._onNotEmptyEvent = function (event) {
  this.hideFieldError(event.emittedBy);
};

CardView.prototype._onValidityChangeEvent = function (event) {
  var isValid;
  var field = event.fields[event.emittedBy];

  if (event.emittedBy === 'number' && event.cards[0]) {
    isValid = field.isValid && this._isCardTypeSupported(event.cards[0].type);
  } else {
    isValid = field.isValid;
  }

  classlist.toggle(field.container, 'braintree-form__field--valid', isValid);

  if (field.isPotentiallyValid) {
    this.hideFieldError(event.emittedBy);
  }

  this._sendRequestableEvent();
};

CardView.prototype.requestPaymentMethod = function () {
  this.preventUserAction();

  return this.tokenize();
};

CardView.prototype.onSelection = function () {
  if (!this.hostedFieldsInstance) {
    return;
  }

  if (this.hasCardholderName) {
    setTimeout(function () { // wait until input is visible
      this.cardholderNameInput.focus();
    }.bind(this), 1);
  } else {
    this.hostedFieldsInstance.focus('number');
  }
};

CardView.prototype._hideUnsupportedCardIcons = function () {
  var supportedCardTypes = this.client.getConfiguration().gatewayConfiguration.creditCards.supportedCardTypes;

  Object.keys(constants.configurationCardTypes).forEach(function (paymentMethodCardType) {
    var cardIcon;
    var configurationCardType = constants.configurationCardTypes[paymentMethodCardType];

    if (supportedCardTypes.indexOf(configurationCardType) === -1) {
      cardIcon = this.getElementById(paymentMethodCardType + '-card-icon');
      classlist.add(cardIcon, 'braintree-hidden');
    }
  }.bind(this));
};

CardView.prototype._isCardTypeSupported = function (cardType) {
  var configurationCardType = constants.configurationCardTypes[cardType];
  var supportedCardTypes = this.client.getConfiguration().gatewayConfiguration.creditCards.supportedCardTypes;

  return supportedCardTypes.indexOf(configurationCardType) !== -1;
};

CardView.isEnabled = function (options) {
  var gatewayConfiguration = options.client.getConfiguration().gatewayConfiguration;

  return Promise.resolve(gatewayConfiguration.creditCards.supportedCardTypes.length > 0);
};

function isNormalFieldElement(element) {
  return element.id.indexOf('braintree__card-view-input') !== -1;
}

function shouldApplyFieldEmptyError(field) {
  return field.isEmpty && isCardViewElement();
}

function isCardViewElement() {
  var activeId = document.activeElement && document.activeElement.id;
  var isHostedFieldsElement = document.activeElement instanceof HTMLIFrameElement && activeId.indexOf('braintree-hosted-field') !== -1;

  return isHostedFieldsElement || isNormalFieldElement(document.activeElement);
}

function camelCaseToKebabCase(string) {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function capitalize(string) {
  return string[0].toUpperCase() + string.substr(1);
}

function normalizeStyles(styles) {
  Object.keys(styles).forEach(function (style) {
    var transformedKeyName = camelCaseToKebabCase(style);

    styles[transformedKeyName] = styles[style];
  });
}

function addBullets(number) {
  var bulletCharacter = isUtf8() ? '•' : '*';

  return Array(number + 1).join(bulletCharacter);
}

function generateCardNumberPlaceholder() {
  var four = addBullets(4);

  return [four, four, four, four].join(' ');
}

module.exports = CardView;

},{"../../constants":117,"../../lib/assign":124,"../../lib/classlist":126,"../../lib/dropin-error":129,"../../lib/is-utf-8":134,"../../lib/promise":137,"../../lib/transition-helper":141,"../base-view":167,"braintree-web/hosted-fields":55}],176:[function(require,module,exports){
(function (global){
'use strict';

var assign = require('../../lib/assign').assign;
var BaseView = require('../base-view');
var btGooglePay = require('braintree-web/google-payment');
var DropinError = require('../../lib/dropin-error');
var constants = require('../../constants');
var assets = require('../../lib/assets');
var Promise = require('../../lib/promise');
var analytics = require('../../lib/analytics');

function GooglePayView() {
  BaseView.apply(this, arguments);
}

GooglePayView.prototype = Object.create(BaseView.prototype);
GooglePayView.prototype.constructor = GooglePayView;
GooglePayView.ID = GooglePayView.prototype.ID = constants.paymentOptionIDs.googlePay;

GooglePayView.prototype.initialize = function () {
  var self = this;

  self.googlePayConfiguration = assign({}, self.model.merchantConfiguration.googlePay);

  self.model.asyncDependencyStarting();

  return btGooglePay.create({client: self.client}).then(function (googlePayInstance) {
    self.googlePayInstance = googlePayInstance;
    self.paymentsClient = createPaymentsClient(self.client);
  }).then(function () {
    var buttonDiv = self.getElementById('google-pay-button');

    buttonDiv.addEventListener('click', function (event) {
      event.preventDefault();

      self.preventUserAction();

      self.tokenize().then(function () {
        self.allowUserAction();
      });
    });
    self.model.asyncDependencyReady();
  }).catch(function (err) {
    self.model.asyncDependencyFailed({
      view: self.ID,
      error: new DropinError(err)
    });
  });
};

GooglePayView.prototype.tokenize = function () {
  var self = this;
  var paymentDataRequest = self.googlePayInstance.createPaymentDataRequest(self.googlePayConfiguration);
  var rawPaymentData;

  return self.paymentsClient.loadPaymentData(paymentDataRequest).then(function (paymentData) {
    rawPaymentData = paymentData;

    return self.googlePayInstance.parseResponse(paymentData);
  }).then(function (tokenizePayload) {
    tokenizePayload.rawPaymentData = rawPaymentData;
    self.model.addPaymentMethod(tokenizePayload);
  }).catch(function (err) {
    var reportedError = err;

    if (err.statusCode === 'DEVELOPER_ERROR') {
      console.error(err); // eslint-disable-line no-console
      reportedError = 'developerError';
    } else if (err.statusCode === 'CANCELED') {
      analytics.sendEvent(self.client, 'googlepay.loadPaymentData.canceled');

      return;
    } else if (err.statusCode) {
      analytics.sendEvent(self.client, 'googlepay.loadPaymentData.failed');
    }

    self.model.reportError(reportedError);
  });
};

GooglePayView.prototype.updateConfiguration = function (key, value) {
  this.googlePayConfiguration[key] = value;
};

GooglePayView.isEnabled = function (options) {
  var gatewayConfiguration = options.client.getConfiguration().gatewayConfiguration;

  if (!(gatewayConfiguration.androidPay && Boolean(options.merchantConfiguration.googlePay))) {
    return Promise.resolve(false);
  }

  return Promise.resolve().then(function () {
    if (!(global.google && global.google.payments && global.google.payments.api && global.google.payments.api.PaymentsClient)) {
      return assets.loadScript({
        id: constants.GOOGLE_PAYMENT_SCRIPT_ID,
        src: constants.GOOGLE_PAYMENT_SOURCE
      });
    }

    return Promise.resolve();
  }).then(function () {
    var paymentsClient = createPaymentsClient(options.client);

    return paymentsClient.isReadyToPay({
      allowedPaymentMethods: ['CARD', 'TOKENIZED_CARD']
    });
  }).then(function (response) {
    return Boolean(response.result);
  });
};

function createPaymentsClient(client) {
  return new global.google.payments.api.PaymentsClient({
    environment: client.getConfiguration().gatewayConfiguration.environment === 'production' ? 'PRODUCTION' : 'TEST'
  });
}

module.exports = GooglePayView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../constants":117,"../../lib/analytics":122,"../../lib/assets":123,"../../lib/assign":124,"../../lib/dropin-error":129,"../../lib/promise":137,"../base-view":167,"braintree-web/google-payment":49}],177:[function(require,module,exports){
'use strict';

var paymentOptionIDs = require('../../constants').paymentOptionIDs;

var result = {};

result[paymentOptionIDs.applePay] = require('./apple-pay-view');
result[paymentOptionIDs.card] = require('./card-view');
result[paymentOptionIDs.googlePay] = require('./google-pay-view');
result[paymentOptionIDs.paypal] = require('./paypal-view');
result[paymentOptionIDs.paypalCredit] = require('./paypal-credit-view');
result[paymentOptionIDs.venmo] = require('./venmo-view');

module.exports = result;

},{"../../constants":117,"./apple-pay-view":173,"./card-view":175,"./google-pay-view":176,"./paypal-credit-view":178,"./paypal-view":179,"./venmo-view":180}],178:[function(require,module,exports){
'use strict';

var assign = require('../../lib/assign').assign;
var Promise = require('../../lib/promise');
var paymentOptionIDs = require('../../constants').paymentOptionIDs;
var BasePayPalView = require('./base-paypal-view');

function PayPalCreditView() {
  BasePayPalView.apply(this, arguments);

  this._isPayPalCredit = true;
}

PayPalCreditView.prototype = Object.create(BasePayPalView.prototype);
PayPalCreditView.prototype.constructor = PayPalCreditView;
PayPalCreditView.ID = PayPalCreditView.prototype.ID = paymentOptionIDs.paypalCredit;

PayPalCreditView.isEnabled = function (options) {
  if (!options.merchantConfiguration.paypalCredit) {
    return Promise.resolve(false);
  }

  return BasePayPalView.isEnabled(assign({
    viewID: PayPalCreditView.ID
  }, options));
};
module.exports = PayPalCreditView;

},{"../../constants":117,"../../lib/assign":124,"../../lib/promise":137,"./base-paypal-view":174}],179:[function(require,module,exports){
'use strict';

var assign = require('../../lib/assign').assign;
var Promise = require('../../lib/promise');
var paymentOptionIDs = require('../../constants').paymentOptionIDs;
var BasePayPalView = require('./base-paypal-view');

function PayPalView() {
  BasePayPalView.apply(this, arguments);
}

PayPalView.prototype = Object.create(BasePayPalView.prototype);
PayPalView.prototype.constructor = PayPalView;
PayPalView.ID = PayPalView.prototype.ID = paymentOptionIDs.paypal;

PayPalView.isEnabled = function (options) {
  if (!options.merchantConfiguration.paypal) {
    return Promise.resolve(false);
  }

  return BasePayPalView.isEnabled(assign({
    viewID: PayPalView.ID
  }, options));
};

module.exports = PayPalView;

},{"../../constants":117,"../../lib/assign":124,"../../lib/promise":137,"./base-paypal-view":174}],180:[function(require,module,exports){
'use strict';

var assign = require('../../lib/assign').assign;
var BaseView = require('../base-view');
var btVenmo = require('braintree-web/venmo');
var DropinError = require('../../lib/dropin-error');
var Promise = require('../../lib/promise');
var paymentOptionIDs = require('../../constants').paymentOptionIDs;

function VenmoView() {
  BaseView.apply(this, arguments);
}

VenmoView.prototype = Object.create(BaseView.prototype);
VenmoView.prototype.constructor = VenmoView;
VenmoView.ID = VenmoView.prototype.ID = paymentOptionIDs.venmo;

VenmoView.prototype.initialize = function () {
  var self = this;
  var venmoConfiguration = assign({}, self.model.merchantConfiguration.venmo, {client: this.client});

  self.model.asyncDependencyStarting();

  return btVenmo.create(venmoConfiguration).then(function (venmoInstance) {
    self.venmoInstance = venmoInstance;

    if (!self.venmoInstance.hasTokenizationResult()) {
      return Promise.resolve();
    }

    return self.venmoInstance.tokenize().then(function (payload) {
      self.model.reportAppSwitchPayload(payload);
    }).catch(function (err) {
      if (self._isIgnorableError(err)) {
        return;
      }
      self.model.reportAppSwitchError(paymentOptionIDs.venmo, err);
    });
  }).then(function () {
    var button = self.getElementById('venmo-button');

    button.addEventListener('click', function (event) {
      event.preventDefault();

      self.preventUserAction();

      return self.venmoInstance.tokenize().then(function (payload) {
        self.model.addPaymentMethod(payload);
      }).catch(function (tokenizeErr) {
        if (self._isIgnorableError(tokenizeErr)) {
          return;
        }

        self.model.reportError(tokenizeErr);
      }).then(function () {
        self.allowUserAction();
      });
    });

    self.model.asyncDependencyReady();
  }).catch(function (err) {
    self.model.asyncDependencyFailed({
      view: self.ID,
      error: new DropinError(err)
    });
  });
};

VenmoView.prototype._isIgnorableError = function (error) {
  // customer cancels the flow in the app
  // we don't emit an error because the customer
  // initiated that action
  return error.code === 'VENMO_APP_CANCELED';
};

VenmoView.isEnabled = function (options) {
  var gatewayConfiguration = options.client.getConfiguration().gatewayConfiguration;
  var venmoEnabled = gatewayConfiguration.payWithVenmo && Boolean(options.merchantConfiguration.venmo);

  if (!venmoEnabled) {
    return Promise.resolve(false);
  }

  return Promise.resolve(btVenmo.isBrowserSupported(options.merchantConfiguration.venmo));
};

module.exports = VenmoView;

},{"../../constants":117,"../../lib/assign":124,"../../lib/dropin-error":129,"../../lib/promise":137,"../base-view":167,"braintree-web/venmo":104}]},{},[120])(120)
});
