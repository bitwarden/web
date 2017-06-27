angular
    .module('bit.settings')

    .controller('settingsSessionsController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        authService, tokenService, toastr, $analytics) {
        $analytics.eventTrack('settingsSessionsController', { category: 'Modal' });
        $scope.submit = function (model) {
            var request = {
                masterPasswordHash: cryptoService.hashPassword(model.masterPassword)
            };

            $scope.submitPromise =
                authService.getUserProfile().then(function (profile) {
                    return apiService.accounts.putSecurityStamp(request, function () {
                        $uibModalInstance.dismiss('cancel');
                        authService.logOut();
                        tokenService.clearTwoFactorToken(profile.email);
                        $analytics.eventTrack('Deauthorized Sessions');
                        $state.go('frontend.login.info').then(function () {
                            toastr.success('Please log back in.', 'All Sessions Deauthorized');
                        });
                    }).$promise;
                });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
