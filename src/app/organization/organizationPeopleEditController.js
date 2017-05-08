angular
    .module('bit.organization')

    .controller('organizationPeopleEditController', function ($scope, $state, $uibModalInstance, apiService, cipherService, id,
        $analytics) {
        $analytics.eventTrack('organizationPeopleEditController', { category: 'Modal' });

        $scope.loading = true;
        $scope.collections = [];
        $scope.selectedCollections = {};

        $uibModalInstance.opened.then(function () {
            apiService.collections.listOrganization({ orgId: $state.params.orgId }, function (list) {
                $scope.collections = cipherService.decryptCollections(list.Data, $state.params.orgId, true);
                $scope.loading = false;
            });

            apiService.organizationUsers.get({ orgId: $state.params.orgId, id: id }, function (user) {
                var collections = {};
                if (user && user.Collections) {
                    for (var i = 0; i < user.Collections.Data.length; i++) {
                        collections[user.Collections.Data[i].Id] = {
                            collectionId: user.Collections.Data[i].Id,
                            readOnly: user.Collections.Data[i].ReadOnly
                        };
                    }
                }
                $scope.email = user.Email;
                $scope.type = user.Type;
                $scope.accessAll = user.AccessAll;
                $scope.selectedCollections = collections;
            });
        });

        $scope.toggleCollectionSelectionAll = function ($event) {
            var collections = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.collections.length; i++) {
                    collections[$scope.collections[i].id] = {
                        collectionId: $scope.collections[i].id,
                        readOnly: ($scope.collections[i].id in $scope.selectedCollections) ?
                            $scope.selectedCollections[$scope.collections[i].id].readOnly : false
                    };
                }
            }

            $scope.selectedCollections = collections;
        };

        $scope.toggleCollectionSelection = function (id) {
            if (id in $scope.selectedCollections) {
                delete $scope.selectedCollections[id];
            }
            else {
                $scope.selectedCollections[id] = {
                    collectionId: id,
                    readOnly: false
                };
            }
        };

        $scope.toggleCollectionReadOnlySelection = function (id) {
            if (id in $scope.selectedCollections) {
                $scope.selectedCollections[id].readOnly = !!!$scope.selectedCollections[id].readOnly;
            }
        };

        $scope.collectionSelected = function (collection) {
            return collection.id in $scope.selectedCollections;
        };

        $scope.allSelected = function () {
            return Object.keys($scope.selectedCollections).length === $scope.collections.length;
        };

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            var collections = [];
            if (!$scope.accessAll) {
                for (var collectionId in $scope.selectedCollections) {
                    if ($scope.selectedCollections.hasOwnProperty(collectionId)) {
                        collections.push($scope.selectedCollections[collectionId]);
                    }
                }
            }

            $scope.submitPromise = apiService.organizationUsers.put({ orgId: $state.params.orgId, id: id }, {
                type: $scope.type,
                collections: collections,
                accessAll: $scope.accessAll
            }, function () {
                $analytics.eventTrack('Edited User');
                $uibModalInstance.close();
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
