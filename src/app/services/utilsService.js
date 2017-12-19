angular
    .module('bit.services')

    .factory('utilsService', function (constants) {
        var _service = {};
        var _browserCache;

        _service.getDeviceType = function (token) {
            if (_browserCache) {
                return _browserCache;
            }

            if (navigator.userAgent.indexOf(' Vivaldi/') >= 0) {
                _browserCache = constants.deviceType.vivaldi;
            }
            else if (!!window.chrome && !!window.chrome.webstore) {
                _browserCache = constants.deviceType.chrome;
            }
            else if (typeof InstallTrigger !== 'undefined') {
                _browserCache = constants.deviceType.firefox;
            }
            else if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
                _browserCache = constants.deviceType.firefox;
            }
            else if (/constructor/i.test(window.HTMLElement) ||
                safariCheck(!window.safari || (typeof safari !== 'undefined' && safari.pushNotification))) {
                _browserCache = constants.deviceType.opera;
            }
            else if (!!document.documentMode) {
                _browserCache = constants.deviceType.ie;
            }
            else if (!!window.StyleMedia) {
                _browserCache = constants.deviceType.edge;
            }
            else {
                _browserCache = constants.deviceType.unknown;
            }

            return _browserCache;
        };

        function safariCheck(p) {
            return p.toString() === '[object SafariRemoteNotification]';
        }

        return _service;
    });
