angular
    .module('bit.settings')

    .controller('settingsPremiumController', function ($scope, $state, apiService, toastr, $analytics, authService, stripe,
        constants, $timeout, appSettings) {
        authService.getUserProfile().then(function (profile) {
            if (profile.premium) {
                return $state.go('backend.user.settingsBilling');
            }
        });

        var btInstance = null;
        $scope.storageGbPrice = constants.storageGb.yearlyPrice;
        $scope.premiumPrice = constants.premium.price;
        $scope.paymentMethod = 'card';
        $scope.dropinLoaded = false;

        $scope.model = {
            additionalStorageGb: null
        };

        $scope.changePaymentMethod = function () {
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

        $scope.totalPrice = function () {
            return $scope.premiumPrice + (($scope.model.additionalStorageGb || 0) * $scope.storageGbPrice);
        };

        $scope.submit = function (model) {
            $scope.submitPromise = getPaymentToken(model).then(function (token) {
                if (!token) {
                    throw 'No payment token.';
                }

                var request = {
                    paymentToken: token,
                    additionalStorageGb: model.additionalStorageGb
                };

                return apiService.accounts.postPremium(request).$promise;
            }, function (err) {
                throw err;
            }).then(function (result) {
                return authService.updateProfilePremium(true);
            }).then(function () {
                $analytics.eventTrack('Signed Up Premium');
                return authService.refreshAccessToken();
            }).then(function () {
                return $state.go('backend.user.settingsBilling');
            }).then(function () {
                toastr.success('Premium upgrade complete.', 'Success');
            });
        };

        function getPaymentToken(model) {
            if ($scope.paymentMethod === 'paypal') {
                return btInstance.requestPaymentMethod().then(function (payload) {
                    return payload.nonce;
                }).catch(function (err) {
                    throw err.message;
                });
            }
            else {
                return stripe.card.createToken(model.card).then(function (response) {
                    return response.id;
                }).catch(function (err) {
                    throw err.message;
                });
            }
        }
    });
