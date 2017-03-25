angular
    .module('bit.global')

    .controller('sideNavController', function ($scope, $state, authService) {
        $scope.$state = $state;
        $scope.params = $state.params;

        if ($state.includes('backend.org')) {
            authService.getUserProfile().then(function (userProfile) {
                if (!userProfile.organizations || !userProfile.organizations.length) {
                    return;
                }

                for (var i = 0; i < userProfile.organizations.length; i++) {
                    if (userProfile.organizations[i].id === $state.params.orgId) {
                        $scope.orgProfile = userProfile.organizations[i];
                        break;
                    }
                }
            });
        }
    });
