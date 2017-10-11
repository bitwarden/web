angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $uibModal, apiService, $filter, cryptoService, authService, toastr,
        cipherService, $q, $localStorage, $timeout, $rootScope, $state, $analytics, constants) {
        $scope.loading = true;
        $scope.ciphers = [];
        $scope.constants = constants;
        $scope.favoriteCollapsed = $localStorage.collapsedFolders && 'favorite' in $localStorage.collapsedFolders;
        $scope.folderIdFilter = undefined;
        $scope.typeFilter = undefined;

        if ($state.params.refreshFromServer) {
            $rootScope.vaultFolders = $rootScope.vaultCiphers = null;
        }

        $scope.$on('$viewContentLoaded', function () {
            if ($rootScope.vaultFolders && $rootScope.vaultCiphers) {
                $scope.loading = false;
                loadFolderData($rootScope.vaultFolders);
                loadCipherData($rootScope.vaultCiphers);
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
                var decCiphers = [];

                for (var i = 0; i < ciphers.Data.length; i++) {
                    var decCipher = cipherService.decryptCipherPreview(ciphers.Data[i]);
                    decCiphers.push(decCipher);
                }

                folderPromise.then(function () {
                    loadCipherData(decCiphers);
                });
            }).$promise;

            $q.all([cipherPromise, folderPromise]).then(function () {
                $scope.loading = false;
            });
        }

        function loadFolderData(decFolders) {
            $rootScope.vaultFolders = $filter('orderBy')(decFolders, folderSort);
        }

        function loadCipherData(decCiphers) {
            angular.forEach($rootScope.vaultFolders, function (folderValue, folderIndex) {
                folderValue.collapsed = $localStorage.collapsedFolders &&
                    (folderValue.id || 'none') in $localStorage.collapsedFolders;

                angular.forEach(decCiphers, function (cipherValue) {
                    if (cipherValue.favorite) {
                        cipherValue.sort = -1;
                    }
                    else if (cipherValue.folderId == folderValue.id) {
                        cipherValue.sort = folderIndex;
                    }
                });
            });

            $rootScope.vaultCiphers = $scope.ciphers = $filter('orderBy')(decCiphers, ['sort', 'name', 'subTitle']);

            var chunks = chunk($rootScope.vaultCiphers, 400);
            if (chunks.length > 0) {
                $scope.ciphers = chunks[0];
                var delay = 200;
                angular.forEach(chunks, function (value, index) {
                    delay += 200;

                    // skip the first chuck
                    if (index > 0) {
                        $timeout(function () {
                            Array.prototype.push.apply($scope.ciphers, value);
                        }, delay);
                    }
                });
            }
        }

        function sortScopedCipherData() {
            $rootScope.vaultCiphers = $scope.ciphers = $filter('orderBy')($rootScope.vaultCiphers, ['name', 'subTitle']);
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
                'Edit the item and copy it manually instead.');
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

        $scope.editCipher = function (cipher) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditCipher.html',
                controller: 'vaultEditCipherController',
                resolve: {
                    cipherId: function () { return cipher.id; }
                }
            });

            editModel.result.then(function (returnVal) {
                if (returnVal.action === 'edit') {
                    cipher.folderId = returnVal.data.folderId;
                    cipher.name = returnVal.data.name;
                    cipher.favorite = returnVal.data.favorite;

                    cipher.subTitle = returnVal.data.login.username;
                    cipher.meta.password = returnVal.data.login.password;

                    sortScopedCipherData();
                }
                else if (returnVal.action === 'partialEdit') {
                    cipher.folderId = returnVal.data.folderId;
                    cipher.favorite = returnVal.data.favorite;
                }
                else if (returnVal.action === 'delete') {
                    removeCipherFromScopes(cipher);
                }
            });
        };

        $scope.$on('vaultAddCipher', function (event, args) {
            $scope.addCipher();
        });

        $scope.addCipher = function (folder, favorite) {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddCipher.html',
                controller: 'vaultAddCipherController',
                resolve: {
                    selectedFolder: function () { return folder; },
                    checkedFavorite: function () { return favorite; }
                }
            });

            addModel.result.then(function (addedCipher) {
                $rootScope.vaultCiphers.push(addedCipher);
                sortScopedCipherData();
            });
        };

        $scope.deleteCipher = function (cipher) {
            if (!confirm('Are you sure you want to delete this item (' + cipher.name + ')?')) {
                return;
            }

            apiService.ciphers.del({ id: cipher.id }, function () {
                $analytics.eventTrack('Deleted Item');
                removeCipherFromScopes(cipher);
            });
        };

        $scope.attachments = function (cipher) {
            authService.getUserProfile().then(function (profile) {
                return {
                    isPremium: profile.premium,
                    orgUseStorage: cipher.organizationId && !!profile.organizations[cipher.organizationId].maxStorageGb
                };
            }).then(function (perms) {
                if (!cipher.hasAttachments) {
                    if (cipher.organizationId && !perms.orgUseStorage) {
                        $uibModal.open({
                            animation: true,
                            templateUrl: 'app/views/paidOrgRequired.html',
                            controller: 'paidOrgRequiredController',
                            resolve: {
                                orgId: function () { return cipher.organizationId; }
                            }
                        });
                        return;
                    }

                    if (!cipher.organizationId && !perms.isPremium) {
                        $uibModal.open({
                            animation: true,
                            templateUrl: 'app/views/premiumRequired.html',
                            controller: 'premiumRequiredController'
                        });
                        return;
                    }
                }

                if (!cipher.organizationId && !cryptoService.getEncKey()) {
                    toastr.error('You cannot use this feature until you update your encryption key.', 'Feature Unavailable');
                    return;
                }

                var attachmentModel = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/vault/views/vaultAttachments.html',
                    controller: 'vaultAttachmentsController',
                    resolve: {
                        cipherId: function () { return cipher.id; }
                    }
                });

                attachmentModel.result.then(function (hasAttachments) {
                    cipher.hasAttachments = hasAttachments;
                });
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
            if (!folder || !folder.id || !$rootScope.vaultCiphers) {
                return false;
            }

            var ciphers = $filter('filter')($rootScope.vaultCiphers, { folderId: folder.id });
            return ciphers && ciphers.length === 0;
        };

        $scope.share = function (cipher) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultShareCipher.html',
                controller: 'vaultShareCipherController',
                resolve: {
                    cipherId: function () { return cipher.id; }
                }
            });

            modal.result.then(function (orgId) {
                cipher.organizationId = orgId;
            });
        };

        $scope.collections = function (cipher) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultCipherCollections.html',
                controller: 'vaultCipherCollectionsController',
                resolve: {
                    cipherId: function () { return cipher.id; }
                }
            });

            modal.result.then(function (response) {
                if (response.collectionIds && !response.collectionIds.length) {
                    removeCipherFromScopes(cipher);
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

        $scope.filterType = function (type) {
            $scope.typeFilter = type;

            if ($.AdminLTE && $.AdminLTE.layout) {
                $timeout(function () {
                    $.AdminLTE.layout.fix();
                }, 0);
            }
        };

        $scope.clearFilters = function () {
            $scope.folderIdFilter = undefined;
            $scope.typeFilter = undefined;

            if ($.AdminLTE && $.AdminLTE.layout) {
                $timeout(function () {
                    $.AdminLTE.layout.fix();
                }, 0);
            }
        };

        $scope.folderFilter = function (folder) {
            return $scope.folderIdFilter === undefined || folder.id === $scope.folderIdFilter;
        };

        $scope.cipherFilter = function (cipher) {
            return $scope.typeFilter === undefined || cipher.type === $scope.typeFilter;
        };

        $scope.unselectAll = function () {
            selectAll(false);
        };

        $scope.selectFolder = function (folder, $event) {
            var checkbox = $($event.currentTarget).closest('.box').find('input[name="cipherSelection"]');
            checkbox.prop('checked', true);
        };

        $scope.select = function ($event) {
            var checkbox = $($event.currentTarget).closest('tr').find('input[name="cipherSelection"]');
            checkbox.prop('checked', !checkbox.prop('checked'));
        };

        function distinct(value, index, self) {
            return self.indexOf(value) === index;
        }

        function getSelectedCiphers() {
            return $('input[name="cipherSelection"]:checked').map(function () {
                return $(this).val();
            }).get().filter(distinct);
        }

        function selectAll(select) {
            $('input[name="cipherSelection"]').prop('checked', select);
        }

        $scope.bulkMove = function () {
            var ids = getSelectedCiphers();
            if (ids.length === 0) {
                alert('You have not selected anything.');
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultMoveCiphers.html',
                controller: 'vaultMoveCiphersController',
                size: 'sm',
                resolve: {
                    ids: function () { return ids; }
                }
            });

            modal.result.then(function (folderId) {
                for (var i = 0; i < ids.length; i++) {
                    var cipher = $filter('filter')($rootScope.vaultCiphers, { id: ids[i] });
                    if (cipher.length) {
                        cipher[0].folderId = folderId;
                    }
                }

                selectAll(false);
                sortScopedCipherData();
                toastr.success('Items have been moved!');
            });
        };

        $scope.bulkDelete = function () {
            var ids = getSelectedCiphers();
            if (ids.length === 0) {
                alert('You have not selected anything.');
                return;
            }

            if (!confirm('Are you sure you want to delete the selected items (total: ' + ids.length + ')?')) {
                return;
            }

            $scope.bulkActionLoading = true;
            apiService.ciphers.delMany({ ids: ids }, function () {
                $analytics.eventTrack('Bulk Deleted Items');

                for (var i = 0; i < ids.length; i++) {
                    var cipher = $filter('filter')($rootScope.vaultCiphers, { id: ids[i] });
                    if (cipher.length && cipher[0].edit) {
                        removeCipherFromScopes(cipher[0]);
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

        function removeCipherFromScopes(cipher) {
            var index = $rootScope.vaultCiphers.indexOf(cipher);
            if (index > -1) {
                $rootScope.vaultCiphers.splice(index, 1);
            }

            index = $scope.ciphers.indexOf(cipher);
            if (index > -1) {
                $scope.ciphers.splice(index, 1);
            }
        }
    });
