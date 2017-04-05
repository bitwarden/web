angular
    .module('bit.vault')

    .controller('vaultLoginSubvaultsController', function ($scope, apiService, $uibModalInstance, cipherService,
        loginId, $analytics) {
        $analytics.eventTrack('vaultLoginSubvaultsController', { category: 'Modal' });
        $scope.login = {};
        $scope.readOnly = false;
        $scope.loadingLogin = true;
        $scope.loadingSubvaults = true;
        $scope.selectedSubvaults = {};
        $scope.subvaults = [];

        $uibModalInstance.opened.then(function () {
            apiService.ciphers.getFullDetails({ id: loginId }).$promise.then(function (cipher) {
                $scope.loadingLogin = false;

                $scope.readOnly = !cipher.Edit;
                if (cipher.Edit && cipher.OrganizationId) {
                    if (cipher.Type === 1) {
                        $scope.login = cipherService.decryptLoginPreview(cipher);
                    }

                    var subvaults = {};
                    if (cipher.SubvaultIds) {
                        for (var i = 0; i < cipher.SubvaultIds.length; i++) {
                            subvaults[cipher.SubvaultIds[i]] = true;
                        }
                    }
                    $scope.selectedSubvaults = subvaults;

                    return cipher;
                }

                return;
            }).then(function (cipher) {
                if (!cipher.Edit) {
                    return;
                }

                apiService.subvaults.listMe(function (response) {
                    var subvaults = [];
                    for (var i = 0; i < response.Data.length; i++) {
                        if (response.Data[i].OrganizationId !== cipher.OrganizationId) {
                            continue;
                        }

                        var decSubvault = cipherService.decryptSubvault(response.Data[i]);
                        subvaults.push(decSubvault);
                    }

                    $scope.loadingSubvaults = false;
                    $scope.subvaults = subvaults;
                });
            });
        });

        $scope.toggleSubvaultSelectionAll = function ($event) {
            var subvaults = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.subvaults.length; i++) {
                    subvaults[$scope.subvaults[i].id] = true;
                }
            }

            $scope.selectedSubvaults = subvaults;
        };

        $scope.toggleSubvaultSelection = function (id) {
            if (id in $scope.selectedSubvaults) {
                delete $scope.selectedSubvaults[id];
            }
            else {
                $scope.selectedSubvaults[id] = true;
            }
        };

        $scope.subvaultSelected = function (subvault) {
            return subvault.id in $scope.selectedSubvaults;
        };

        $scope.allSelected = function () {
            return Object.keys($scope.selectedSubvaults).length === $scope.subvaults.length;
        };

        $scope.submit = function (model) {
            var request = {
                subvaultIds: model.subvaultIds
            };

            $scope.submitPromise = apiService.ciphers.putSubvaults({ id: loginId }, request, function (response) {
                $analytics.eventTrack('Edited Login Subvaults');
                $uibModalInstance.close({
                    action: 'subvaultsEdit'
                });
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
