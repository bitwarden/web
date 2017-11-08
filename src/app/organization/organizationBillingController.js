angular
    .module('bit.organization')

    .controller('organizationBillingController', function ($scope, apiService, $state, $uibModal, toastr, $analytics,
        appSettings, tokenService, $window) {
        $scope.selfHosted = appSettings.selfHosted;
        $scope.charges = [];
        $scope.paymentSource = null;
        $scope.plan = null;
        $scope.subscription = null;
        $scope.loading = true;
        var license = null;
        $scope.expiration = null;

        $scope.$on('$viewContentLoaded', function () {
            load();
        });

        $scope.changePayment = function () {
            if ($scope.selfHosted) {
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsBillingChangePayment.html',
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

        $scope.changePlan = function () {
            if ($scope.selfHosted) {
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationBillingChangePlan.html',
                controller: 'organizationBillingChangePlanController',
                resolve: {
                    plan: function () {
                        return $scope.plan;
                    }
                }
            });

            modal.result.then(function () {
                load();
            });
        };

        $scope.adjustSeats = function (add) {
            if ($scope.selfHosted || !$scope.canAdjustSeats) {
                return;
            }

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

        $scope.adjustStorage = function (add) {
            if ($scope.selfHosted) {
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsBillingAdjustStorage.html',
                controller: 'organizationBillingAdjustStorageController',
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

        $scope.verifyBank = function () {
            if ($scope.selfHosted) {
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationBillingVerifyBank.html',
                controller: 'organizationBillingVerifyBankController'
            });

            modal.result.then(function () {
                load();
            });
        };

        $scope.cancel = function () {
            if ($scope.selfHosted) {
                return;
            }

            if (!confirm('Are you sure you want to cancel? All users will lose access to the organization ' +
                'at the end of this billing cycle.')) {
                return;
            }

            apiService.organizations.putCancel({ id: $state.params.orgId }, {})
                .$promise.then(function (response) {
                    $analytics.eventTrack('Canceled Plan');
                    toastr.success('Organization subscription has been canceled.');
                    load();
                });
        };

        $scope.reinstate = function () {
            if ($scope.selfHosted) {
                return;
            }

            if (!confirm('Are you sure you want to remove the cancellation request and reinstate this organization?')) {
                return;
            }

            apiService.organizations.putReinstate({ id: $state.params.orgId }, {})
                .$promise.then(function (response) {
                    $analytics.eventTrack('Reinstated Plan');
                    toastr.success('Organization cancellation request has been removed.');
                    load();
                });
        };

        $scope.updateLicense = function () {
            if (!$scope.selfHosted) {
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsBillingUpdateLicense.html',
                controller: 'organizationBillingUpdateLicenseController'
            });

            modal.result.then(function () {
                load();
            });
        };

        $scope.license = function () {
            if ($scope.selfHosted) {
                return;
            }

            var installationId = prompt("Enter your installation id");
            if (!installationId || installationId === '') {
                return;
            }

            apiService.organizations.getLicense({
                id: $state.params.orgId,
                installationId: installationId
            }, function (license) {
                var licenseString = JSON.stringify(license, null, 2);
                var licenseBlob = new Blob([licenseString]);

                // IE hack. ref http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                if (window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveBlob(licenseBlob, 'bitwarden_organization_license.json');
                }
                else {
                    var a = window.document.createElement('a');
                    a.href = window.URL.createObjectURL(licenseBlob, { type: 'text/plain' });
                    a.download = 'bitwarden_organization_license.json';
                    document.body.appendChild(a);
                    // IE: "Access is denied". 
                    // ref: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
                    a.click();
                    document.body.removeChild(a);
                }
            }, function (err) {
                if (err.status === 400) {
                    toastr.error("Invalid installation id.");
                }
                else {
                    toastr.error("Unable to generate license.");
                }
            });
        };

        $scope.viewInvoice = function (charge) {
            if ($scope.selfHosted) {
                return;
            }
            var url = appSettings.apiUri + '/organizations/' + $state.params.orgId +
                '/billing-invoice/' + charge.invoiceId + '?access_token=' + tokenService.getToken();
            $window.open(url);
        };

        function load() {
            apiService.organizations.getBilling({ id: $state.params.orgId }, function (org) {
                $scope.loading = false;
                $scope.noSubscription = org.PlanType === 0;
                $scope.canAdjustSeats = org.PlanType > 1;

                var i = 0;
                $scope.expiration = org.Expiration;
                license = org.License;

                $scope.plan = {
                    name: org.Plan,
                    type: org.PlanType,
                    seats: org.Seats
                };

                $scope.storage = null;
                if ($scope && org.MaxStorageGb) {
                    $scope.storage = {
                        currentGb: org.StorageGb || 0,
                        maxGb: org.MaxStorageGb,
                        currentName: org.StorageName || '0 GB'
                    };

                    $scope.storage.percentage = +(100 * ($scope.storage.currentGb / $scope.storage.maxGb)).toFixed(2);
                }

                $scope.subscription = null;
                if (org.Subscription) {
                    $scope.subscription = {
                        trialEndDate: org.Subscription.TrialEndDate,
                        cancelledDate: org.Subscription.CancelledDate,
                        status: org.Subscription.Status,
                        cancelled: org.Subscription.Cancelled,
                        markedForCancel: !org.Subscription.Cancelled && org.Subscription.CancelAtEndDate
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
                        cardBrand: org.PaymentSource.CardBrand,
                        needsVerification: org.PaymentSource.NeedsVerification
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
