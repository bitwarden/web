angular
    .module('bit.organization')

    .controller('organizationBillingChangePlanController', function ($scope, $state, apiService, $uibModalInstance,
        toastr, $analytics) {
        $analytics.eventTrack('organizationBillingChangePlanController', { category: 'Modal' });
        $scope.submit = function () {

        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
