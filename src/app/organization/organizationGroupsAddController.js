angular
    .module('bit.organization')

    .controller('organizationGroupsAddController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics) {
        $analytics.eventTrack('organizationGroupsAddController', { category: 'Modal' });
        $scope.collections = [];
        $scope.selectedCollections = {};
        $scope.loading = true;

        $uibModalInstance.opened.then(function () {
            return apiService.collections.listOrganization({ orgId: $state.params.orgId }).$promise;
        }).then(function (collections) {
            $scope.collections = cipherService.decryptCollections(collections.Data, $state.params.orgId, true);
            $scope.loading = false;
        });

        $scope.toggleCollectionSelectionAll = function ($event) {
            var collections = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.collections.length; i++) {
                    collections[$scope.collections[i].id] = {
                        id: $scope.collections[i].id,
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
                    id: id,
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

        $scope.submit = function (model) {
            var group = {
                name: model.name,
                accessAll: !!model.accessAll,
                externalId: model.externalId
            };

            if (!group.accessAll) {
                group.collections = [];
                for (var collectionId in $scope.selectedCollections) {
                    if ($scope.selectedCollections.hasOwnProperty(collectionId)) {
                        group.collections.push($scope.selectedCollections[collectionId]);
                    }
                }
            }

            $scope.submitPromise = apiService.groups.post({ orgId: $state.params.orgId }, group, function (response) {
                $analytics.eventTrack('Created Group');
                $uibModalInstance.close({
                    id: response.Id,
                    name: response.Name
                });
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
