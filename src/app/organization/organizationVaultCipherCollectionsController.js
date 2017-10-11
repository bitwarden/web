angular
    .module('bit.organization')

    .controller('organizationVaultCipherCollectionsController', function ($scope, apiService, $uibModalInstance, cipherService,
        cipher, $analytics, collections) {
        $analytics.eventTrack('organizationVaultCipherCollectionsController', { category: 'Modal' });
        $scope.cipher = {};
        $scope.collections = [];
        $scope.selectedCollections = {};

        $uibModalInstance.opened.then(function () {
            var collectionUsed = [];
            for (var i = 0; i < collections.length; i++) {
                if (collections[i].id) {
                    collectionUsed.push(collections[i]);
                }
            }
            $scope.collections = collectionUsed;

            $scope.cipher = cipher;

            var selectedCollections = {};
            if ($scope.cipher.collectionIds) {
                for (i = 0; i < $scope.cipher.collectionIds.length; i++) {
                    selectedCollections[$scope.cipher.collectionIds[i]] = true;
                }
            }
            $scope.selectedCollections = selectedCollections;
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

            $scope.submitPromise = apiService.ciphers.putCollectionsAdmin({ id: cipher.id }, request)
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
