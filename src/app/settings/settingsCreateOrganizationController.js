angular
    .module('bit.settings')

    .controller('settingsCreateOrganizationController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        toastr, $analytics, authService, stripe) {
        $analytics.eventTrack('settingsCreateOrganizationController', { category: 'Modal' });

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
            interval: 'annually'
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
                    monthly: model.interval === 'monthly'
                };

                return apiService.organizations.post(request).$promise;
            }).then(function (result) {
                $scope.model.card = null;

                $uibModalInstance.dismiss('cancel');
                $analytics.eventTrack('Created Organization');
                authService.addProfileOrganizationOwner(result, shareKey);
                $state.go('backend.org.dashboard', { orgId: result.Id }).then(function () {
                    toastr.success('Your new organization is ready to go!', 'Organization Created');
                });
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
