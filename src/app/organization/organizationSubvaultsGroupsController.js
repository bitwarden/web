angular
    .module('bit.organization')

    .controller('organizationSubvaultsGroupsController', function ($scope, $state, $uibModalInstance, subvault, $analytics) {
        $analytics.eventTrack('organizationSubvaultsGroupsController', { category: 'Modal' });
        $scope.subvault = subvault;

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
