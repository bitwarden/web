angular
    .module('bit.global')

    .controller('sideNavController', function ($scope, $state, authService, apiService) {
        $scope.$state = $state;
        $scope.params = $state.params;

        if ($state.includes('backend.user')) {
            $scope.userProfile = authService.getUserProfile();
        }
        else if ($state.includes('backend.org')) {
            $scope.orgProfile = {};
            apiService.organizations.get({ id: $state.params.orgId }, function (response) {
                $scope.orgProfile.name = response.Name;
            });
        }
    });
