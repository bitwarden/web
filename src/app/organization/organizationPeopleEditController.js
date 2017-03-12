angular
    .module('bit.organization')

    .controller('organizationPeopleEditController', function ($scope, $state, $uibModalInstance, apiService, cipherService, id) {
        $scope.loading = true;
        $scope.selectedSubvaults = [];
        $scope.selectedSubvaultsReadOnly = [];

        $uibModalInstance.opened.then(function () {
            apiService.subvaults.listOrganization({ orgId: $state.params.orgId }, function (list) {
                $scope.subvaults = cipherService.decryptSubvaults(list.Data, $state.params.orgId, true);
                $scope.loading = false;
            });

            apiService.organizationUsers.get({ orgId: $state.params.orgId, id: id }, function (user) {
                if (user && user.Subvaults) {
                    var subvaults = [];
                    var subvaultsReadOnly = [];
                    for (var i = 0; i < user.Subvaults.Data.length; i++) {
                        subvaults.push(user.Subvaults.Data[i].SubvaultId);
                        if (user.Subvaults.Data[i].ReadOnly) {
                            subvaultsReadOnly.push(user.Subvaults.Data[i].SubvaultId);
                        }
                    }
                }
                $scope.selectedSubvaults = subvaults;
                $scope.selectedSubvaultsReadOnly = subvaultsReadOnly;
            });
        });

        $scope.toggleSubvaultSelectionAll = function ($event) {
            var subvaultIds = [];
            if ($event.target.checked) {
                for (var i = 0; i < $scope.subvaults.length; i++) {
                    subvaultIds.push($scope.subvaults[i].id);
                }
            }
            else {
                $scope.selectedSubvaultsReadOnly = [];
            }

            $scope.selectedSubvaults = subvaultIds;
        };

        $scope.toggleSubvaultSelection = function (id) {
            var i = $scope.selectedSubvaults.indexOf(id);
            if (i > -1) {
                $scope.selectedSubvaults.splice(i, 1);

                var j = $scope.selectedSubvaultsReadOnly.indexOf(id);
                if (j > -1) {
                    $scope.selectedSubvaultsReadOnly.splice(j, 1);
                }
            }
            else {
                $scope.selectedSubvaults.push(id);
            }
        };

        $scope.toggleSubvaultReadOnlySelection = function (id) {
            var i = $scope.selectedSubvaultsReadOnly.indexOf(id);
            if (i > -1) {
                $scope.selectedSubvaultsReadOnly.splice(i, 1);
            }
            else {
                $scope.selectedSubvaultsReadOnly.push(id);
            }
        };

        $scope.submit = function (model) {
            var subvaults = [];
            for (var i = 0; i < $scope.selectedSubvaults.length; i++) {
                subvaults.push({
                    id: null,
                    subvaultId: $scope.selectedSubvaults[i],
                    readOnly: $scope.selectedSubvaultsReadOnly.indexOf($scope.selectedSubvaults[i]) > -1
                });
            }

            apiService.organizationUsers.put({ orgId: $state.params.orgId, id: 0 }, {
                subvaults: subvaults
            }, function () {
                $uibModalInstance.close();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
