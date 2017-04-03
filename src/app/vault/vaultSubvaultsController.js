angular
    .module('bit.vault')

    .controller('vaultSubvaultsController', function ($scope, apiService, cipherService, $analytics, $q, $localStorage) {
        $scope.logins = [];
        $scope.subvaults = [];
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            var subvaultPromise = apiService.subvaults.listMe({}, function (subvaults) {
                var decSubvaults = [];

                for (var i = 0; i < subvaults.Data.length; i++) {
                    var decSubvault = cipherService.decryptSubvault(subvaults.Data[i], null, true);
                    decSubvault.collapsed = $localStorage.collapsedSubvaults &&
                        decSubvault.id in $localStorage.collapsedSubvaults;
                    decSubvaults.push(decSubvault);
                }

                $scope.subvaults = decSubvaults;
            }).$promise;

            var cipherPromise = apiService.ciphers.listSubvaults({}, function (ciphers) {
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

        $scope.collapseExpand = function (subvault) {
            if (!$localStorage.collapsedSubvaults) {
                $localStorage.collapsedSubvaults = {};
            }

            if (subvault.id in $localStorage.collapsedFolders) {
                delete $localStorage.collapsedSubvaults[subvault.id];
            }
            else {
                $localStorage.collapsedSubvaults[subvault.id] = true;
            }
        };
    });
