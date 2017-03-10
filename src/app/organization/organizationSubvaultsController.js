angular
    .module('bit.organization')

    .controller('organizationSubvaultsController', function ($scope, $state, apiService, $uibModal, cipherService) {
        $scope.subvaults = [];
        $scope.loading = true;
        $scope.$on('$viewContentLoaded', function () {
            loadList();
        });

        $scope.add = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationSubvaultsAdd.html',
                controller: 'organizationSubvaultsAddController'
            });

            modal.result.then(function (subvault) {
                $scope.subvaults.push(subvault);
            });
        };

        $scope.delete = function (subvault) {
            if (!confirm('Are you sure you want to delete this subvault (' + subvault.name + ')?')) {
                return;
            }

            apiService.subvaults.del({ orgId: $state.params.orgId, id: subvault.id }, function () {
                var index = $scope.subvaults.indexOf(subvault);
                if (index > -1) {
                    $scope.subvaults.splice(index, 1);
                }
            });
        };

        function loadList() {
            apiService.subvaults.listOrganization({ orgId: $state.params.orgId }, function (list) {
                $scope.subvaults = cipherService.decryptSubvaults(list.Data, $state.params.orgId, true);
                $scope.loading = false;
            });
        }
    });
