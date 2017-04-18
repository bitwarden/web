angular
    .module('bit.vault')

    .controller('vaultSubvaultsController', function ($scope, apiService, cipherService, $analytics, $q, $localStorage,
        $uibModal, $filter, $rootScope) {
        $scope.logins = [];
        $scope.subvaults = [];
        $scope.folders = [];
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

            var cipherPromise = apiService.ciphers.listDetails({}, function (ciphers) {
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

            if (subvault.id in $localStorage.collapsedSubvaults) {
                delete $localStorage.collapsedSubvaults[subvault.id];
            }
            else {
                $localStorage.collapsedSubvaults[subvault.id] = true;
            }
        };

        $scope.editLogin = function (login) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditLogin.html',
                controller: 'vaultEditLoginController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            editModel.result.then(function (returnVal) {
                if (returnVal.action === 'edit') {
                    login.folderId = returnVal.data.folderId;
                    login.name = returnVal.data.name;
                    login.username = returnVal.data.username;
                    login.favorite = returnVal.data.favorite;
                }
                else if (returnVal.action === 'partialEdit') {
                    login.folderId = returnVal.data.folderId;
                    login.favorite = returnVal.data.favorite;
                }
                else if (returnVal.action === 'delete') {
                    var index = $scope.logins.indexOf(login);
                    if (index > -1) {
                        $scope.logins.splice(index, 1);
                    }
                }
            });
        };

        $scope.editSubvaults = function (login) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultLoginSubvaults.html',
                controller: 'vaultLoginSubvaultsController',
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
