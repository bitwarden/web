angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $rootScope, $cookies, apiService, cryptoService, authService, $state, appSettings) {
        var rememberedEmail = $cookies.get(appSettings.rememberdEmailCookieName);
        if (rememberedEmail) {
            $scope.model = {
                email: rememberedEmail,
                rememberEmail: true
            };
        }

        $scope.login = function (model) {
            $scope.loginPromise = authService.logIn(model.email, model.masterPassword);

            $scope.loginPromise.then(function () {
                if (model.rememberEmail) {
                    var cookieExpiration = new Date();
                    cookieExpiration.setFullYear(cookieExpiration.getFullYear() + 10);

                    $cookies.put(
                        appSettings.rememberdEmailCookieName,
                        model.email,
                        { expires: cookieExpiration });
                }
                else {
                    $cookies.remove(appSettings.rememberdEmailCookieName);
                }

                var profile = authService.getUserProfile();
                if (profile.twoFactor) {
                    $state.go('frontend.login.twoFactor');
                }
                else {
                    $state.go('backend.vault');
                }
            });
        };

        $scope.twoFactor = function (model) {
            // Only supporting Authenticator provider for now
            $scope.twoFactorPromise = authService.logInTwoFactor(model.code, "Authenticator");

            $scope.twoFactorPromise.then(function () {
                $state.go('backend.vault');
            });
        };
    });
