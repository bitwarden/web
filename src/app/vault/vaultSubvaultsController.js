angular
    .module('bit.vault')

    .controller('vaultSubvaultsController', function ($scope, apiService, cipherService, $analytics, $q, $localStorage,
        $uibModal, $filter) {
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
                    loginId: function () { return login.id; },
                    folders: getFoldersPromise()
                }
            });

            editModel.result.then(function (returnVal) {
                var loginToUpdate;
                if (returnVal.action === 'edit') {
                    loginToUpdate = $filter('filter')($scope.logins, { id: returnVal.data.id }, true);
                    if (loginToUpdate && loginToUpdate.length > 0) {
                        loginToUpdate[0].folderId = returnVal.data.folderId;
                        loginToUpdate[0].name = returnVal.data.name;
                        loginToUpdate[0].username = returnVal.data.username;
                        loginToUpdate[0].favorite = returnVal.data.favorite;
                    }
                }
                else if (returnVal.action === 'partialEdit') {
                    loginToUpdate = $filter('filter')($scope.logins, { id: returnVal.data.id }, true);
                    if (loginToUpdate && loginToUpdate.length > 0) {
                        loginToUpdate[0].folderId = returnVal.data.folderId;
                        loginToUpdate[0].favorite = returnVal.data.favorite;
                    }
                }
                else if (returnVal.action === 'delete') {
                    var loginToDelete = $filter('filter')($scope.logins, { id: returnVal.data }, true);
                    if (loginToDelete && loginToDelete.length > 0) {
                        var index = $scope.logins.indexOf(loginToDelete[0]);
                        if (index > -1) {
                            $scope.logins.splice(index, 1);
                        }
                    }
                }
            });
        };

        function getFoldersPromise() {
            var deferred = $q.defer();

            if (!$scope.folders || !$scope.folders.length) {
                apiService.folders.list({}).$promise.then(function (folders) {
                    var decFolders = [{
                        id: null,
                        name: 'No Folder'
                    }];

                    for (var i = 0; i < folders.Data.length; i++) {
                        var decFolder = cipherService.decryptFolderPreview(folders.Data[i]);
                        decFolders.push(decFolder);
                    }

                    $scope.folders = decFolders;
                    deferred.resolve($scope.folders);
                });
            }
            else {
                deferred.resolve($scope.folders);
            }

            return deferred.promise;
        }
    });
