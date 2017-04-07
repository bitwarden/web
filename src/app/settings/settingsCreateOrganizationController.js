angular
    .module('bit.settings')

    .controller('settingsCreateOrganizationController', function ($scope, $state, apiService, cryptoService,
        toastr, $analytics, authService, stripe) {
        $scope.plans = {
            free: {
                basePrice: 0
            },
            personal: {
                basePrice: 1,
                annualBasePrice: 12,
                baseUsers: 3,
                userPrice: 1,
                annualUserPrice: 12
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
            plan: 'personal',
            additionalUsers: 0,
            interval: 'year'
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

        $scope.submit = function (model) {
            var shareKey = cryptoService.makeShareKey();

            $scope.submitPromise = stripe.card.createToken(model.card).then(function (response) {
                var request = {
                    name: model.name,
                    planType: model.plan,
                    key: shareKey,
                    cardToken: response.id,
                    additionalUsers: model.additionalUsers,
                    billingEmail: model.billingEmail,
                    businessName: model.ownedBusiness ? model.businessName : null,
                    monthly: model.interval === 'month'
                };

                return apiService.organizations.post(request).$promise;
            }).then(function (result) {
                $scope.model.card = null;

                $analytics.eventTrack('Created Organization');
                authService.addProfileOrganizationOwner(result, shareKey);
                $state.go('backend.org.dashboard', { orgId: result.Id }).then(function () {
                    toastr.success('Your new organization is ready to go!', 'Organization Created');
                });
            });
        };
    });
