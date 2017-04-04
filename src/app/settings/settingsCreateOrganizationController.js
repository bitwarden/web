angular
    .module('bit.settings')

    .controller('settingsCreateOrganizationController', function($scope, $state, apiService, $uibModalInstance, cryptoService,
        toastr, $analytics, authService, stripe) {
        $analytics.eventTrack('settingsCreateOrganizationController', { category: 'Modal' });

        $scope.model = {
            plan: 'Personal'
        };

        $scope.submit = function(model) {
            $scope.submitPromise = stripe.card.createToken(model.card).then(function(response) {
                var request = {
                    name: model.name,
                    planType: model.plan,
                    key: cryptoService.makeShareKey(),
                    cardToken: response.id
                };

                return apiService.organizations.post(request).$promise;
            }).then(function(result) {
                $scope.model.card = null;

                $uibModalInstance.dismiss('cancel');
                $analytics.eventTrack('Created Organization');
                authService.addProfileOrganization(result);
                $state.go('backend.org.dashboard', { orgId: result.Id }).then(function() {
                    toastr.success('Your new organization is ready to go!', 'Organization Created');
                });
            });
        };

        $scope.close = function() {
            $uibModalInstance.dismiss('cancel');
        };
    });
