angular
    .module('bit.organization')

    .controller('settingsBillingChangePaymentController', function ($scope, $state, $uibModalInstance, apiService, stripe,
        $analytics, toastr, existingPaymentMethod) {
        $analytics.eventTrack('settingsBillingChangePaymentController', { category: 'Modal' });
        $scope.existingPaymentMethod = existingPaymentMethod;

        $scope.submit = function () {
            $scope.submitPromise = stripe.card.createToken($scope.card).then(function (response) {
                var request = {
                    paymentToken: response.id
                };

                return apiService.accounts.putPayment(null, request).$promise;
            }).then(function (response) {
                $scope.card = null;
                if (existingPaymentMethod) {
                    $analytics.eventTrack('Changed Payment Method');
                    toastr.success('You have changed your payment method.');
                }
                else {
                    $analytics.eventTrack('Added Payment Method');
                    toastr.success('You have added a payment method.');
                }

                $uibModalInstance.close();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
