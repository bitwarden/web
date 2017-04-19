angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $uibModal, apiService, $filter, cryptoService, authService, toastr,
        cipherService, $q, $localStorage, $timeout, $rootScope) {
        $scope.loading = true;
        $scope.logins = [];
        $scope.favoriteCollapsed = $localStorage.collapsedFolders && 'favorite' in $localStorage.collapsedFolders;

        $scope.$on('$viewContentLoaded', function () {
            if ($rootScope.vaultFolders && $rootScope.vaultLogins) {
                $scope.loading = false;
                loadFolderData($rootScope.vaultFolders);
                loadLoginData($rootScope.vaultLogins);
                return;
            }

            loadDataFromServer();
        });

        function loadDataFromServer() {
            var folderPromise = apiService.folders.list({}, function (folders) {
                var decFolders = [{
                    id: null,
                    name: 'No Folder'
                }];

                for (var i = 0; i < folders.Data.length; i++) {
                    var decFolder = cipherService.decryptFolderPreview(folders.Data[i]);
                    decFolders.push(decFolder);
                }

                loadFolderData(decFolders);
            }).$promise;

            var cipherPromise = apiService.ciphers.list({}, function (ciphers) {
                var decLogins = [];

                for (var i = 0; i < ciphers.Data.length; i++) {
                    if (ciphers.Data[i].Type === 1) {
                        var decLogin = cipherService.decryptLoginPreview(ciphers.Data[i]);
                        decLogins.push(decLogin);
                    }
                }

                $q.when(folderPromise).then(function () {
                    loadLoginData(decLogins);
                });
            }).$promise;

            $q.all([cipherPromise, folderPromise]).then(function () {
                $scope.loading = false;
            });
        }

        function loadFolderData(decFolders) {
            $rootScope.vaultFolders = $filter('orderBy')(decFolders, folderSort);
        }

        function loadLoginData(decLogins) {
            angular.forEach($rootScope.vaultFolders, function (folderValue, folderIndex) {
                folderValue.collapsed = $localStorage.collapsedFolders &&
                    (folderValue.id || 'none') in $localStorage.collapsedFolders;

                angular.forEach(decLogins, function (loginValue) {
                    if (loginValue.favorite) {
                        loginValue.sort = -1;
                    }
                    else if (loginValue.folderId == folderValue.id) {
                        loginValue.sort = folderIndex;
                    }
                });
            });

            $rootScope.vaultLogins = $scope.logins = $filter('orderBy')(decLogins, ['sort', 'name', 'username']);

            var chunks = chunk($rootScope.vaultLogins, 400);
            if (chunks.length > 0) {
                $scope.logins = chunks[0];
                var delay = 200;
                angular.forEach(chunks, function (value, index) {
                    delay += 200;

                    // skip the first chuck
                    if (index > 0) {
                        $timeout(function () {
                            Array.prototype.push.apply($scope.logins, value);
                        }, delay);
                    }
                });
            }
        }

        function sortScopedLoginData() {
            $rootScope.vaultLogins = $scope.logins = $filter('orderBy')($rootScope.vaultLogins, ['name', 'username']);
        }

        function chunk(arr, len) {
            var chunks = [],
                i = 0,
                n = arr.length;
            while (i < n) {
                chunks.push(arr.slice(i, i += len));
            }
            return chunks;
        }

        function folderSort(item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        }

        $scope.collapseExpand = function (folder, favorite) {
            if (!$localStorage.collapsedFolders) {
                $localStorage.collapsedFolders = {};
            }

            var id = favorite ? 'favorite' : (folder.id || 'none');
            if (id in $localStorage.collapsedFolders) {
                delete $localStorage.collapsedFolders[id];
            }
            else {
                $localStorage.collapsedFolders[id] = true;
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

                    sortScopedLoginData();
                }
                else if (returnVal.action === 'partialEdit') {
                    login.folderId = returnVal.data.folderId;
                    login.favorite = returnVal.data.favorite;
                }
                else if (returnVal.action === 'delete') {
                    removeLoginFromScopes(login);
                }
            });
        };

        $scope.$on('vaultAddLogin', function (event, args) {
            $scope.addLogin();
        });

        $scope.addLogin = function (folder, favorite) {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddLogin.html',
                controller: 'vaultAddLoginController',
                resolve: {
                    selectedFolder: function () { return folder; },
                    checkedFavorite: function () { return favorite; }
                }
            });

            addModel.result.then(function (addedLogin) {
                $rootScope.vaultLogins.push(addedLogin);
                sortScopedLoginData();
            });
        };

        $scope.deleteLogin = function (login) {
            if (!confirm('Are you sure you want to delete this login (' + login.name + ')?')) {
                return;
            }

            apiService.logins.del({ id: login.id }, function () {
                removeLoginFromScopes(login);
            });
        };

        $scope.editFolder = function (folder) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditFolder.html',
                controller: 'vaultEditFolderController',
                size: 'sm',
                resolve: {
                    folderId: function () { return folder.id; }
                }
            });

            editModel.result.then(function (editedFolder) {
                folder.name = editedFolder.name;
            });
        };

        $scope.$on('vaultAddFolder', function (event, args) {
            $scope.addFolder();
        });

        $scope.addFolder = function () {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddFolder.html',
                controller: 'vaultAddFolderController',
                size: 'sm'
            });

            addModel.result.then(function (addedFolder) {
                $rootScope.vaultFolders.push(addedFolder);
                loadFolderData($rootScope.vaultFolders);
            });
        };

        $scope.deleteFolder = function (folder) {
            if (!confirm('Are you sure you want to delete this folder (' + folder.name + ')?')) {
                return;
            }

            apiService.folders.del({ id: folder.id }, function () {
                var index = $rootScope.vaultFolders.indexOf(folder);
                if (index > -1) {
                    $rootScope.vaultFolders.splice(index, 1);
                }
            });
        };

        $scope.canDeleteFolder = function (folder) {
            if (!folder || !folder.id || !$rootScope.vaultLogins) {
                return false;
            }

            var logins = $filter('filter')($rootScope.vaultLogins, { folderId: folder.id });
            return logins && logins.length === 0;
        };

        $scope.share = function (login) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultShare.html',
                controller: 'vaultShareController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            modal.result.then(function (orgId) {
                login.organizationId = orgId;
            });
        };

        $scope.subvaults = function (login) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultLoginSubvaults.html',
                controller: 'vaultLoginSubvaultsController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            modal.result.then(function (response) {
                if (response.subvaultIds && !response.subvaultIds.length) {
                    removeLoginFromScopes(login);
                }
            });
        };

        function removeLoginFromScopes(login) {
            var index = $rootScope.vaultLogins.indexOf(login);
            if (index > -1) {
                $rootScope.vaultLogins.splice(index, 1);
            }

            index = $scope.logins.indexOf(login);
            if (index > -1) {
                $scope.logins.splice(index, 1);
            }
        }
    });
