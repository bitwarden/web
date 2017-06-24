angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $rootScope, $cookies, apiService, cryptoService, authService,
        $state, constants, $analytics, $uibModal, $timeout, $window, $filter, toastr) {
        $scope.state = $state;
        $scope.twoFactorProviderConstants = constants.twoFactorProvider;
        $scope.rememberTwoFactor = { checked: false };

        var returnState;
        if (!$state.params.returnState && $state.params.org) {
            returnState = {
                name: 'backend.user.settingsCreateOrg',
                params: { plan: $state.params.org }
            };
        }
        else {
            returnState = $state.params.returnState;
        }

        var rememberedEmail = $cookies.get(constants.rememberedEmailCookieName);
        if (rememberedEmail || $state.params.email) {
            $scope.model = {
                email: $state.params.email ? $state.params.email : rememberedEmail,
                rememberEmail: rememberedEmail !== null
            };
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
                    $state.go('frontend.login.twoFactor', { returnState: returnState }).then(function () {
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
                    providerType = provider[0].type;
                }
            }
            return parseInt(providerType);
        }

        $scope.twoFactor = function (token) {
            $scope.twoFactorPromise = authService.logIn(_email, _masterPassword, token, $scope.twoFactorProvider,
                $scope.rememberTwoFactor.checked || false);

            $scope.twoFactorPromise.then(function () {
                $analytics.eventTrack('Logged In From Two-step');
                loggedInGo();
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

            var key = cryptoService.makeKey(_masterPassword, _email);
            var hash = cryptoService.hashPassword(_masterPassword, key);
            apiService.twoFactor.sendEmailLogin({
                email: _email,
                masterPasswordHash: hash
            }, function () {
                if (doToast) {
                    toastr.success('Verification email sent to ' + $scope.twoFactorEmail + '.');
                }
            }, function () {
                toastr.error('Could not send verification email.');
            });
        };

        function loggedInGo() {
            if (returnState) {
                $state.go(returnState.name, returnState.params);
            }
            else {
                $state.go('backend.user.vault');
            }
        }

        function init() {
            if ($scope.twoFactorProvider === constants.twoFactorProvider.duo) {
                var params = $scope.twoFactorProviders[constants.twoFactorProvider.duo];

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
                var params = $scope.twoFactorProviders[constants.twoFactorProvider.u2f];
                var challenges = JSON.parse(params.Challenges);

                initU2f(challenges);
            }
            else if ($scope.twoFactorProvider === constants.twoFactorProvider.email) {
                var params = $scope.twoFactorProviders[constants.twoFactorProvider.email];
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
            }, 5);
        }
    });
