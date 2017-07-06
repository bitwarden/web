angular
    .module('bit.global')

    .controller('premiumRequiredController', function ($scope, $state, $uibModalInstance, $analytics) {
        $analytics.eventTrack('premiumRequiredController', { category: 'Modal' });

        $scope.go = function () {
            $analytics.eventTrack('Get Premium');
            $state.go('backend.user.settingsPremium').then(function () {
                $scope.close();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };
    });
