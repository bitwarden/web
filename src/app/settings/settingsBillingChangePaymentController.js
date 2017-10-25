angular
    .module('bit.organization')

    .controller('settingsBillingChangePaymentController', function ($scope, $state, $uibModalInstance, apiService,
        $analytics, toastr, existingPaymentMethod, appSettings, $timeout
        // @if !selfHosted
        /* jshint ignore:start */
        , stripe
        /* jshint ignore:end */
        // @endif
    ) {
        $analytics.eventTrack('settingsBillingChangePaymentController', { category: 'Modal' });
        $scope.existingPaymentMethod = existingPaymentMethod;
        $scope.paymentMethod = 'card';
        $scope.dropinLoaded = false;
        $scope.showPaymentOptions = false;
        $scope.hideBank = true;
        $scope.card = {};
        var btInstance = null;

        $scope.changePaymentMethod = function (val) {
            $scope.paymentMethod = val;
            if ($scope.paymentMethod !== 'paypal') {
                return;
            }

            braintree.dropin.create({
                authorization: appSettings.braintreeKey,
                container: '#bt-dropin-container',
                paymentOptionPriority: ['paypal'],
                paypal: {
                    flow: 'vault',
                    buttonStyle: {
                        label: 'pay',
                        size: 'medium',
                        shape: 'pill',
                        color: 'blue'
                    }
                }
            }, function (createErr, instance) {
                if (createErr) {
                    console.error(createErr);
                    return;
                }

                btInstance = instance;
                $timeout(function () {
                    $scope.dropinLoaded = true;
                });
            });
        };

        $scope.submit = function () {
            $scope.submitPromise = getPaymentToken($scope.card).then(function (token) {
                if (!token) {
                    throw 'No payment token.';
                }

                var request = {
                    paymentToken: token
                };

                return apiService.accounts.putPayment(null, request).$promise;
            }, function (err) {
                throw err;
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

        function getPaymentToken(card) {
            if ($scope.paymentMethod === 'paypal') {
                return btInstance.requestPaymentMethod().then(function (payload) {
                    return payload.nonce;
                }).catch(function (err) {
                    throw err.message;
                });
            }
            else {
                return stripe.card.createToken(card).then(function (response) {
                    return response.id;
                }).catch(function (err) {
                    throw err.message;
                });
            }
        }
    });
