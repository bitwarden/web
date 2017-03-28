angular
    .module('bit.global')

    .controller('sideNavController', function ($scope, $state, authService) {
        $scope.$state = $state;
        $scope.params = $state.params;

        if ($state.includes('backend.org')) {
            authService.getUserProfile().then(function (userProfile) {
                if (!userProfile.organizations || !($state.params.orgId in userProfile.organizations)) {
                    return;
                }

                $scope.orgProfile = userProfile.organizations[$state.params.orgId];
            });
        }
    });
