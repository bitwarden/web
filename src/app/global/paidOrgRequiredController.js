angular
    .module('bit.global')

    .controller('paidOrgRequiredController', function ($scope, $state, $uibModalInstance, $analytics, $uibModalStack, orgId) {
        $analytics.eventTrack('paidOrgRequiredController', { category: 'Modal' });

        $scope.go = function () {
            $analytics.eventTrack('Get Paid Org');
            $state.go('backend.org.billing', { orgId: orgId }).then(function () {
                $uibModalStack.dismissAll();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };
    });
