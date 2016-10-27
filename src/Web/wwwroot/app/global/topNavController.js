angular
    .module('bit.global')

    .controller('topNavController', function ($scope, sideNavService) {
        $scope.toggleSideNav = function() {
            sideNavService.toggleSideNav();
        };

        $scope.$on('settingsToggleSideNav', function (event, args) {
            $scope.toggleSideNav();
        });
    });
