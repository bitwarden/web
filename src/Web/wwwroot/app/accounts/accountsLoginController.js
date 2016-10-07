angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $rootScope, $cookies, apiService, cryptoService, authService, $state, appSettings, $analytics) {
        var rememberedEmail = $cookies.get(appSettings.rememberedEmailCookieName);
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
                        appSettings.rememberedEmailCookieName,
                        model.email,
                        { expires: cookieExpiration });
                }
                else {
                    $cookies.remove(appSettings.rememberedEmailCookieName);
                }

                var profile = authService.getUserProfile();
                if (profile.twoFactor) {
                    $analytics.eventTrack('Logged In To Two-step');
                    $state.go('frontend.login.twoFactor');
                }
                else {
                    $analytics.eventTrack('Logged In');
                    $state.go('backend.vault');
                }
            });
        };

        $scope.twoFactor = function (model) {
            // Only supporting Authenticator provider for now
            $scope.twoFactorPromise = authService.logInTwoFactor(model.code, "Authenticator");

            $scope.twoFactorPromise.then(function () {
                $analytics.eventTrack('Logged In From Two-step');
                $state.go('backend.vault');
            });
        };
    });
