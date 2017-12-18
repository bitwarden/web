angular
    .module('bit.organization')

    .controller('organizationVaultController', function ($scope, apiService, cipherService, $analytics, $q, $state,
        $localStorage, $uibModal, $filter, authService) {
        $scope.ciphers = [];
        $scope.collections = [];
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            var collectionPromise = apiService.collections.listOrganization({ orgId: $state.params.orgId }, function (collections) {
                var decCollections = [{
                    id: null,
                    name: 'Unassigned',
                    collapsed: $localStorage.collapsedOrgCollections && 'unassigned' in $localStorage.collapsedOrgCollections
                }];

                for (var i = 0; i < collections.Data.length; i++) {
                    var decCollection = cipherService.decryptCollection(collections.Data[i], null, true);
                    decCollection.collapsed = $localStorage.collapsedOrgCollections &&
                        decCollection.id in $localStorage.collapsedOrgCollections;
                    decCollections.push(decCollection);
                }

                $scope.collections = decCollections;
            }).$promise;

            var cipherPromise = apiService.ciphers.listOrganizationDetails({ organizationId: $state.params.orgId },
                function (ciphers) {
                    var decCiphers = [];

                    for (var i = 0; i < ciphers.Data.length; i++) {
                        var decCipher = cipherService.decryptCipherPreview(ciphers.Data[i]);
                        decCiphers.push(decCipher);
                    }

                    $scope.ciphers = decCiphers;
                }).$promise;

            $q.all([collectionPromise, cipherPromise]).then(function () {
                $scope.loading = false;
            });
        });

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
            if (!$localStorage.collapsedOrgCollections) {
                $localStorage.collapsedOrgCollections = {};
            }

            var id = collection.id || 'unassigned';

            if (id in $localStorage.collapsedOrgCollections) {
                delete $localStorage.collapsedOrgCollections[id];
            }
            else {
                $localStorage.collapsedOrgCollections[id] = true;
            }
        };

        $scope.editCipher = function (cipher) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditCipher.html',
                controller: 'organizationVaultEditCipherController',
                resolve: {
                    cipherId: function () { return cipher.id; },
                    orgId: function () { return $state.params.orgId; }
                }
            });

            editModel.result.then(function (returnVal) {
                var index;
                if (returnVal.action === 'edit') {
                    index = $scope.ciphers.indexOf(cipher);
                    if (index > -1) {
                        returnVal.data.collectionIds = $scope.ciphers[index].collectionIds;
                        $scope.ciphers[index] = returnVal.data;
                    }
                }
                else if (returnVal.action === 'delete') {
                    index = $scope.ciphers.indexOf(cipher);
                    if (index > -1) {
                        $scope.ciphers.splice(index, 1);
                    }
                }
            });
        };

        $scope.$on('organizationVaultAddCipher', function (event, args) {
            $scope.addCipher();
        });

        $scope.addCipher = function () {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddCipher.html',
                controller: 'organizationVaultAddCipherController',
                resolve: {
                    orgId: function () { return $state.params.orgId; }
                }
            });

            addModel.result.then(function (addedCipher) {
                $scope.ciphers.push(addedCipher);
            });
        };

        $scope.editCollections = function (cipher) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationVaultCipherCollections.html',
                controller: 'organizationVaultCipherCollectionsController',
                resolve: {
                    cipher: function () { return cipher; },
                    collections: function () { return $scope.collections; }
                }
            });

            modal.result.then(function (response) {
                if (response.collectionIds) {
                    cipher.collectionIds = response.collectionIds;
                }
            });
        };

        $scope.viewEvents = function (cipher) {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationVaultCipherEvents.html',
                controller: 'organizationVaultCipherEventsController',
                resolve: {
                    cipher: function () { return cipher; }
                }
            });
        };

        $scope.attachments = function (cipher) {
            authService.getUserProfile().then(function (profile) {
                return !!profile.organizations[cipher.organizationId].maxStorageGb;
            }).then(function (useStorage) {
                if (!useStorage) {
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

                var attachmentModel = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/vault/views/vaultAttachments.html',
                    controller: 'organizationVaultAttachmentsController',
                    resolve: {
                        cipherId: function () { return cipher.id; }
                    }
                });

                attachmentModel.result.then(function (hasAttachments) {
                    cipher.hasAttachments = hasAttachments;
                });
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
                $analytics.eventTrack('Removed Cipher From Collection');
                cipher.collectionIds = request.collectionIds;
            });
        };

        $scope.deleteCipher = function (cipher) {
            if (!confirm('Are you sure you want to delete this item (' + cipher.name + ')?')) {
                return;
            }

            apiService.ciphers.delAdmin({ id: cipher.id }, function () {
                $analytics.eventTrack('Deleted Cipher');
                var index = $scope.ciphers.indexOf(cipher);
                if (index > -1) {
                    $scope.ciphers.splice(index, 1);
                }
            });
        };
    });
