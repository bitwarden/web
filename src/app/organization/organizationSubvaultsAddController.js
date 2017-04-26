angular
    .module('bit.organization')

    .controller('organizationSubvaultsAddController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics) {
        $analytics.eventTrack('organizationSubvaultsAddController', { category: 'Modal' });

        $scope.submit = function (model) {
            var subvault = cipherService.encryptSubvault(model, $state.params.orgId);
            $scope.submitPromise = apiService.subvaults.post({ orgId: $state.params.orgId }, subvault, function (response) {
                $analytics.eventTrack('Created Subvault');
                var decSubvault = cipherService.decryptSubvault(response, $state.params.orgId, true);
                $uibModalInstance.close(decSubvault);
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
