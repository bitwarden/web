angular
    .module('bit.global')

    .controller('sideNavController', function ($scope, $state, authService) {
        $scope.$state = $state;
        $scope.params = $state.params;
        $scope.orgs = [];

        authService.getUserProfile().then(function (userProfile) {
            if (!userProfile.organizations) {
                return;
            }

            if ($state.includes('backend.org') && ($state.params.orgId in userProfile.organizations)) {
                $scope.orgProfile = userProfile.organizations[$state.params.orgId];
            }
            else {
                var orgs = [];
                for (var orgId in userProfile.organizations) {
                    if (userProfile.organizations.hasOwnProperty(orgId)) {
                        orgs.push(userProfile.organizations[orgId]);
                    }
                }
                $scope.orgs = orgs;
            }
        });

        $scope.viewOrganization = function (id) {
            $state.go('backend.org.dashboard', { orgId: id });
        };
    });
