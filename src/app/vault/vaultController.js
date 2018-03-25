angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $uibModal, apiService, $filter, cryptoService, authService, toastr,
        cipherService, $q, $localStorage, $timeout, $rootScope, $state, $analytics, constants, validationService) {
        $scope.loadingCiphers = true;
        $scope.loadingGroupings = true;
        $scope.ciphers = [];
        $scope.folders = [];
        $scope.collections = [];
        $scope.constants = constants;
        $scope.filter = undefined;
        $scope.selectedType = undefined;
        $scope.selectedFolder = undefined;
        $scope.selectedCollection = undefined;
        $scope.selectedFavorites = false;
        $scope.selectedAll = true;
        $scope.selectedTitle = 'All';
        $scope.selectedIcon = 'fa-th';

        if ($state.params.refreshFromServer) {
            $rootScope.vaultFolders = $rootScope.vaultCollections = $rootScope.vaultCiphers = null;
        }

        $scope.$on('$viewContentLoaded', function () {
            $timeout(function () {
                if ($('body').hasClass('control-sidebar-open')) {
                    $("#search").focus();
                }
            }, 500);

            if (($rootScope.vaultFolders || $rootScope.vaultCollections) && $rootScope.vaultCiphers) {
                $scope.loadingCiphers = $scope.loadingGroupings = false;
                loadCipherData($rootScope.vaultCiphers);
                return;
            }

            loadDataFromServer();
        });

        function loadDataFromServer() {
            var decFolders = [{
                id: null,
                name: 'No Folder'
            }];

            var decCollections = [];

            var collectionPromise = apiService.collections.listMe({ writeOnly: false }, function (collections) {
                for (var i = 0; i < collections.Data.length; i++) {
                    var decCollection = cipherService.decryptCollection(collections.Data[i], null, true);
                    decCollections.push(decCollection);
                }
            }).$promise;

            var folderPromise = apiService.folders.list({}, function (folders) {
                for (var i = 0; i < folders.Data.length; i++) {
                    var decFolder = cipherService.decryptFolderPreview(folders.Data[i]);
                    decFolders.push(decFolder);
                }
            }).$promise;

            var groupingPromise = $q.all([collectionPromise, folderPromise]).then(function () {
                $rootScope.vaultCollections = decCollections;
                $rootScope.vaultFolders = decFolders;
                $scope.loadingGroupings = false;
            });

            apiService.ciphers.list({}, function (ciphers) {
                var decCiphers = [];

                for (var i = 0; i < ciphers.Data.length; i++) {
                    var decCipher = cipherService.decryptCipherPreview(ciphers.Data[i]);
                    decCiphers.push(decCipher);
                }

                groupingPromise.then(function () {
                    loadCipherData(decCiphers);
                });
            }).$promise;
        }

        function loadCipherData(decCiphers) {
            $rootScope.vaultCiphers = $scope.ciphers = $filter('orderBy')(decCiphers, ['sort', 'name', 'subTitle']);

            var chunks = chunk($rootScope.vaultCiphers, 200);
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

            $scope.loadingCiphers = false;
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

        $scope.groupingSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        $scope.clipboardError = function (e) {
            alert('Your web browser does not support easy clipboard copying. ' +
                'Edit the item and copy it manually instead.');
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
                    var index = $scope.ciphers.indexOf(cipher);
                    if (index > -1) {
                        // restore collection ids since those cannot change on edit here.
                        returnVal.data.collectionIds = $rootScope.vaultCiphers[index].collectionIds;
                        $rootScope.vaultCiphers[index] = returnVal.data;
                    }
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

        $scope.addCipher = function () {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddCipher.html',
                controller: 'vaultAddCipherController',
                resolve: {
                    selectedFolder: function () { return $scope.selectedFolder; },
                    selectedType: function () { return $scope.selectedType; },
                    checkedFavorite: function () { return $scope.selectedFavorites; }
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
            if (!folder.id) {
                return;
            }

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
            });
        };

        $scope.deleteFolder = function (folder) {
            if (!folder.id) {
                return;
            }

            if (!confirm('Are you sure you want to delete this folder (' + folder.name + ')? ' +
                'Any items will be moved to "No Folder".')) {
                return;
            }

            apiService.folders.del({ id: folder.id }, function () {
                $analytics.eventTrack('Deleted Folder');
                var index = $rootScope.vaultFolders.indexOf(folder);
                if (index > -1) {
                    $rootScope.vaultFolders.splice(index, 1);
                    $scope.filterAll();
                }
            });
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

            modal.result.then(function (returned) {
                cipher.organizationId = returned.orgId;
                cipher.collectionIds = returned.collectionIds || [];
            });
        };

        $scope.editCollections = function (cipher) {
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
                else if (response.collectionIds) {
                    cipher.collectionIds = response.collectionIds;
                }
            });
        };

        $scope.filterCollection = function (col) {
            resetSelected();
            $scope.selectedCollection = col;
            $scope.selectedIcon = 'fa-cube';
            $scope.filter = function (c) {
                return c.collectionIds && c.collectionIds.indexOf(col.id) > -1;
            };
            fixLayout();
        };

        $scope.filterFolder = function (f) {
            resetSelected();
            $scope.selectedFolder = f;
            $scope.selectedIcon = 'fa-folder-open' + (!f.id ? '-o' : '');
            $scope.filter = function (c) {
                return c.folderId === f.id;
            };
            fixLayout();
        };

        $scope.filterType = function (t) {
            resetSelected();
            $scope.selectedType = t;
            switch (t) {
                case constants.cipherType.login:
                    $scope.selectedTitle = 'Login';
                    $scope.selectedIcon = 'fa-globe';
                    break;
                case constants.cipherType.card:
                    $scope.selectedTitle = 'Card';
                    $scope.selectedIcon = 'fa-credit-card';
                    break;
                case constants.cipherType.identity:
                    $scope.selectedTitle = 'Identity';
                    $scope.selectedIcon = 'fa-id-card-o';
                    break;
                case constants.cipherType.secureNote:
                    $scope.selectedTitle = 'Secure Note';
                    $scope.selectedIcon = 'fa-sticky-note-o';
                    break;
                default:
                    break;
            }
            $scope.filter = function (c) {
                return c.type === t;
            };
            fixLayout();
        };

        $scope.filterFavorites = function () {
            resetSelected();
            $scope.selectedFavorites = true;
            $scope.selectedTitle = 'Favorites';
            $scope.selectedIcon = 'fa-star';
            $scope.filter = function (c) {
                return !!c.favorite;
            };
            fixLayout();
        };

        $scope.filterAll = function () {
            resetSelected();
            $scope.selectedAll = true;
            $scope.selectedTitle = 'All';
            $scope.selectedIcon = 'fa-th';
            $scope.filter = null;
            fixLayout();
        };

        function resetSelected() {
            $scope.selectedFolder = undefined;
            $scope.selectedCollection = undefined;
            $scope.selectedType = undefined;
            $scope.selectedFavorites = false;
            $scope.selectedAll = false;
        }

        function fixLayout() {
            if ($.AdminLTE && $.AdminLTE.layout) {
                $timeout(function () {
                    $.AdminLTE.layout.fix();
                }, 0);
            }
        }

        $scope.cipherFilter = function () {
            return function (cipher) {
                return !$scope.filter || $scope.filter(cipher);
            };
        };

        $scope.unselectAll = function () {
            selectAll(false);
        };

        $scope.selectAll = function () {
            selectAll(true);
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

            $scope.actionLoading = true;
            apiService.ciphers.delMany({ ids: ids }, function () {
                $analytics.eventTrack('Bulk Deleted Items');

                for (var i = 0; i < ids.length; i++) {
                    var cipher = $filter('filter')($rootScope.vaultCiphers, { id: ids[i] });
                    if (cipher.length && cipher[0].edit) {
                        removeCipherFromScopes(cipher[0]);
                    }
                }

                selectAll(false);
                $scope.actionLoading = false;
                toastr.success('Items have been deleted!');
            }, function (e) {
                var errors = validationService.parseErrors(e);
                toastr.error(errors.length ? errors[0] : 'An error occurred.');
                $scope.actionLoading = false;
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
