angular
    .module('bit.settings')

    .controller('settingsCreateOrganizationController', function ($scope, $state, apiService, cryptoService,
        toastr, $analytics, authService, constants, appSettings, validationService
        // @if !selfHosted
        , stripe
        // @endif
    ) {
        $scope.plans = constants.plans;
        $scope.storageGb = constants.storageGb;
        $scope.paymentMethod = 'card';
        $scope.selfHosted = appSettings.selfHosted;

        $scope.model = {
            plan: 'free',
            additionalSeats: 0,
            interval: 'year',
            ownedBusiness: false,
            additionalStorageGb: null
        };

        $scope.totalPrice = function () {
            if ($scope.model.interval === 'month') {
                return (($scope.model.additionalSeats || 0) * ($scope.plans[$scope.model.plan].monthlySeatPrice || 0)) +
                    (($scope.model.additionalStorageGb || 0) * $scope.storageGb.monthlyPrice) +
                    ($scope.plans[$scope.model.plan].monthlyBasePrice || 0);
            }
            else {
                return (($scope.model.additionalSeats || 0) * ($scope.plans[$scope.model.plan].annualSeatPrice || 0)) +
                    (($scope.model.additionalStorageGb || 0) * $scope.storageGb.yearlyPrice) +
                    ($scope.plans[$scope.model.plan].annualBasePrice || 0);
            }
        };

        $scope.changePaymentMethod = function (val) {
            $scope.paymentMethod = val;
        };

        $scope.changedPlan = function () {
            if ($scope.plans[$scope.model.plan].hasOwnProperty('monthPlanType')) {
                $scope.model.interval = 'year';
            }

            if ($scope.plans[$scope.model.plan].noAdditionalSeats) {
                $scope.model.additionalSeats = 0;
            }
            else if (!$scope.model.additionalSeats && !$scope.plans[$scope.model.plan].baseSeats &&
                !$scope.plans[$scope.model.plan].noAdditionalSeats) {
                $scope.model.additionalSeats = 1;
            }
        };

        $scope.changedBusiness = function () {
            if ($scope.model.ownedBusiness) {
                $scope.model.plan = 'teams';
            }
        };

        $scope.submit = function (model, form) {
            var shareKey = cryptoService.makeShareKey();
            var defaultCollectionCt = cryptoService.encrypt('Default Collection', shareKey.key);

            if ($scope.selfHosted) {
                var fileEl = document.getElementById('file');
                var files = fileEl.files;
                if (!files || !files.length) {
                    validationService.addError(form, 'file', 'Select a license file.', true);
                    return;
                }

                var fd = new FormData();
                fd.append('license', files[0]);
                fd.append('key', shareKey.ct);
                fd.append('collectionName', defaultCollectionCt);

                $scope.submitPromise = apiService.organizations.postLicense(fd).$promise.then(finalizeCreate);
            }
            else {
                if (model.plan === 'free') {
                    var freeRequest = {
                        name: model.name,
                        planType: model.plan,
                        key: shareKey.ct,
                        billingEmail: model.billingEmail,
                        collectionName: defaultCollectionCt
                    };

                    $scope.submitPromise = apiService.organizations.post(freeRequest).$promise.then(finalizeCreate);
                }
                else {
                    var stripeReq = null;
                    if ($scope.paymentMethod === 'card') {
                        stripeReq = stripe.card.createToken(model.card);
                    }
                    else if ($scope.paymentMethod === 'bank') {
                        model.bank.currency = 'USD';
                        model.bank.country = 'US';
                        stripeReq = stripe.bankAccount.createToken(model.bank);
                    }
                    else {
                        return;
                    }

                    $scope.submitPromise = stripeReq.then(function (response) {
                        var paidRequest = {
                            name: model.name,
                            planType: model.interval === 'month' ? $scope.plans[model.plan].monthPlanType :
                                $scope.plans[model.plan].annualPlanType,
                            key: shareKey.ct,
                            paymentToken: response.id,
                            additionalSeats: model.additionalSeats,
                            additionalStorageGb: model.additionalStorageGb,
                            billingEmail: model.billingEmail,
                            businessName: model.ownedBusiness ? model.businessName : null,
                            collectionName: defaultCollectionCt
                        };

                        return apiService.organizations.post(paidRequest).$promise;
                    }, function (err) {
                        throw err.message;
                    }).then(finalizeCreate);
                }
            }

            function finalizeCreate(result) {
                $analytics.eventTrack('Created Organization');
                authService.addProfileOrganizationOwner(result, shareKey.ct);
                authService.refreshAccessToken().then(function () {
                    goToOrg(result.Id);
                }, function () {
                    goToOrg(result.Id);
                });
            }

            function goToOrg(id) {
                $state.go('backend.org.dashboard', { orgId: id }).then(function () {
                    toastr.success('Your new organization is ready to go!', 'Organization Created');
                });
            }
        };
    });
