angular
    .module('bit.settings')

    .controller('settingsCreateOrganizationController', function ($scope, $state, apiService, cryptoService,
        toastr, $analytics, authService, stripe) {
        $scope.plans = {
            free: {
                basePrice: 0,
                noAdditionalUsers: true,
                noPayment: true
            },
            personal: {
                basePrice: 1,
                annualBasePrice: 12,
                baseUsers: 5,
                userPrice: 1,
                annualUserPrice: 12,
                maxAdditionalUsers: 5
            },
            teams: {
                basePrice: 5,
                annualBasePrice: 60,
                monthlyBasePrice: 8,
                baseUsers: 5,
                userPrice: 2,
                annualUserPrice: 24,
                monthlyUserPrice: 2.5
            }
        };

        $scope.model = {
            plan: 'free',
            additionalUsers: 0,
            interval: 'year',
            ownedBusiness: false
        };

        $scope.totalPrice = function () {
            if ($scope.model.interval === 'month') {
                return ($scope.model.additionalUsers || 0) * $scope.plans[$scope.model.plan].monthlyUserPrice +
                    $scope.plans[$scope.model.plan].monthlyBasePrice;
            }
            else {
                return ($scope.model.additionalUsers || 0) * $scope.plans[$scope.model.plan].annualUserPrice +
                    $scope.plans[$scope.model.plan].annualBasePrice;
            }
        };

        $scope.changedPlan = function () {
            if ($scope.model.plan !== 'teams') {
                $scope.model.interval = 'year';
            }
        };

        $scope.changedBusiness = function () {
            if ($scope.model.ownedBusiness) {
                $scope.model.plan = 'teams'
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
                        planType: model.plan,
                        key: shareKey,
                        cardToken: response.id,
                        additionalUsers: model.additionalUsers,
                        billingEmail: model.billingEmail,
                        businessName: model.ownedBusiness ? model.businessName : null,
                        monthly: model.interval === 'month'
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
