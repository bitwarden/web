angular
    .module('bit.organization')

    .controller('organizationPeopleEditController', function ($scope, $state, $uibModalInstance, apiService, cipherService, id,
        $analytics) {
        $analytics.eventTrack('organizationPeopleEditController', { category: 'Modal' });

        $scope.loading = true;
        $scope.subvaults = [];
        $scope.selectedSubvaults = {};

        $uibModalInstance.opened.then(function () {
            apiService.subvaults.listOrganization({ orgId: $state.params.orgId }, function (list) {
                $scope.subvaults = cipherService.decryptSubvaults(list.Data, $state.params.orgId, true);
                $scope.loading = false;
            });

            apiService.organizationUsers.get({ orgId: $state.params.orgId, id: id }, function (user) {
                var subvaults = {};
                if (user && user.Subvaults) {
                    for (var i = 0; i < user.Subvaults.Data.length; i++) {
                        subvaults[user.Subvaults.Data[i].SubvaultId] = {
                            subvaultId: user.Subvaults.Data[i].SubvaultId,
                            readOnly: user.Subvaults.Data[i].ReadOnly
                        };
                    }
                }
                $scope.email = user.Email;
                $scope.type = user.Type;
                $scope.accessAllSubvaults = user.AccessAllSubvaults;
                $scope.selectedSubvaults = subvaults;
            });
        });

        $scope.toggleSubvaultSelectionAll = function ($event) {
            var subvaults = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.subvaults.length; i++) {
                    subvaults[$scope.subvaults[i].id] = {
                        subvaultId: $scope.subvaults[i].id,
                        readOnly: ($scope.subvaults[i].id in $scope.selectedSubvaults) ?
                            $scope.selectedSubvaults[$scope.subvaults[i].id].readOnly : false
                    };
                }
            }

            $scope.selectedSubvaults = subvaults;
        };

        $scope.toggleSubvaultSelection = function (id) {
            if (id in $scope.selectedSubvaults) {
                delete $scope.selectedSubvaults[id];
            }
            else {
                $scope.selectedSubvaults[id] = {
                    subvaultId: id,
                    readOnly: false
                };
            }
        };

        $scope.toggleSubvaultReadOnlySelection = function (id) {
            if (id in $scope.selectedSubvaults) {
                $scope.selectedSubvaults[id].readOnly = !!!$scope.selectedSubvaults[id].readOnly;
            }
        };

        $scope.subvaultSelected = function (subvault) {
            return subvault.id in $scope.selectedSubvaults;
        };

        $scope.allSelected = function () {
            return Object.keys($scope.selectedSubvaults).length === $scope.subvaults.length;
        };

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            var subvaults = [];
            if (!$scope.accessAllSubvaults) {
                for (var subvaultId in $scope.selectedSubvaults) {
                    if ($scope.selectedSubvaults.hasOwnProperty(subvaultId)) {
                        subvaults.push($scope.selectedSubvaults[subvaultId]);
                    }
                }
            }

            $scope.submitPromise = apiService.organizationUsers.put({ orgId: $state.params.orgId, id: id }, {
                type: $scope.type,
                subvaults: subvaults,
                accessAllSubvaults: $scope.accessAllSubvaults
            }, function () {
                $analytics.eventTrack('Edited User');
                $uibModalInstance.close();
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
