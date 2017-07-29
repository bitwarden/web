angular
    .module('bit.organization')

    .controller('organizationBillingChangePaymentController', function ($scope, $state, $uibModalInstance, apiService, stripe,
        $analytics, toastr, existingPaymentMethod) {
        $analytics.eventTrack('organizationBillingChangePaymentController', { category: 'Modal' });
        $scope.existingPaymentMethod = existingPaymentMethod;
        $scope.paymentMethod = 'card';
        $scope.showPaymentOptions = false;
        $scope.card = {};

        $scope.submit = function () {
            $scope.submitPromise = stripe.card.createToken($scope.card).then(function (response) {
                var request = {
                    paymentToken: response.id
                };

                return apiService.organizations.putPayment({ id: $state.params.orgId }, request).$promise;
            }, function (err) {
                throw err.message;
            }).then(function (response) {
                $scope.card = null;
                if (existingPaymentMethod) {
                    $analytics.eventTrack('Changed Organization Payment Method');
                    toastr.success('You have changed your payment method.');
                }
                else {
                    $analytics.eventTrack('Added Organization Payment Method');
                    toastr.success('You have added a payment method.');
                }

                $uibModalInstance.close();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
