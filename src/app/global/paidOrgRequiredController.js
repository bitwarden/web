angular
    .module('bit.global')

    .controller('paidOrgRequiredController', function ($scope, $state, $uibModalInstance, $analytics, $uibModalStack, orgId) {
        $analytics.eventTrack('paidOrgRequiredController', { category: 'Modal' });

        $scope.go = function () {
            $analytics.eventTrack('Get Paid Org');
            $state.go('backend.org.billing', { orgId: orgId }).then(function () {
                $scope.close();
            });
        };

        $scope.close = function () {
            $uibModalStack.dismissAll();
        };
    });
