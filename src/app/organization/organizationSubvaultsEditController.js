angular
    .module('bit.organization')

    .controller('organizationSubvaultsEditController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics, id) {
        $analytics.eventTrack('organizationSubvaultsEditController', { category: 'Modal' });
        $scope.subvault = {};

        $uibModalInstance.opened.then(function () {
            apiService.subvaults.get({ orgId: $state.params.orgId, id: id }, function (subvault) {
                $scope.subvault = cipherService.decryptSubvault(subvault);
            });
        });

        $scope.submit = function (model) {
            var subvault = cipherService.encryptSubvault(model, $state.params.orgId);
            $scope.submitPromise = apiService.subvaults.put({ orgId: $state.params.orgId }, subvault, function (response) {
                $analytics.eventTrack('Edited Subvault');
                var decSubvault = cipherService.decryptSubvault(response, $state.params.orgId, true);
                $uibModalInstance.close(decSubvault);
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
