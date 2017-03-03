angular
    .module('bit.settings')

    .controller('settingsCreateOrganizationController', function ($scope, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics) {
        $analytics.eventTrack('settingsCreateOrganizationController', { category: 'Modal' });
        $scope.submit = function (model) {
            var request = {
                masterPasswordHash: cryptoService.hashPassword(model.masterPassword)
            };

            $scope.submitPromise = apiService.organizations.post(request, function () {
                $uibModalInstance.dismiss('cancel');
                $analytics.eventTrack('Created Organization');
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
