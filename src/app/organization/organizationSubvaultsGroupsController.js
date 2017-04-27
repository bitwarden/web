angular
    .module('bit.organization')

    .controller('organizationCollectionsGroupsController', function ($scope, $state, $uibModalInstance, collection, $analytics) {
        $analytics.eventTrack('organizationCollectionsGroupsController', { category: 'Modal' });
        $scope.collection = collection;

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
