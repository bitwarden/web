angular
    .module('bit.services')

    .factory('tokenService', function ($sessionStorage) {
        var _service = {},
            _token;

        _service.setToken = function (token) {
            $sessionStorage.authBearer = token;
            _token = token;
        };

        _service.getToken = function () {
            if (!_token) {
                _token = $sessionStorage.authBearer;
            }

            return _token;
        };

        _service.clearToken = function () {
            _token = null;
            delete $sessionStorage.authBearer;
        };

        return _service;
    });
