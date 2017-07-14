angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $rootScope, $cookies, apiService, cryptoService, authService,
        $state, constants, $analytics, $uibModal, $timeout, $window, $filter, toastr) {
        $scope.state = $state;
        $scope.twoFactorProviderConstants = constants.twoFactorProvider;
        $scope.rememberTwoFactor = { checked: false };

        $scope.returnState = $state.params.returnState;
        $scope.stateEmail = $state.params.email;
        if (!$scope.returnState && $state.params.org) {
            $scope.returnState = {
                name: 'backend.user.settingsCreateOrg',
                params: { plan: $state.params.org }
            };
        }
        else if (!$scope.returnState && $state.params.premium) {
            $scope.returnState = {
                name: 'backend.user.settingsPremium'
            };
        }

        if ($state.current.name.indexOf('twoFactor') > -1 && (!$scope.twoFactorProviders || !$scope.twoFactorProviders.length)) {
            $state.go('frontend.login.info', { returnState: $scope.returnState });
        }

        var rememberedEmail = $cookies.get(constants.rememberedEmailCookieName);
        if (rememberedEmail || $scope.stateEmail) {
            $scope.model = {
                email: $scope.stateEmail || rememberedEmail,
                rememberEmail: rememberedEmail !== null
            };

            $timeout(function () {
                $("#masterPassword").focus();
            });
        }
        else {
            $timeout(function () {
                $("#email").focus();
            });
        }

        var _email,
            _masterPassword;

        $scope.twoFactorProviders = null;
        $scope.twoFactorProvider = null;

        $scope.login = function (model) {
            $scope.loginPromise = authService.logIn(model.email, model.masterPassword).then(function (twoFactorProviders) {
                if (model.rememberEmail) {
                    var cookieExpiration = new Date();
                    cookieExpiration.setFullYear(cookieExpiration.getFullYear() + 10);

                    $cookies.put(
                        constants.rememberedEmailCookieName,
                        model.email,
                        { expires: cookieExpiration });
                }
                else {
                    $cookies.remove(constants.rememberedEmailCookieName);
                }

                if (twoFactorProviders && Object.keys(twoFactorProviders).length > 0) {
                    _email = model.email;
                    _masterPassword = model.masterPassword;
                    $scope.twoFactorProviders = twoFactorProviders;
                    $scope.twoFactorProvider = getDefaultProvider(twoFactorProviders);

                    $analytics.eventTrack('Logged In To Two-step');
                    $state.go('frontend.login.twoFactor', { returnState: $scope.returnState }).then(function () {
                        $timeout(function () {
                            $("#code").focus();
                            init();
                        });
                    });
                }
                else {
                    $analytics.eventTrack('Logged In');
                    loggedInGo();
                }

                model.masterPassword = '';
            });
        };

        function getDefaultProvider(twoFactorProviders) {
            var keys = Object.keys(twoFactorProviders);
            var providerType = null;
            var providerPriority = -1;
            for (var i = 0; i < keys.length; i++) {
                var provider = $filter('filter')(constants.twoFactorProviderInfo, { type: keys[i], active: true });
                if (provider.length && provider[0].priority > providerPriority) {
                    if (provider[0].type === constants.twoFactorProvider.u2f && !u2f.isSupported) {
                        continue;
                    }

                    providerType = provider[0].type;
                    providerPriority = provider[0].priority;
                }
            }

            if (providerType === null) {
                return null;
            }

            return parseInt(providerType);
        }

        $scope.twoFactor = function (token) {
            if ($scope.twoFactorProvider === constants.twoFactorProvider.email ||
                $scope.twoFactorProvider === constants.twoFactorProvider.authenticator) {
                token = token.replace(' ', '');
            }

            $scope.twoFactorPromise = authService.logIn(_email, _masterPassword, token, $scope.twoFactorProvider,
                $scope.rememberTwoFactor.checked || false);

            $scope.twoFactorPromise.then(function () {
                $analytics.eventTrack('Logged In From Two-step');
                loggedInGo();
            }, function () {
                if ($scope.twoFactorProvider === constants.twoFactorProvider.u2f) {
                    init();
                }
            });
        };

        $scope.anotherMethod = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/accounts/views/accountsTwoFactorMethods.html',
                controller: 'accountsTwoFactorMethodsController',
                resolve: {
                    providers: function () { return $scope.twoFactorProviders; }
                }
            });

            modal.result.then(function (provider) {
                $scope.twoFactorProvider = provider;
                $timeout(function () {
                    $("#code").focus();
                    init();
                });
            });
        };

        $scope.sendEmail = function (doToast) {
            if ($scope.twoFactorProvider !== constants.twoFactorProvider.email) {
                return;
            }

            return cryptoService.makeKeyAndHash(_email, _masterPassword).then(function (result) {
                return apiService.twoFactor.sendEmailLogin({
                    email: _email,
                    masterPasswordHash: result.hash
                }).$promise;
            }).then(function () {
                if (doToast) {
                    toastr.success('Verification email sent to ' + $scope.twoFactorEmail + '.');
                }
            }, function () {
                toastr.error('Could not send verification email.');
            });
        };

        function loggedInGo() {
            if ($scope.returnState) {
                $state.go($scope.returnState.name, $scope.returnState.params);
            }
            else {
                $state.go('backend.user.vault');
            }
        }

        function init() {
            var params;
            if ($scope.twoFactorProvider === constants.twoFactorProvider.duo) {
                params = $scope.twoFactorProviders[constants.twoFactorProvider.duo];

                $window.Duo.init({
                    host: params.Host,
                    sig_request: params.Signature,
                    submit_callback: function (theForm) {
                        var response = $(theForm).find('input[name="sig_response"]').val();
                        $scope.twoFactor(response);
                    }
                });
            }
            else if ($scope.twoFactorProvider === constants.twoFactorProvider.u2f) {
                params = $scope.twoFactorProviders[constants.twoFactorProvider.u2f];
                var challenges = JSON.parse(params.Challenges);

                initU2f(challenges);
            }
            else if ($scope.twoFactorProvider === constants.twoFactorProvider.email) {
                params = $scope.twoFactorProviders[constants.twoFactorProvider.email];
                $scope.twoFactorEmail = params.Email;
                if (Object.keys($scope.twoFactorProviders).length > 1) {
                    $scope.sendEmail(false);
                }
            }
        }

        function initU2f(challenges) {
            if (challenges.length < 1 || $scope.twoFactorProvider !== constants.twoFactorProvider.u2f) {
                return;
            }

            console.log('listening for u2f key...');

            $window.u2f.sign(challenges[0].appId, challenges[0].challenge, [{
                version: challenges[0].version,
                keyHandle: challenges[0].keyHandle
            }], function (data) {
                if ($scope.twoFactorProvider !== constants.twoFactorProvider.u2f) {
                    return;
                }

                if (data.errorCode) {
                    console.log(data.errorCode);

                    if (data.errorCode === 5) {
                        initU2f(challenges);
                    }

                    return;
                }
                $scope.twoFactor(JSON.stringify(data));
            }, 10);
        }
    });
