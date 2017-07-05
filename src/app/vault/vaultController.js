angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $uibModal, apiService, $filter, cryptoService, authService, toastr,
        cipherService, $q, $localStorage, $timeout, $rootScope, $state, $analytics) {
        $scope.loading = true;
        $scope.logins = [];
        $scope.favoriteCollapsed = $localStorage.collapsedFolders && 'favorite' in $localStorage.collapsedFolders;
        $scope.folderIdFilter = undefined;

        if ($state.params.refreshFromServer) {
            $rootScope.vaultFolders = $rootScope.vaultLogins = null;
        }

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

        $scope.clipboardError = function (e) {
            alert('Your web browser does not support easy clipboard copying. ' +
                'Edit the login and copy it manually instead.');
        };

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
                    login.password = returnVal.data.password;
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
                $analytics.eventTrack('Deleted Login');
                removeLoginFromScopes(login);
            });
        };

        $scope.attachments = function (login) {
            if (!cryptoService.getEncKey()) {
                toastr.error('You cannot use this feature until you update your encryption key.', 'Feature Unavailable');
                return;
            }

            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAttachments.html',
                controller: 'vaultAttachmentsController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            addModel.result.then(function (data) {

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
                $analytics.eventTrack('Deleted Folder');
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
                templateUrl: 'app/vault/views/vaultShareLogin.html',
                controller: 'vaultShareLoginController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            modal.result.then(function (orgId) {
                login.organizationId = orgId;
            });
        };

        $scope.collections = function (login) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultLoginCollections.html',
                controller: 'vaultLoginCollectionsController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            modal.result.then(function (response) {
                if (response.collectionIds && !response.collectionIds.length) {
                    removeLoginFromScopes(login);
                }
            });
        };

        $scope.filterFolder = function (folder) {
            $scope.folderIdFilter = folder.id;

            if ($.AdminLTE && $.AdminLTE.layout) {
                $timeout(function () {
                    $.AdminLTE.layout.fix();
                }, 0);
            }
        };

        $scope.clearFilters = function () {
            $scope.folderIdFilter = undefined;

            if ($.AdminLTE && $.AdminLTE.layout) {
                $timeout(function () {
                    $.AdminLTE.layout.fix();
                }, 0);
            }
        };

        $scope.folderFilter = function (folder) {
            return $scope.folderIdFilter === undefined || folder.id === $scope.folderIdFilter;
        };

        $scope.unselectAll = function () {
            selectAll(false);
        };

        $scope.selectFolder = function (folder, $event) {
            var checkbox = $($event.currentTarget).closest('.box').find('input[name="loginSelection"]');
            checkbox.prop('checked', true);
        };

        $scope.select = function ($event) {
            var checkbox = $($event.currentTarget).closest('tr').find('input[name="loginSelection"]');
            checkbox.prop('checked', !checkbox.prop('checked'));
        };

        function distinct(value, index, self) {
            return self.indexOf(value) === index;
        }

        function getSelectedLogins() {
            return $('input[name="loginSelection"]:checked').map(function () {
                return $(this).val();
            }).get().filter(distinct);
        }

        function selectAll(select) {
            $('input[name="loginSelection"]').prop('checked', select);
        }

        $scope.bulkMove = function () {
            var ids = getSelectedLogins();
            if (ids.length === 0) {
                alert('You have not selected anything.');
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultMoveLogins.html',
                controller: 'vaultMoveLoginsController',
                size: 'sm',
                resolve: {
                    ids: function () { return ids; }
                }
            });

            modal.result.then(function (folderId) {
                for (var i = 0; i < ids.length; i++) {
                    var login = $filter('filter')($rootScope.vaultLogins, { id: ids[i] });
                    if (login.length) {
                        login[0].folderId = folderId;
                    }
                }

                selectAll(false);
                sortScopedLoginData();
                toastr.success('Items have been moved!');
            });
        };

        $scope.bulkDelete = function () {
            var ids = getSelectedLogins();
            if (ids.length === 0) {
                alert('You have not selected anything.');
                return;
            }

            if (!confirm('Are you sure you want to delete the selected logins (total: ' + ids.length + ')?')) {
                return;
            }

            $scope.bulkActionLoading = true;
            apiService.ciphers.delMany({ ids: ids }, function () {
                $analytics.eventTrack('Bulk Deleted Logins');

                for (var i = 0; i < ids.length; i++) {
                    var login = $filter('filter')($rootScope.vaultLogins, { id: ids[i] });
                    if (login.length && login[0].edit) {
                        removeLoginFromScopes(login[0]);
                    }
                }

                selectAll(false);
                $scope.bulkActionLoading = false;
                toastr.success('Items have been deleted!');
            }, function () {
                toastr.error('An error occurred.');
                $scope.bulkActionLoading = false;
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
