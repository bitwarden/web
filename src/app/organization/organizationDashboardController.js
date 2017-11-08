angular
    .module('bit.organization')

    .controller('organizationDashboardController', function ($scope, authService, $state, appSettings) {
        $scope.selfHosted = appSettings.selfHosted;

        $scope.$on('$viewContentLoaded', function () {
            authService.getUserProfile().then(function (userProfile) {
                if (!userProfile.organizations) {
                    return;
                }
                $scope.orgProfile = userProfile.organizations[$state.params.orgId];
            });
        });

        $scope.goBilling = function () {
            $state.go('backend.org.billing', { orgId: $state.params.orgId })
        };
    });
