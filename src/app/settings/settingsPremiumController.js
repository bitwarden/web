angular
    .module('bit.settings')

    .controller('settingsPremiumController', function ($scope, $state, apiService, toastr, $analytics, authService,
        constants, $timeout, appSettings, validationService
        // @if !selfHosted
        , stripe
        // @endif
    ) {
        var profile = null;

        authService.getUserProfile().then(function (theProfile) {
            profile = theProfile;
            if (profile && profile.premium) {
                return $state.go('backend.user.settingsBilling');
            }
        });

        $scope.selfHosted = appSettings.selfHosted;

        var btInstance = null;
        $scope.storageGbPrice = constants.storageGb.yearlyPrice;
        $scope.premiumPrice = constants.premium.price;
        $scope.paymentMethod = 'card';
        $scope.dropinLoaded = false;

        $scope.model = {
            additionalStorageGb: null
        };

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

        $scope.totalPrice = function () {
            return $scope.premiumPrice + (($scope.model.additionalStorageGb || 0) * $scope.storageGbPrice);
        };

        $scope.submit = function (model, form) {
            if ($scope.selfHosted) {
                if (profile && !profile.emailVerified) {
                    validationService.addError(form, null, 'Your account\'s email address first must be verified.', true);
                    return;
                }

                var fileEl = document.getElementById('file');
                var files = fileEl.files;
                if (!files || !files.length) {
                    validationService.addError(form, 'file', 'Select a license file.', true);
                    return;
                }

                var fd = new FormData();
                fd.append('license', files[0]);

                $scope.submitPromise = apiService.accounts.postPremium(fd).$promise.then(function (result) {
                    return finalizePremium();
                });
            }
            else {
                $scope.submitPromise = getPaymentToken(model).then(function (token) {
                    if (!token) {
                        throw 'No payment token.';
                    }

                    var fd = new FormData();
                    fd.append('paymentToken', token);
                    fd.append('additionalStorageGb', model.additionalStorageGb || 0);

                    return apiService.accounts.postPremium(fd).$promise;
                }, function (err) {
                    throw err;
                }).then(function (result) {
                    return finalizePremium();
                });
            }
        };

        function finalizePremium() {
            return authService.updateProfilePremium(true).then(function () {
                $analytics.eventTrack('Signed Up Premium');
                return authService.refreshAccessToken();
            }).then(function () {
                return $state.go('backend.user.settingsBilling');
            }).then(function () {
                toastr.success('Premium upgrade complete.', 'Success');
            });
        }

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
