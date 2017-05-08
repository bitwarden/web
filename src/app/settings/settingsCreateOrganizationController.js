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
                return ($scope.model.additionalSeats || 0) * ($scope.plans[$scope.model.plan].monthlySeatPrice || 0) +
                    ($scope.plans[$scope.model.plan].monthlyBasePrice || 0);
            }
            else {
                return ($scope.model.additionalSeats || 0) * ($scope.plans[$scope.model.plan].annualSeatPrice || 0) +
                    ($scope.plans[$scope.model.plan].annualBasePrice || 0);
            }
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

        $scope.submit = function (model) {
            var shareKeyCt = cryptoService.makeShareKeyCt();

            if (model.plan === 'free') {
                var freeRequest = {
                    name: model.name,
                    planType: model.plan,
                    key: shareKeyCt,
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
                        key: shareKeyCt,
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
                authService.addProfileOrganizationOwner(result, shareKeyCt);
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
