angular
    .module('bit.organization')

    .controller('organizationDashboardController', function ($scope, authService, $state) {
        $scope.$on('$viewContentLoaded', function () {
            authService.getUserProfile().then(function (userProfile) {
                if (!userProfile.organizations) {
                    return;
                }


                $scope.orgProfile = userProfile.organizations[$state.params.orgId];
            });
        });
    });
