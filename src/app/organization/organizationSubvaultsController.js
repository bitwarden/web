angular
    .module('bit.organization')

    .controller('organizationSubvaultsController', function ($scope, $state, apiService, $uibModal, cipherService, $filter,
        toastr) {
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

        $scope.edit = function (subvault) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationSubvaultsEdit.html',
                controller: 'organizationSubvaultsEditController',
                resolve: {
                    id: function () { return subvault.id; }
                }
            });

            modal.result.then(function (editedSubvault) {
                var existingSubvaults = $filter('filter')($scope.subvaults, { id: editedSubvault.id }, true);
                if (existingSubvaults && existingSubvaults.length > 0) {
                    existingSubvaults[0].name = editedSubvault.name;
                }
            });
        };

        $scope.users = function (subvault) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationSubvaultsUsers.html',
                controller: 'organizationSubvaultsUsersController',
                size: 'lg',
                windowClass: 'organizationSubvaultsUsersModal',
                resolve: {
                    subvault: function () { return subvault; }
                }
            });

            modal.result.then(function () {
                // nothing to do
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

                toastr.success(subvault.name + ' has been deleted.', 'Subvault Deleted');
            }, function () {
                toastr.error(subvault.name + ' was not able to be deleted.', 'Error');
            });
        };

        function loadList() {
            apiService.subvaults.listOrganization({ orgId: $state.params.orgId }, function (list) {
                $scope.subvaults = cipherService.decryptSubvaults(list.Data, $state.params.orgId, true);
                $scope.loading = false;
            });
        }
    });
