angular
    .module('bit.organization')

    .controller('organizationBillingChangePaymentController', function ($scope, $state, $uibModalInstance, apiService,
        $analytics, toastr, existingPaymentMethod
        // @if !selfHosted
        , stripe
        // @endif
    ) {
        $analytics.eventTrack('organizationBillingChangePaymentController', { category: 'Modal' });
        $scope.existingPaymentMethod = existingPaymentMethod;
        $scope.paymentMethod = 'card';
        $scope.showPaymentOptions = true;
        $scope.hidePaypal = true;
        $scope.card = {};
        $scope.bank = {};

        $scope.changePaymentMethod = function (val) {
            $scope.paymentMethod = val;
        };

        $scope.submit = function () {
            var stripeReq = null;
            if ($scope.paymentMethod === 'card') {
                stripeReq = stripe.card.createToken($scope.card);
            }
            else if ($scope.paymentMethod === 'bank') {
                $scope.bank.currency = 'USD';
                $scope.bank.country = 'US';
                stripeReq = stripe.bankAccount.createToken($scope.bank);
            }
            else {
                return;
            }

            $scope.submitPromise = stripeReq.then(function (response) {
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
