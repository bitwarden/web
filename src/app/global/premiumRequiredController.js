angular
    .module('bit.global')

    .controller('premiumRequiredController', function ($scope, $state, $uibModalInstance, $analytics, $uibModalStack) {
        $analytics.eventTrack('premiumRequiredController', { category: 'Modal' });

        $scope.go = function () {
            $analytics.eventTrack('Get Premium');
            $state.go('backend.user.settingsPremium').then(function () {
                $scope.close();
            });
        };

        $scope.close = function () {
            $uibModalStack.dismissAll();
        };
    });
