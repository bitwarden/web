angular
    .module('bit.settings')

    .controller('settingsDeleteController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics, tokenService) {
        $analytics.eventTrack('settingsDeleteController', { category: 'Modal' });
        $scope.submit = function (model) {
            var profile;

            $scope.submitPromise = authService.getUserProfile().then(function (theProfile) {
                profile = theProfile;
                return cryptoService.hashPassword(model.masterPassword);
            }).then(function (hash) {
                return apiService.accounts.postDelete({
                    masterPasswordHash: hash
                }).$promise;
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                tokenService.clearTwoFactorToken(profile.email);
                $analytics.eventTrack('Deleted Account');
                return $state.go('frontend.login.info');
            }).then(function () {
                toastr.success('Your account has been closed and all associated data has been deleted.', 'Account Deleted');
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
