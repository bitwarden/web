angular
    .module('bit.services')

    .factory('tokenService', function ($sessionStorage, jwtHelper) {
        var _service = {},
            _token = null,
            _refreshToken = null;

        _service.setToken = function (token) {
            $sessionStorage.accessToken = token;
            _token = token;
        };

        _service.getToken = function () {
            if (!_token) {
                _token = $sessionStorage.accessToken;
            }

            return _token ? _token : null;
        };

        _service.clearToken = function () {
            _token = null;
            delete $sessionStorage.accessToken;
        };

        _service.setRefreshToken = function (token) {
            $sessionStorage.refreshToken = token;
            _refreshToken = token;
        };

        _service.getRefreshToken = function () {
            if (!_refreshToken) {
                _refreshToken = $sessionStorage.refreshToken;
            }

            return _refreshToken ? _refreshToken : null;
        };

        _service.clearRefreshToken = function () {
            _refreshToken = null;
            delete $sessionStorage.refreshToken;
        };

        _service.tokenSecondsRemaining = function (token, offsetSeconds) {
            var d = jwtHelper.getTokenExpirationDate(token);
            offsetSeconds = offsetSeconds || 0;
            if (d === null) {
                return 0;
            }

            var msRemaining = d.valueOf() - (new Date().valueOf() + (offsetSeconds * 1000));
            return Math.round(msRemaining / 1000);
        };

        _service.tokenNeedsRefresh = function (token, minutes) {
            minutes = minutes || 5; // default 5 minutes
            var sRemaining = _service.tokenSecondsRemaining(token);
            return sRemaining < (60 * minutes);
        };

        return _service;
    });
