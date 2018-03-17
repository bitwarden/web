angular
    .module('bit.services')

    .factory('authService', function (cryptoService, apiService, tokenService, $q, jwtHelper, $rootScope, constants) {
        var _service = {},
            _userProfile = null;

        _service.logIn = function (email, masterPassword, token, provider, remember) {
            email = email.toLowerCase();

            var deferred = $q.defer();

            var makeResult;
            cryptoService.makeKeyAndHash(email, masterPassword).then(function (result) {
                makeResult = result;

                var request = {
                    username: email,
                    password: result.hash,
                    grant_type: 'password',
                    scope: 'api offline_access',
                    client_id: 'web'
                };

                // TODO: device information one day?

                if (token && typeof (provider) !== 'undefined' && provider !== null) {
                    remember = remember || remember !== false;

                    request.twoFactorToken = token;
                    request.twoFactorProvider = provider;
                    request.twoFactorRemember = remember ? '1' : '0';
                }
                else if (tokenService.getTwoFactorToken(email)) {
                    request.twoFactorToken = tokenService.getTwoFactorToken(email);
                    request.twoFactorProvider = constants.twoFactorProvider.remember;
                    request.twoFactorRemember = '0';
                }

                return apiService.identity.token(request).$promise;
            }).then(function (response) {
                if (!response || !response.access_token) {
                    return;
                }

                tokenService.setToken(response.access_token);
                tokenService.setRefreshToken(response.refresh_token);
                cryptoService.setKey(makeResult.key);

                if (response.TwoFactorToken) {
                    tokenService.setTwoFactorToken(response.TwoFactorToken, email);
                }

                if (response.Key) {
                    cryptoService.setEncKey(response.Key, makeResult.key);
                }

                if (response.PrivateKey) {
                    cryptoService.setPrivateKey(response.PrivateKey);
                    return true;
                }
                else {
                    return cryptoService.makeKeyPair();
                }
            }).then(function (keyResults) {
                if (keyResults === true) {
                    return;
                }

                cryptoService.setPrivateKey(keyResults.privateKeyEnc);
                return apiService.accounts.putKeys({
                    publicKey: keyResults.publicKey,
                    encryptedPrivateKey: keyResults.privateKeyEnc
                }).$promise;
            }).then(function () {
                return _service.setUserProfile();
            }).then(function () {
                deferred.resolve();
            }, function (error) {
                _service.logOut();

                if (error.status === 400 && error.data.TwoFactorProviders2 &&
                    Object.keys(error.data.TwoFactorProviders2).length) {
                    tokenService.clearTwoFactorToken(email);
                    deferred.resolve(error.data.TwoFactorProviders2);
                }
                else {
                    deferred.reject(error);
                }
            });

            return deferred.promise;
        };

        _service.logOut = function () {
            tokenService.clearTokens();
            cryptoService.clearKeys();
            $rootScope.vaultCiphers = $rootScope.vaultFolders = $rootScope.vaultCollections = null;
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

            apiService.accounts.getProfile({}, function (profile) {
                _userProfile = {
                    id: profile.Id,
                    email: profile.Email,
                    emailVerified: profile.EmailVerified,
                    premium: profile.Premium,
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
                            type: profile.Organizations[i].Type,
                            enabled: profile.Organizations[i].Enabled,
                            maxCollections: profile.Organizations[i].MaxCollections,
                            maxStorageGb: profile.Organizations[i].MaxStorageGb,
                            seats: profile.Organizations[i].Seats,
                            useGroups: profile.Organizations[i].UseGroups,
                            useDirectory: profile.Organizations[i].UseDirectory,
                            useEvents: profile.Organizations[i].UseEvents,
                            useTotp: profile.Organizations[i].UseTotp
                        };
                    }

                    _userProfile.organizations = orgs;
                    cryptoService.setOrgKeys(orgs);
                    _setDeferred.resolve(_userProfile);
                }
            }, function (error) {
                _setDeferred.reject(error);
            });

            return _setDeferred.promise;
        };

        _service.addProfileOrganizationOwner = function (org, keyCt) {
            return _service.getUserProfile().then(function (profile) {
                if (profile) {
                    if (!profile.organizations) {
                        profile.organizations = {};
                    }

                    var o = {
                        id: org.Id,
                        name: org.Name,
                        key: keyCt,
                        status: 2, // 2 = Confirmed
                        type: 0, // 0 = Owner
                        enabled: true,
                        maxCollections: org.MaxCollections,
                        maxStorageGb: org.MaxStorageGb,
                        seats: org.Seats,
                        useGroups: org.UseGroups,
                        useDirectory: org.UseDirectory,
                        useEvents: org.UseEvents,
                        useTotp: org.UseTotp
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

        _service.updateProfilePremium = function (isPremium) {
            return _service.getUserProfile().then(function (profile) {
                if (profile) {
                    profile.premium = isPremium;
                    _userProfile = profile;
                }
            });
        };

        _service.isAuthenticated = function () {
            return tokenService.getToken() !== null;
        };

        _service.refreshAccessToken = function () {
            var refreshToken = tokenService.getRefreshToken();
            if (!refreshToken) {
                return $q(function (resolve, reject) {
                    resolve(null);
                });
            }

            return apiService.identity.token({
                grant_type: 'refresh_token',
                client_id: 'web',
                refresh_token: refreshToken
            }).$promise.then(function (response) {
                tokenService.setToken(response.access_token);
                tokenService.setRefreshToken(response.refresh_token);
                return response.access_token;
            }, function (response) { });
        };

        return _service;
    });
