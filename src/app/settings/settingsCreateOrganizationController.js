angular
    .module('bit.settings')

    .controller('settingsCreateOrganizationController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        toastr, $analytics, authService) {
        $analytics.eventTrack('settingsCreateOrganizationController', { category: 'Modal' });

        $scope.model = {
            plan: 'Free'
        };

        $scope.submit = function (model) {
            var request = {
                name: model.name,
                planType: model.plan,
                key: cryptoService.makeShareKey()
            };

            $scope.submitPromise = apiService.organizations.post(request, function (result) {
                $uibModalInstance.dismiss('cancel');
                $analytics.eventTrack('Created Organization');
                authService.addProfileOrganization(result);
                $state.go('backend.org.dashboard', { orgId: result.Id }).then(function () {
                    toastr.success('Your new organization is ready to go!', 'Organization Created');
                });
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
