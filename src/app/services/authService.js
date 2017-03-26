angular
    .module('bit.services')

    .factory('authService', function (cryptoService, apiService, tokenService, $q, jwtHelper) {
        var _service = {},
            _userProfile = null;

        _service.logIn = function (email, masterPassword, token, provider) {
            email = email.toLowerCase();
            var key = cryptoService.makeKey(masterPassword, email);

            var request = {
                username: email,
                password: cryptoService.hashPassword(masterPassword, key),
                grant_type: 'password',
                scope: 'api offline_access',
                client_id: 'web'
            };

            if (token && typeof (provider) !== 'undefined' && provider !== null) {
                request.twoFactorToken = token.replace(' ', '');
                request.twoFactorProvider = provider;
            }

            // TODO: device information one day?

            var deferred = $q.defer();
            apiService.identity.token(request, function (response) {
                if (!response || !response.access_token) {
                    return;
                }

                tokenService.setToken(response.access_token);
                tokenService.setRefreshToken(response.refresh_token);
                cryptoService.setKey(key);
                if (response.PrivateKey) {
                    cryptoService.setPrivateKey(response.PrivateKey, key);
                }

                _service.setUserProfile().then(function () {
                    deferred.resolve();
                });
            }, function (error) {
                if (error.status === 400 && error.data.TwoFactorProviders && error.data.TwoFactorProviders.length) {
                    deferred.resolve(error.data.TwoFactorProviders);
                }
                else {
                    deferred.reject(error);
                }
            });

            return deferred.promise;
        };

        _service.logOut = function () {
            tokenService.clearToken();
            tokenService.clearRefreshToken();
            cryptoService.clearKeys();
            _userProfile = null;
        };

        _service.getUserProfile = function () {
            if (!_userProfile) {
                return _service.setUserProfile();
            }

            var deferred = $q.defer();
            deferred.resolve(_userProfile);
            return deferred.promise;
        };

        _service.setUserProfile = function () {
            var deferred = $q.defer();

            var token = tokenService.getToken();
            if (!token) {
                deferred.reject();
                return deferred.promise;
            }

            var decodedToken = jwtHelper.decodeToken(token);

            _userProfile = {
                id: decodedToken.name,
                email: decodedToken.email
            };

            apiService.accounts.getProfile({}, function (profile) {
                _userProfile.extended = {
                    name: profile.Name,
                    twoFactorEnabled: profile.TwoFactorEnabled,
                    culture: profile.Culture
                };

                if (profile.Organizations) {
                    var orgs = [];
                    for (var i = 0; i < profile.Organizations.length; i++) {
                        orgs.push({
                            id: profile.Organizations[i].Id,
                            name: profile.Organizations[i].Name,
                            key: profile.Organizations[i].Key,
                            status: profile.Organizations[i].Status,
                            type: profile.Organizations[i].Type
                        });
                    }

                    _userProfile.organizations = orgs;
                    cryptoService.setOrgKeys(orgs);
                    deferred.resolve(_userProfile);
                }
            }, function () {
                deferred.reject();
            });

            return deferred.promise;
        };

        _service.addProfileOrganization = function (org) {
            return _service.getUserProfile().then(function (profile) {
                if (profile) {
                    if (!profile.Organizations) {
                        profile.Organizations = [];
                    }

                    var o = {
                        id: org.Id,
                        name: org.Name,
                        key: org.Key,
                        status: 2, // 2 = Confirmed
                        type: 0 // 0 = Owner
                    };
                    profile.organizations.push(o);

                    _userProfile = profile;
                    cryptoService.addOrgKey(o.id, o.key);
                }
            });
        };

        _service.isAuthenticated = function () {
            return tokenService.getToken() !== null;
        };

        return _service;
    });
