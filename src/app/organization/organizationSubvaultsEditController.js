angular
    .module('bit.organization')

    .controller('organizationCollectionsEditController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics, id) {
        $analytics.eventTrack('organizationCollectionsEditController', { category: 'Modal' });
        $scope.collection = {};

        $uibModalInstance.opened.then(function () {
            apiService.collections.get({ orgId: $state.params.orgId, id: id }, function (collection) {
                $scope.collection = cipherService.decryptCollection(collection);
            });
        });

        $scope.submit = function (model) {
            var collection = cipherService.encryptCollection(model, $state.params.orgId);
            $scope.submitPromise = apiService.collections.put({ orgId: $state.params.orgId }, collection, function (response) {
                $analytics.eventTrack('Edited Collection');
                var decCollection = cipherService.decryptCollection(response, $state.params.orgId, true);
                $uibModalInstance.close(decCollection);
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
