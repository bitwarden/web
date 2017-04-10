angular
    .module('bit.organization')

    .controller('organizationBillingController', function ($scope, apiService, $state, $uibModal) {
        $scope.charges = [];
        $scope.paymentSource = null;
        $scope.plan = null;
        $scope.subscription = null;
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            apiService.organizations.getBilling({ id: $state.params.orgId }, function (org) {
                $scope.loading = false;

                $scope.plan = {
                    name: org.Plan,
                    type: org.PlanType,
                    seats: org.Seats
                };

                $scope.subscription = {
                    trialEndDate: org.Subscription.TrialEndDate,
                    nextBillDate: org.Subscription.NextBillDate,
                    cancelNext: org.Subscription.CancelAtNextBillDate,
                    status: org.Subscription.Status
                };

                if (org.Subscription.Items) {
                    $scope.subscription.items = [];
                    for (var i = 0; i < org.Subscription.Items.length; i++) {
                        $scope.subscription.items.push({
                            amount: org.Subscription.Items[i].Amount,
                            name: org.Subscription.Items[i].Name,
                            interval: org.Subscription.Items[i].Interval,
                            qty: org.Subscription.Items[i].Quantity
                        });
                    }
                }

                if (org.PaymentSource) {
                    $scope.paymentSource = {
                        type: org.PaymentSource.Type,
                        description: org.PaymentSource.Description,
                        cardBrand: org.PaymentSource.CardBrand
                    };
                }

                var charges = [];
                for (var i = 0; i < org.Charges.length; i++) {
                    charges.push({
                        date: org.Charges[i].CreatedDate,
                        paymentSource: org.Charges[i].PaymentSource ? org.Charges[i].PaymentSource.Description : '-',
                        amount: org.Charges[i].Amount,
                        status: org.Charges[i].Status,
                        failureMessage: org.Charges[i].FailureMessage,
                        refunded: org.Charges[i].Refunded,
                        partiallyRefunded: org.Charges[i].PartiallyRefunded,
                        refundedAmount: org.Charges[i].RefundedAmount
                    });
                }
                $scope.charges = charges;
            });
        });

        $scope.changePayment = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationBillingChangePayment.html',
                controller: 'organizationBillingChangePaymentController'
            });

            modal.result.then(function () {
                // TODO: reload
            });
        };

        $scope.cancel = function () {

        };
    });
