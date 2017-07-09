angular
    .module('bit.settings')

    .controller('settingsSessionsController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        authService, tokenService, toastr, $analytics) {
        $analytics.eventTrack('settingsSessionsController', { category: 'Modal' });
        $scope.submit = function (model) {
            var hash, profile;

            $scope.submitPromise = cryptoService.hashPassword(model.masterPassword).then(function (theHash) {
                hash = theHash;
                return authService.getUserProfile();
            }).then(function (theProfile) {
                profile = theProfile;
                return apiService.accounts.putSecurityStamp({
                    masterPasswordHash: hash
                }).$promise;
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                tokenService.clearTwoFactorToken(profile.email);
                $analytics.eventTrack('Deauthorized Sessions');
                return $state.go('frontend.login.info');
            }).then(function () {
                toastr.success('Please log back in.', 'All Sessions Deauthorized');
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
