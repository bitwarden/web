angular
    .module('bit.global')

    .controller('paidOrgRequiredController', function ($scope, $state, $uibModalInstance, $analytics, $uibModalStack, orgId,
        constants, authService) {
        $analytics.eventTrack('paidOrgRequiredController', { category: 'Modal' });

        authService.getUserProfile().then(function (profile) {
            $scope.admin = profile.organizations[orgId].type !== constants.orgUserType.user
        });

        $scope.go = function () {
            if (!$scope.admin) {
                return;
            }

            $analytics.eventTrack('Get Paid Org');
            $state.go('backend.org.billing', { orgId: orgId }).then(function () {
                $uibModalStack.dismissAll();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };
    });
