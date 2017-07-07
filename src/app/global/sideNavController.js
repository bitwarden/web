angular
    .module('bit.global')

    .controller('sideNavController', function ($scope, $state, authService, toastr, $analytics, constants) {
        $scope.$state = $state;
        $scope.params = $state.params;
        $scope.orgs = [];
        $scope.name = '';

        authService.getUserProfile().then(function (userProfile) {
            $scope.name = userProfile.extended && userProfile.extended.name ?
                userProfile.extended.name : userProfile.email;

            if (!userProfile.organizations) {
                return;
            }

            if ($state.includes('backend.org') && ($state.params.orgId in userProfile.organizations)) {
                $scope.orgProfile = userProfile.organizations[$state.params.orgId];
            }
            else {
                var orgs = [];
                for (var orgId in userProfile.organizations) {
                    if (userProfile.organizations.hasOwnProperty(orgId) &&
                        (userProfile.organizations[orgId].enabled || userProfile.organizations[orgId].type < 2)) { // 2 = User
                        orgs.push(userProfile.organizations[orgId]);
                    }
                }
                $scope.orgs = orgs;
            }
        });

        $scope.viewOrganization = function (org) {
            if (org.type === constants.orgUserType.user) {
                toastr.error('You cannot manage this organization.');
                return;
            }

            $analytics.eventTrack('View Organization From Side Nav');
            $state.go('backend.org.dashboard', { orgId: org.id });
        };

        $scope.searchVault = function () {
            $state.go('backend.user.vault');
        };

        $scope.searchOrganizationVault = function () {
            $state.go('backend.org.vault', { orgId: $state.params.orgId });
        };

        $scope.isOrgOwner = function (org) {
            return org && org.type === constants.orgUserType.owner;
        };
    });
