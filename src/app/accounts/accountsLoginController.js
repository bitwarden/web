angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $rootScope, $cookies, apiService, cryptoService, authService,
        $state, constants, $analytics, $uibModal, $timeout, $window, $filter, toastr) {
        $scope.state = $state;
        $scope.twoFactorProviderConstants = constants.twoFactorProvider;
        $scope.rememberTwoFactor = { checked: false };
        var stopU2fCheck = true;

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

                    $scope.twoFactorProviders = cleanProviders(twoFactorProviders);
                    $scope.twoFactorProvider = getDefaultProvider($scope.twoFactorProviders);

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

        function cleanProviders(twoFactorProviders) {
            if (canUseSecurityKey()) {
                return twoFactorProviders;
            }

            var keys = Object.keys(twoFactorProviders);
            for (var i = 0; i < keys.length; i++) {
                var provider = $filter('filter')(constants.twoFactorProviderInfo, {
                    type: keys[i],
                    active: true,
                    requiresUsb: false
                });
                if (!provider.length) {
                    delete twoFactorProviders[keys[i]];
                }
            }

            return twoFactorProviders;
        }

        // ref: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
        function canUseSecurityKey() {
            var mobile = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                    mobile = true;
                }
            })(navigator.userAgent || navigator.vendor || window.opera);

            return !mobile && !navigator.userAgent.match(/iPad/i);
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

        $scope.$on('$destroy', function () {
            stopU2fCheck = true;
        });

        function loggedInGo() {
            if ($scope.returnState) {
                $state.go($scope.returnState.name, $scope.returnState.params);
            }
            else {
                $state.go('backend.user.vault');
            }
        }

        function init() {
            stopU2fCheck = true;
            var params;
            if ($scope.twoFactorProvider === constants.twoFactorProvider.duo ||
                $scope.twoFactorProvider === constants.twoFactorProvider.organizationDuo) {
                params = $scope.twoFactorProviders[$scope.twoFactorProvider];

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
                stopU2fCheck = false;
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
            if (stopU2fCheck) {
                return;
            }

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

                    $timeout(function () {
                        initU2f(challenges);
                    }, data.errorCode === 5 ? 0 : 1000);

                    return;
                }
                $scope.twoFactor(JSON.stringify(data));
            }, 10);
        }
    });
