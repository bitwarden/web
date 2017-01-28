angular
    .module('bit.services')

    .factory('tokenService', function ($sessionStorage) {
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

        return _service;
    });
