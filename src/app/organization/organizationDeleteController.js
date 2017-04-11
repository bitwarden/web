angular
    .module('bit.organization')

    .controller('organizationDeleteController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics) {
        $analytics.eventTrack('organizationDeleteController', { category: 'Modal' });
        $scope.submit = function () {
            var request = {
                masterPasswordHash: cryptoService.hashPassword($scope.masterPassword)
            };

            $scope.submitPromise = apiService.organizations.del({ id: $state.params.orgId }, request, function () {
                $uibModalInstance.dismiss('cancel');
                authService.removeProfileOrganization($state.params.orgId);
                $analytics.eventTrack('Deleted Organization');
                $state.go('backend.user.vault').then(function () {
                    toastr.success('This organization and all associated data has been deleted.',
                        'Organization Deleted');
                });
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
