angular
    .module('bit.settings')

    .controller('settingsBillingController', function ($scope, apiService, authService, $state, $uibModal, toastr, $analytics) {
        $scope.charges = [];
        $scope.paymentSource = null;
        $scope.subscription = null;
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            load();
        });

        $scope.changePayment = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/settingsBillingChangePayment.html',
                controller: 'settingsBillingChangePaymentController',
                resolve: {
                    existingPaymentMethod: function () {
                        return $scope.paymentSource ? $scope.paymentSource.description : null;
                    }
                }
            });

            modal.result.then(function () {
                load();
            });
        };

        $scope.adjustStorage = function (add) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsBillingAdjustStorage.html',
                controller: 'settingsBillingAdjustStorageController',
                resolve: {
                    add: function () {
                        return add;
                    }
                }
            });

            modal.result.then(function () {
                load();
            });
        };

        $scope.cancel = function () {
            if (!confirm('Are you sure you want to cancel? You will lose access to all premium features at the end ' +
                'of this billing cycle.')) {
                return;
            }

            apiService.accounts.putCancelPremium({}, {})
                .$promise.then(function (response) {
                    $analytics.eventTrack('Canceled Premium');
                    toastr.success('Premium subscription has been canceled.');
                    load();
                });
        };

        $scope.reinstate = function () {
            if (!confirm('Are you sure you want to remove the cancellation request and reinstate your premium membership?')) {
                return;
            }

            apiService.accounts.putReinstatePremium({}, {})
                .$promise.then(function (response) {
                    $analytics.eventTrack('Reinstated Premium');
                    toastr.success('Premium cancellation request has been removed.');
                    load();
                });
        };

        function load() {
            authService.getUserProfile().then(function (profile) {
                $scope.premium = profile.premium;
                if (!profile.premium) {
                    return null;
                }

                return apiService.accounts.getBilling({}).$promise;
            }).then(function (billing) {
                if (!billing) {
                    return $state.go('backend.user.settingsPremium');
                }

                var i = 0;

                $scope.subscription = null;
                if (billing && billing.Subscription) {
                    $scope.subscription = {
                        trialEndDate: billing.Subscription.TrialEndDate,
                        cancelledDate: billing.Subscription.CancelledDate,
                        status: billing.Subscription.Status,
                        cancelled: billing.Subscription.Status === 'cancelled',
                        markedForCancel: billing.Subscription.Status === 'active' && billing.Subscription.CancelledDate
                    };
                }

                $scope.nextInvoice = null;
                if (billing && billing.UpcomingInvoice) {
                    $scope.nextInvoice = {
                        date: billing.UpcomingInvoice.Date,
                        amount: billing.UpcomingInvoice.Amount
                    };
                }

                if (billing && billing.Subscription && billing.Subscription.Items) {
                    $scope.subscription.items = [];
                    for (i = 0; i < billing.Subscription.Items.length; i++) {
                        $scope.subscription.items.push({
                            amount: billing.Subscription.Items[i].Amount,
                            name: billing.Subscription.Items[i].Name,
                            interval: billing.Subscription.Items[i].Interval,
                            qty: billing.Subscription.Items[i].Quantity
                        });
                    }
                }

                $scope.paymentSource = null;
                if (billing && billing.PaymentSource) {
                    $scope.paymentSource = {
                        type: billing.PaymentSource.Type,
                        description: billing.PaymentSource.Description,
                        cardBrand: billing.PaymentSource.CardBrand
                    };
                }

                var charges = [];
                if (billing && billing.Charges) {
                    for (i = 0; i < billing.Charges.length; i++) {
                        charges.push({
                            date: billing.Charges[i].CreatedDate,
                            paymentSource: billing.Charges[i].PaymentSource ?
                                billing.Charges[i].PaymentSource.Description : '-',
                            amount: billing.Charges[i].Amount,
                            status: billing.Charges[i].Status,
                            failureMessage: billing.Charges[i].FailureMessage,
                            refunded: billing.Charges[i].Refunded,
                            partiallyRefunded: billing.Charges[i].PartiallyRefunded,
                            refundedAmount: billing.Charges[i].RefundedAmount,
                            invoiceId: billing.Charges[i].InvoiceId
                        });
                    }
                }
                $scope.charges = charges;

                $scope.loading = false;
            });
        }
    });
