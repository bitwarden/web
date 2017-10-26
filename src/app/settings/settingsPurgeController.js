angular
    .module('bit.settings')

    .controller('settingsPurgeController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics, tokenService) {
        $analytics.eventTrack('settingsPurgeController', { category: 'Modal' });
        $scope.submit = function (model) {
            $scope.submitPromise = cryptoService.hashPassword(model.masterPassword).then(function (hash) {
                return apiService.ciphers.purge({
                    masterPasswordHash: hash
                }).$promise;
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                $analytics.eventTrack('Purged Vault');
                return $state.go('backend.user.vault', { refreshFromServer: true });
            }).then(function () {
                toastr.success('All items in your vault have been deleted.', 'Vault Purged');
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
