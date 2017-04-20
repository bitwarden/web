angular
    .module('bit.organization')

    .controller('organizationSubvaultsGroupsController', function ($scope, $state, $uibModalInstance, subvault) {
        $scope.subvault = subvault;

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
