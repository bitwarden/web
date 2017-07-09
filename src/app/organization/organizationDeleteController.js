angular
    .module('bit.organization')

    .controller('organizationDeleteController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics) {
        $analytics.eventTrack('organizationDeleteController', { category: 'Modal' });
        $scope.submit = function () {
            $scope.submitPromise = cryptoService.hashPassword($scope.masterPassword).then(function (hash) {
                return apiService.organizations.del({ id: $state.params.orgId }, {
                    masterPasswordHash: hash
                }).$promise;
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.removeProfileOrganization($state.params.orgId);
                $analytics.eventTrack('Deleted Organization');
                return $state.go('backend.user.vault');
            }).then(function () {
                toastr.success('This organization and all associated data has been deleted.', 'Organization Deleted');
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
