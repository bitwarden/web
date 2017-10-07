angular
    .module('bit.vault')

    .controller('vaultSharedController', function ($scope, apiService, cipherService, $analytics, $q, $localStorage,
        $uibModal, $filter, $rootScope, authService, cryptoService) {
        $scope.ciphers = [];
        $scope.collections = [];
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            var collectionPromise = apiService.collections.listMe({ writeOnly: false }, function (collections) {
                var decCollections = [];

                for (var i = 0; i < collections.Data.length; i++) {
                    var decCollection = cipherService.decryptCollection(collections.Data[i], null, true);
                    decCollection.collapsed = $localStorage.collapsedCollections &&
                        decCollection.id in $localStorage.collapsedCollections;
                    decCollections.push(decCollection);
                }

                $scope.collections = decCollections;
            }).$promise;

            var cipherPromise = apiService.ciphers.listDetails({}, function (ciphers) {
                var decCiphers = [];

                for (var i = 0; i < ciphers.Data.length; i++) {
                    if (ciphers.Data[i].Type === 1) {
                        var decCipher = cipherService.decryptCipherPreview(ciphers.Data[i]);
                        decCiphers.push(decCipher);
                    }
                }

                if (decCiphers.length) {
                    $scope.collections.push({
                        id: null,
                        name: 'Unassigned',
                        collapsed: $localStorage.collapsedCollections && 'unassigned' in $localStorage.collapsedCollections
                    });
                }

                $scope.ciphers = decCiphers;
            }).$promise;

            $q.all([collectionPromise, cipherPromise]).then(function () {
                $scope.loading = false;
            });
        });

        $scope.clipboardError = function (e) {
            alert('Your web browser does not support easy clipboard copying. ' +
                'Edit the item and copy it manually instead.');
        };

        $scope.attachments = function (cipher) {
            authService.getUserProfile().then(function (profile) {
                return {
                    isPremium: profile.premium,
                    orgUseStorage: cipher.organizationId && !!profile.organizations[cipher.organizationId].maxStorageGb
                };
            }).then(function (perms) {
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

                if (!cipher.organizationId && !cryptoService.getEncKey()) {
                    toastr.error('You cannot use this feature until you update your encryption key.', 'Feature Unavailable');
                    return;
                }

                var attachmentModel = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/vault/views/vaultAttachments.html',
                    controller: 'vaultAttachmentsController',
                    resolve: {
                        loginId: function () { return cipher.id; }
                    }
                });

                attachmentModel.result.then(function (hasAttachments) {
                    cipher.hasAttachments = hasAttachments;
                });
            });
        };

        $scope.filterByCollection = function (collection) {
            return function (cipher) {
                if (!cipher.collectionIds || !cipher.collectionIds.length) {
                    return collection.id === null;
                }

                return cipher.collectionIds.indexOf(collection.id) > -1;
            };
        };

        $scope.collectionSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        $scope.collapseExpand = function (collection) {
            if (!$localStorage.collapsedCollections) {
                $localStorage.collapsedCollections = {};
            }

            var id = collection.id || 'unassigned';

            if (id in $localStorage.collapsedCollections) {
                delete $localStorage.collapsedCollections[id];
            }
            else {
                $localStorage.collapsedCollections[id] = true;
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
                var rootCipher = findRootCipher(cipher) || { meta: {} };

                if (returnVal.action === 'edit') {
                    cipher.folderId = rootCipher.folderId = returnVal.data.folderId;
                    cipher.name = rootCipher.name = returnVal.data.name;
                    cipher.subTitle = rootCipher.subTitle = returnVal.data.login.username;
                    cipher.meta.password = rootCipher.meta.password = returnVal.data.login.password;
                    cipher.favorite = rootCipher.favorite = returnVal.data.favorite;
                }
                else if (returnVal.action === 'partialEdit') {
                    cipher.folderId = rootCipher.folderId = returnVal.data.folderId;
                    cipher.favorite = rootCipher.favorite = returnVal.data.favorite;
                }
                else if (returnVal.action === 'delete') {
                    var index = $scope.ciphers.indexOf(cipher);
                    if (index > -1) {
                        $scope.ciphers.splice(index, 1);
                    }

                    removeRootCipher(rootCipher);
                }
            });
        };

        $scope.editCollections = function (cipher) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultLoginCollections.html',
                controller: 'vaultLoginCollectionsController',
                resolve: {
                    loginId: function () { return cipher.id; }
                }
            });

            modal.result.then(function (response) {
                if (response.collectionIds) {
                    cipher.collectionIds = response.collectionIds;
                    // TODO: if there are no collectionIds now, it is possible that the user no longer has access to this cipher
                    // which means it should be removed by calling removeRootCipher(findRootCipher(cipher))
                }
            });
        };

        $scope.removeCipher = function (cipher, collection) {
            if (!confirm('Are you sure you want to remove this item (' + cipher.name + ') from the ' +
                'collection (' + collection.name + ') ?')) {
                return;
            }

            var request = {
                collectionIds: []
            };

            for (var i = 0; i < cipher.collectionIds.length; i++) {
                if (cipher.collectionIds[i] !== collection.id) {
                    request.collectionIds.push(cipher.collectionIds[i]);
                }
            }

            apiService.ciphers.putCollections({ id: cipher.id }, request).$promise.then(function (response) {
                $analytics.eventTrack('Removed From Collection');
                cipher.collectionIds = request.collectionIds;
                // TODO: if there are no collectionIds now, it is possible that the user no longer has access to this cipher
                // which means it should be removed by calling removeRootCipher(findRootCipher(cipher))
            });
        };

        function findRootCipher(cipher) {
            if ($rootScope.vaultCiphers) {
                var rootCiphers = $filter('filter')($rootScope.vaultCiphers, { id: cipher.id });
                if (rootCiphers && rootCiphers.length) {
                    return rootCiphers[0];
                }
            }

            return null;
        }

        function removeRootCipher(rootCipher) {
            if (rootCipher && rootCipher.id) {
                var index = $rootScope.vaultCiphers.indexOf(rootCipher);
                if (index > -1) {
                    $rootScope.vaultCiphers.splice(index, 1);
                }
            }
        }
    });
