angular
    .module('bit.settings')

    .controller('settingsDeleteController', function ($scope, $state, apiService, $uibModalInstance, cryptoService, authService, toastr, $analytics) {
        $analytics.eventTrack('settingsDeleteController', { category: 'Modal' });
        $scope.submit = function (model) {
            var request = {
                masterPasswordHash: cryptoService.hashPassword(model.masterPassword)
            };

            $scope.submitPromise = apiService.accounts.postDelete(request, function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                $analytics.eventTrack('Deleted Account');
                $state.go('frontend.login.info').then(function () {
                    toastr.success('Your account has been closed and all associated data has been deleted.', 'Account Deleted');
                });
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
