angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $rootScope, $cookies, apiService, cryptoService, authService,
        $state, constants, $analytics, $uibModal, $timeout, $window) {
        $scope.state = $state;

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
            $scope.loginPromise = authService.logIn(model.email, model.masterPassword);

            $scope.loginPromise.then(function (twoFactorProviders) {
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
                    $scope.twoFactorProvider = parseInt(Object.keys(twoFactorProviders)[0]);

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
            });
        };

        $scope.twoFactor = function (token) {
            $scope.twoFactorPromise = authService.logIn(_email, _masterPassword, token, $scope.twoFactorProvider, true);

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

                Duo.init({
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
                if (challenges.length < 1) {
                    return;
                }

                $window.u2f.sign(challenges[0].appId, challenges[0].challenge, [{
                    version: challenges[0].version,
                    keyHandle: challenges[0].keyHandle
                }], function (data) {
                    console.log('call back data:');
                    console.log(data);
                    $scope.twoFactor(JSON.stringify(data));
                });
            }
        }
    });
