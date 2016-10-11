angular
    .module('bit.services')

    .factory('authService', function (cryptoService, apiService, tokenService, $q, jwtHelper) {
        var _service = {},
            _userProfile = null;

        _service.logIn = function (email, masterPassword) {
            email = email.toLowerCase();
            var key = cryptoService.makeKey(masterPassword, email);

            var request = {
                email: email,
                masterPasswordHash: cryptoService.hashPassword(masterPassword, key)
            };

            var deferred = $q.defer();
            apiService.auth.token(request, function (response) {
                if (!response || !response.Token) {
                    return;
                }

                tokenService.setToken(response.Token);
                cryptoService.setKey(key);
                _service.setUserProfile(response.Profile);

                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        _service.logInTwoFactor = function (code, provider) {
            var request = {
                code: code,
                provider: provider
            };

            var deferred = $q.defer();
            apiService.auth.tokenTwoFactor(request, function (response) {
                if (!response || !response.Token) {
                    return;
                }

                tokenService.setToken(response.Token);
                _service.setUserProfile(response.Profile);

                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        _service.logOut = function () {
            tokenService.clearToken();
            cryptoService.clearKey();
            _userProfile = null;
        };

        _service.getUserProfile = function () {
            if (!_userProfile) {
                _service.setUserProfile();
            }

            return _userProfile;
        };

        _service.setUserProfile = function (profile) {
            var token = tokenService.getToken();
            if (!token) {
                return;
            }

            var decodedToken = jwtHelper.decodeToken(token);
            var twoFactor = decodedToken.authmethod === "TwoFactor";

            _userProfile = {
                id: decodedToken.nameid,
                email: decodedToken.email,
                twoFactor: twoFactor
            };

            if (!twoFactor && profile) {
                loadProfile(profile);
            }
            else if (!twoFactor && !profile) {
                apiService.accounts.getProfile({}, loadProfile);
            }
        };

        function loadProfile(profile) {
            _userProfile.extended = {
                name: profile.Name,
                twoFactorEnabled: profile.TwoFactorEnabled,
                culture: profile.Culture
            };
        }

        _service.isAuthenticated = function () {
            return _service.getUserProfile() !== null && !_service.getUserProfile().twoFactor;
        };

        _service.isTwoFactorAuthenticated = function () {
            return _service.getUserProfile() !== null && _service.getUserProfile().twoFactor;
        };

        return _service;
    });
