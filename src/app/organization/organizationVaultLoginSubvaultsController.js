angular
    .module('bit.organization')

    .controller('organizationVaultLoginSubvaultsController', function ($scope, apiService, $uibModalInstance, cipherService,
        cipher, $analytics, subvaults) {
        $analytics.eventTrack('organizationVaultLoginSubvaultsController', { category: 'Modal' });
        $scope.cipher = {};
        $scope.subvaults = [];
        $scope.selectedSubvaults = {};

        $uibModalInstance.opened.then(function () {
            var subvaultUsed = [];
            for (var i = 0; i < subvaults.length; i++) {
                if (subvaults[i].id) {
                    subvaultUsed.push(subvaults[i]);
                }
            }
            $scope.subvaults = subvaultUsed;

            $scope.cipher = cipher;

            var selectedSubvaults = {};
            if ($scope.cipher.subvaultIds) {
                for (i = 0; i < $scope.cipher.subvaultIds.length; i++) {
                    selectedSubvaults[$scope.cipher.subvaultIds[i]] = true;
                }
            }
            $scope.selectedSubvaults = selectedSubvaults;
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

            $scope.submitPromise = apiService.ciphers.putSubvaultsAdmin({ id: cipher.id }, request)
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
