angular
    .module('bit.vault')

    .controller('vaultCipherCollectionsController', function ($scope, apiService, $uibModalInstance, cipherService,
        cipherId, $analytics) {
        $analytics.eventTrack('vaultCipherCollectionsController', { category: 'Modal' });
        $scope.cipher = {};
        $scope.readOnly = false;
        $scope.loadingCipher = true;
        $scope.loadingCollections = true;
        $scope.selectedCollections = {};
        $scope.collections = [];

        var cipherAndCols = null;
        $uibModalInstance.opened.then(function () {
            apiService.ciphers.getDetails({ id: cipherId }).$promise.then(function (cipher) {
                $scope.loadingCipher = false;

                $scope.readOnly = !cipher.Edit;
                if (cipher.Edit && cipher.OrganizationId) {
                    if (cipher.Type === 1) {
                        $scope.cipher = cipherService.decryptCipherPreview(cipher);
                    }

                    var collections = {};
                    if (cipher.CollectionIds) {
                        for (var i = 0; i < cipher.CollectionIds.length; i++) {
                            collections[cipher.CollectionIds[i]] = null;
                        }
                    }

                    return {
                        cipher: cipher,
                        cipherCollections: collections
                    };
                }

                return null;
            }).then(function (result) {
                if (!result) {
                    $scope.loadingCollections = false;
                    return false;
                }

                cipherAndCols = result;
                return apiService.collections.listMe({ writeOnly: true }).$promise;
            }).then(function (response) {
                if (response === false) {
                    return;
                }

                var collections = [];
                var selectedCollections = {};
                var writeableCollections = response.Data;

                for (var i = 0; i < writeableCollections.length; i++) {
                    // clean out selectCollections that aren't from this organization
                    if (writeableCollections[i].OrganizationId !== cipherAndCols.cipher.OrganizationId) {
                        continue;
                    }

                    if (writeableCollections[i].Id in cipherAndCols.cipherCollections) {
                        selectedCollections[writeableCollections[i].Id] = true;
                    }

                    var decCollection = cipherService.decryptCollection(writeableCollections[i]);
                    collections.push(decCollection);
                }

                $scope.loadingCollections = false;
                $scope.collections = collections;
                $scope.selectedCollections = selectedCollections;
            });
        });

        $scope.toggleCollectionSelectionAll = function ($event) {
            var collections = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.collections.length; i++) {
                    collections[$scope.collections[i].id] = true;
                }
            }

            $scope.selectedCollections = collections;
        };

        $scope.toggleCollectionSelection = function (id) {
            if (id in $scope.selectedCollections) {
                delete $scope.selectedCollections[id];
            }
            else {
                $scope.selectedCollections[id] = true;
            }
        };

        $scope.collectionSelected = function (collection) {
            return collection.id in $scope.selectedCollections;
        };

        $scope.allSelected = function () {
            return Object.keys($scope.selectedCollections).length === $scope.collections.length;
        };

        $scope.submit = function () {
            var request = {
                collectionIds: []
            };

            for (var id in $scope.selectedCollections) {
                if ($scope.selectedCollections.hasOwnProperty(id)) {
                    request.collectionIds.push(id);
                }
            }

            $scope.submitPromise = apiService.ciphers.putCollections({ id: cipherId }, request)
                .$promise.then(function (response) {
                    $analytics.eventTrack('Edited Cipher Collections');
                    $uibModalInstance.close({
                        action: 'collectionsEdit',
                        collectionIds: request.collectionIds
                    });
                });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
