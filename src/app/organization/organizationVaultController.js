angular
    .module('bit.vault')

    .controller('organizationVaultController', function ($scope, apiService, cipherService, $analytics, $q, $state,
        $localStorage, $uibModal, $filter) {
        $scope.logins = [];
        $scope.subvaults = [];
        $scope.folders = [];
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            var subvaultPromise = apiService.subvaults.listOrganization({ orgId: $state.params.orgId }, function (subvaults) {
                var decSubvaults = [];

                for (var i = 0; i < subvaults.Data.length; i++) {
                    var decSubvault = cipherService.decryptSubvault(subvaults.Data[i], null, true);
                    decSubvault.collapsed = $localStorage.collapsedSubvaults &&
                        decSubvault.id in $localStorage.collapsedSubvaults;
                    decSubvaults.push(decSubvault);
                }

                $scope.subvaults = decSubvaults;
            }).$promise;

            var cipherPromise = apiService.ciphers.listOrganizationDetails({ organizationId: $state.params.orgId },
                function (ciphers) {
                    var decLogins = [];

                    for (var i = 0; i < ciphers.Data.length; i++) {
                        if (ciphers.Data[i].Type === 1) {
                            var decLogin = cipherService.decryptLoginPreview(ciphers.Data[i]);
                            decLogins.push(decLogin);
                        }
                    }

                    $scope.logins = decLogins;
                }).$promise;

            $q.all([subvaultPromise, cipherPromise]).then(function () {
                $scope.loading = false;
            });
        });

        $scope.filterBySubvault = function (subvault) {
            return function (cipher) {
                return cipher.subvaultIds.indexOf(subvault.id) > -1;
            };
        };

        $scope.filterByOrphaned = function () {
            return function (cipher) {
                return !cipher.subvaultIds || !cipher.subvaultIds.length;
            };
        };

        $scope.collapseExpand = function (subvault) {
            if (!$localStorage.collapsedOrgSubvaults) {
                $localStorage.collapsedOrgSubvaults = {};
            }

            if (subvault.id in $localStorage.collapsedOrgSubvaults) {
                delete $localStorage.collapsedOrgSubvaults[subvault.id];
            }
            else {
                $localStorage.collapsedOrgSubvaults[subvault.id] = true;
            }
        };

        $scope.editSubvaults = function (login) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultLoginSubvaults.html',
                controller: 'vaultOrganizationLoginSubvaultsController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            modal.result.then(function (response) {
                if (response.subvaultIds) {
                    login.subvaultIds = response.subvaultIds;
                }
            });
        };
    });
