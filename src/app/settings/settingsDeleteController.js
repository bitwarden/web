angular
    .module('bit.settings')

    .controller('settingsDeleteController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics) {
        $analytics.eventTrack('settingsDeleteController', { category: 'Modal' });
        $scope.submit = function (model) {
            $scope.submitPromise = cryptoService.hashPassword(model.masterPassword).then(function (hash) {
                return apiService.accounts.postDelete({
                    masterPasswordHash: hash
                }).$promise;
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
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
