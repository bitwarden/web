angular
    .module('bit.organization')

    .controller('organizationCollectionsAddController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics) {
        $analytics.eventTrack('organizationCollectionsAddController', { category: 'Modal' });

        $scope.submit = function (model) {
            var collection = cipherService.encryptCollection(model, $state.params.orgId);
            $scope.submitPromise = apiService.collections.post({ orgId: $state.params.orgId }, collection, function (response) {
                $analytics.eventTrack('Created Collection');
                var decCollection = cipherService.decryptCollection(response, $state.params.orgId, true);
                $uibModalInstance.close(decCollection);
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
