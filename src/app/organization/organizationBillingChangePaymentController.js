angular
    .module('bit.organization')

    .controller('organizationBillingChangePaymentController', function ($scope, $state, $uibModalInstance, apiService, stripe,
        $analytics) {
        $scope.submit = function () {
            $scope.submitPromise = stripe.card.createToken($scope.card).then(function (response) {
                var request = {
                    paymentToken: response.id
                };

                return apiService.organizations.putPayment({ id: $state.params.orgId }, request).$promise;
            }).then(function (response) {
                $scope.card = null;
                $analytics.eventTrack('Changed Payment Method');
                $uibModalInstance.close();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
