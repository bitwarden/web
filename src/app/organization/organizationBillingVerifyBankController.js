angular
    .module('bit.organization')

    .controller('organizationBillingVerifyBankController', function ($scope, $state, $uibModalInstance, apiService,
        $analytics, toastr) {
        $analytics.eventTrack('organizationBillingVerifyBankController', { category: 'Modal' });

        $scope.submit = function () {
            var request = {
                amount1: $scope.amount1,
                amount2: $scope.amount2
            };

            $scope.submitPromise = apiService.organizations.postVerifyBank({ id: $state.params.orgId }, request)
                .$promise.then(function (response) {
                    $analytics.eventTrack('Verified Bank Account');
                    toastr.success('You have successfully verified your bank account.');
                    $uibModalInstance.close();
                });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
