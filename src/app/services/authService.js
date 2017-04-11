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

        var _setDeferred = null;
        _service.setUserProfile = function () {
            if (_setDeferred && _setDeferred.promise.$$state.status === 0) {
                return _setDeferred.promise;
            }

            _setDeferred = $q.defer();

            var token = tokenService.getToken();
            if (!token) {
                _setDeferred.reject();
                return _setDeferred.promise;
            }

            var decodedToken = jwtHelper.decodeToken(token);
            apiService.accounts.getProfile({}, function (profile) {
                _userProfile = {
                    id: decodedToken.name,
                    email: decodedToken.email,
                    extended: {
                        name: profile.Name,
                        twoFactorEnabled: profile.TwoFactorEnabled,
                        culture: profile.Culture
                    }
                };

                if (profile.Organizations) {
                    var orgs = {};
                    for (var i = 0; i < profile.Organizations.length; i++) {
                        orgs[profile.Organizations[i].Id] = {
                            id: profile.Organizations[i].Id,
                            name: profile.Organizations[i].Name,
                            key: profile.Organizations[i].Key,
                            status: profile.Organizations[i].Status,
                            type: profile.Organizations[i].Type
                        };
                    }

                    _userProfile.organizations = orgs;
                    cryptoService.setOrgKeys(orgs);
                    _setDeferred.resolve(_userProfile);
                }
            }, function () {
                _setDeferred.reject();
            });

            return _setDeferred.promise;
        };

        _service.addProfileOrganizationOwner = function (org, key) {
            return _service.getUserProfile().then(function (profile) {
                if (profile) {
                    if (!profile.organizations) {
                        profile.organizations = {};
                    }

                    var o = {
                        id: org.Id,
                        name: org.Name,
                        key: key,
                        status: 2, // 2 = Confirmed
                        type: 0 // 0 = Owner
                    };
                    profile.organizations[o.id] = o;

                    _userProfile = profile;
                    cryptoService.addOrgKey(o.id, o.key);
                }
            });
        };

        _service.removeProfileOrganization = function (orgId) {
            return _service.getUserProfile().then(function (profile) {
                if (profile) {
                    if (profile.organizations && profile.organizations.hasOwnProperty(orgId)) {
                        delete profile.organizations[orgId];
                        _userProfile = profile;
                    }

                    cryptoService.clearOrgKey(orgId);
                }
            });
        };

        _service.updateProfileOrganization = function (org) {
            return _service.getUserProfile().then(function (profile) {
                if (profile) {
                    if (profile.organizations && org.Id in profile.organizations) {
                        profile.organizations[org.Id].name = org.Name;
                        _userProfile = profile;
                    }
                }
            });
        };

        _service.isAuthenticated = function () {
            return tokenService.getToken() !== null;
        };

        return _service;
    });
