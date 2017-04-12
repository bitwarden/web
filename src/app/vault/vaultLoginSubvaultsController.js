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

                return null;
            }).then(function (cipher) {
                if (!cipher) {
                    $scope.loadingSubvaults = false;
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

        $scope.submit = function () {
            var request = {
                subvaultIds: []
            };

            for (var id in $scope.selectedSubvaults) {
                if ($scope.selectedSubvaults.hasOwnProperty(id)) {
                    request.subvaultIds.push(id);
                }
            }

            $scope.submitPromise = apiService.ciphers.putSubvaults({ id: loginId }, request)
                .$promise.then(function (response) {
                    $analytics.eventTrack('Edited Login Subvaults');
                    $uibModalInstance.close({
                        action: 'subvaultsEdit',
                        subvaultIds: request.subvaultIds
                    });
                });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
