angular
    .module('bit.global')

    .controller('sideNavController', function ($scope, $state) {
        $scope.$state = $state;
    });
