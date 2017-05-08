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
                            collections[cipher.CollectionIds[i]] = true;
                        }
                    }
                    $scope.selectedCollections = collections;

                    return cipher;
                }

                return null;
            }).then(function (cipher) {
                if (!cipher) {
                    $scope.loadingCollections = false;
                    return;
                }

                apiService.collections.listMe(function (response) {
                    var collections = [];
                    for (var i = 0; i < response.Data.length; i++) {
                        if (response.Data[i].OrganizationId !== cipher.OrganizationId || response.Data[i].ReadOnly) {
                            if (response.Data[i].Id in $scope.selectedCollections) {
                                delete $scope.selectedCollections[response.Data[i].Id];
                            }
                            continue;
                        }

                        var decCollection = cipherService.decryptCollection(response.Data[i]);
                        collections.push(decCollection);
                    }

                    $scope.loadingCollections = false;
                    $scope.collections = collections;
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
