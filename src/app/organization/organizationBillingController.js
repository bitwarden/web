angular
    .module('bit.organization')

    .controller('organizationBillingController', function ($scope, apiService, $state, $uibModal, toastr) {
        $scope.charges = [];
        $scope.paymentSource = null;
        $scope.plan = null;
        $scope.subscription = null;
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            load();
        });

        $scope.changePayment = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationBillingChangePayment.html',
                controller: 'organizationBillingChangePaymentController',
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

        $scope.adjustSeats = function (add) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationBillingAdjustSeats.html',
                controller: 'organizationBillingAdjustSeatsController',
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
            if (!confirm('Are you sure you want to cancel? All users will lose access to the organization ' +
                'at the end of this billing cycle.')) {
                return;
            }

            apiService.organizations.putCancel({ id: $state.params.orgId }, {})
                .$promise.then(function (response) {
                    toastr.success('Organization subscription has been canceled.');
                    load();
                });
        };

        $scope.reinstate = function () {
            if (!confirm('Are you sure you want to remove the cancellation request and reinstate this organization?')) {
                return;
            }

            apiService.organizations.putReinstate({ id: $state.params.orgId }, {})
                .$promise.then(function (response) {
                    toastr.success('Organization cancellation request has been removed.');
                    load();
                });
        };

        function load() {
            apiService.organizations.getBilling({ id: $state.params.orgId }, function (org) {
                $scope.loading = false;
                $scope.noSubscription = org.PlanType === 0;

                var i = 0;

                $scope.plan = {
                    name: org.Plan,
                    type: org.PlanType,
                    seats: org.Seats
                };

                $scope.subscription = null;
                if (org.Subscription) {
                    $scope.subscription = {
                        trialEndDate: org.Subscription.TrialEndDate,
                        cancelledDate: org.Subscription.CancelledDate,
                        status: org.Subscription.Status,
                        cancelled: org.Subscription.Status === 'cancelled',
                        markedForCancel: org.Subscription.Status === 'active' && org.Subscription.CancelledDate
                    };
                }

                $scope.nextInvoice = null;
                if (org.UpcomingInvoice) {
                    $scope.nextInvoice = {
                        date: org.UpcomingInvoice.Date,
                        amount: org.UpcomingInvoice.Amount
                    };
                }

                if (org.Subscription && org.Subscription.Items) {
                    $scope.subscription.items = [];
                    for (i = 0; i < org.Subscription.Items.length; i++) {
                        $scope.subscription.items.push({
                            amount: org.Subscription.Items[i].Amount,
                            name: org.Subscription.Items[i].Name,
                            interval: org.Subscription.Items[i].Interval,
                            qty: org.Subscription.Items[i].Quantity
                        });
                    }
                }

                $scope.paymentSource = null;
                if (org.PaymentSource) {
                    $scope.paymentSource = {
                        type: org.PaymentSource.Type,
                        description: org.PaymentSource.Description,
                        cardBrand: org.PaymentSource.CardBrand
                    };
                }

                var charges = [];
                for (i = 0; i < org.Charges.length; i++) {
                    charges.push({
                        date: org.Charges[i].CreatedDate,
                        paymentSource: org.Charges[i].PaymentSource ? org.Charges[i].PaymentSource.Description : '-',
                        amount: org.Charges[i].Amount,
                        status: org.Charges[i].Status,
                        failureMessage: org.Charges[i].FailureMessage,
                        refunded: org.Charges[i].Refunded,
                        partiallyRefunded: org.Charges[i].PartiallyRefunded,
                        refundedAmount: org.Charges[i].RefundedAmount,
                        invoiceId: org.Charges[i].InvoiceId
                    });
                }
                $scope.charges = charges;
            });
        }
    });
