angular
    .module('bit.vault')

    .controller('vaultLoginCollectionsController', function ($scope, apiService, $uibModalInstance, cipherService,
        loginId, $analytics) {
        $analytics.eventTrack('vaultLoginCollectionsController', { category: 'Modal' });
        $scope.login = {};
        $scope.readOnly = false;
        $scope.loadingLogin = true;
        $scope.loadingCollections = true;
        $scope.selectedCollections = {};
        $scope.collections = [];

        $uibModalInstance.opened.then(function () {
            apiService.ciphers.getDetails({ id: loginId }).$promise.then(function (cipher) {
                $scope.loadingLogin = false;

                $scope.readOnly = !cipher.Edit;
                if (cipher.Edit && cipher.OrganizationId) {
                    if (cipher.Type === 1) {
                        $scope.login = cipherService.decryptLoginPreview(cipher);
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
            }).then(function (cipherAndCols) {
                if (!cipherAndCols) {
                    $scope.loadingCollections = false;
                    return;
                }

                apiService.collections.listMe({ writeOnly: true }, function (response) {
                    var collections = [];
                    var selectedCollections = {};

                    for (var i = 0; i < response.Data.length; i++) {
                        // clean out selectCollections that aren't from this organization or read only
                        if (response.Data[i].Id in cipherAndCols.cipherCollections &&
                            response.Data[i].OrganizationId === cipherAndCols.cipher.OrganizationId) {
                            selectedCollections[response.Data[i].Id] = true;
                        }
                        else {
                            continue;
                        }

                        var decCollection = cipherService.decryptCollection(response.Data[i]);
                        collections.push(decCollection);
                    }

                    $scope.loadingCollections = false;
                    $scope.collections = collections;
                    $scope.selectedCollections = selectedCollections;
                });
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

            $scope.submitPromise = apiService.ciphers.putCollections({ id: loginId }, request)
                .$promise.then(function (response) {
                    $analytics.eventTrack('Edited Login Collections');
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
