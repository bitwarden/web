angular
    .module('bit.organization')

    .controller('organizationSubvaultsController', function ($scope, $state, apiService) {
        $scope.subvaults = [];
        $scope.loading = true;
        $scope.$on('$viewContentLoaded', function () {
            loadList();
        });

        function loadList() {
            apiService.subvaults.listOrganization({ orgId: $state.params.orgId }, function (list) {
                var subvaults = [];

                for (var i = 0; i < list.Data.length; i++) {
                    subvaults.push({
                        id: list.Data[i].Id,
                        name: list.Data[i].Name
                    });
                }

                $scope.subvaults = subvaults;
                $scope.loading = false;
            });
        }
    });
