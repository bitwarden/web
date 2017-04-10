angular
    .module('bit.settings')

    .controller('settingsCreateOrganizationController', function ($scope, $state, apiService, cryptoService,
        toastr, $analytics, authService, stripe, constants) {
        $scope.plans = constants.plans;

        $scope.model = {
            plan: 'free',
            additionalSeats: 0,
            interval: 'year',
            ownedBusiness: false
        };

        $scope.totalPrice = function () {
            if ($scope.model.interval === 'month') {
                return ($scope.model.additionalSeats || 0) * $scope.plans[$scope.model.plan].monthlySeatPrice +
                    $scope.plans[$scope.model.plan].monthlyBasePrice;
            }
            else {
                return ($scope.model.additionalSeats || 0) * $scope.plans[$scope.model.plan].annualSeatPrice +
                    $scope.plans[$scope.model.plan].annualBasePrice;
            }
        };

        $scope.changedPlan = function () {
            if ($scope.plans[$scope.model.plan].hasOwnProperty('monthPlanType')) {
                $scope.model.interval = 'year';
            }
        };

        $scope.changedBusiness = function () {
            if ($scope.model.ownedBusiness) {
                $scope.model.plan = 'teams';
            }
        };

        $scope.submit = function (model) {
            var shareKey = cryptoService.makeShareKey();

            if (model.plan === 'free') {
                var freeRequest = {
                    name: model.name,
                    planType: model.plan,
                    key: shareKey,
                    billingEmail: model.billingEmail
                };

                $scope.submitPromise = apiService.organizations.post(freeRequest).$promise.then(finalizeCreate);
            }
            else {
                $scope.submitPromise = stripe.card.createToken(model.card).then(function (response) {
                    var paidRequest = {
                        name: model.name,
                        planType: model.interval === 'month' ? $scope.plans[model.plan].monthPlanType :
                            $scope.plans[model.plan].annualPlanType,
                        key: shareKey,
                        paymentToken: response.id,
                        additionalSeats: model.additionalSeats,
                        billingEmail: model.billingEmail,
                        businessName: model.ownedBusiness ? model.businessName : null
                    };

                    return apiService.organizations.post(paidRequest).$promise;
                }).then(finalizeCreate);
            }

            function finalizeCreate(result) {
                $scope.model.card = null;

                $analytics.eventTrack('Created Organization');
                authService.addProfileOrganizationOwner(result, shareKey);
                $state.go('backend.org.dashboard', { orgId: result.Id }).then(function () {
                    toastr.success('Your new organization is ready to go!', 'Organization Created');
                });
            }
        };
    });
