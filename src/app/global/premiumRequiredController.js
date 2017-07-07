angular
    .module('bit.global')

    .controller('premiumRequiredController', function ($scope, $state, $uibModalInstance, $analytics, $uibModalStack) {
        $analytics.eventTrack('premiumRequiredController', { category: 'Modal' });

        $scope.go = function () {
            $analytics.eventTrack('Get Premium');
            $state.go('backend.user.settingsPremium').then(function () {
                $uibModalStack.dismissAll();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };
    });
