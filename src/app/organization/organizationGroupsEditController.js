angular
    .module('bit.organization')

    .controller('organizationGroupsEditController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics, id) {
        $analytics.eventTrack('organizationGroupsEditController', { category: 'Modal' });
        $scope.collections = [];
        $scope.selectedCollections = {};
        $scope.loading = true;

        $uibModalInstance.opened.then(function () {
            return apiService.groups.getDetails({ orgId: $state.params.orgId, id: id }).$promise;
        }).then(function (group) {
            $scope.group = {
                id: id,
                name: group.Name,
                accessAll: group.AccessAll
            };

            var collections = {};
            if (group.Collections) {
                for (var i = 0; i < group.Collections.length; i++) {
                    collections[group.Collections[i].Id] = {
                        id: group.Collections[i].Id,
                        readOnly: group.Collections[i].ReadOnly
                    };
                }
            }
            $scope.selectedCollections = collections;

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

        $scope.submit = function () {
            var group = {
                name: $scope.group.name,
                accessAll: !!$scope.group.accessAll
            };

            if (!group.accessAll) {
                group.collections = [];
                for (var collectionId in $scope.selectedCollections) {
                    if ($scope.selectedCollections.hasOwnProperty(collectionId)) {
                        group.collections.push($scope.selectedCollections[collectionId]);
                    }
                }
            }

            $scope.submitPromise = apiService.groups.put({
                orgId: $state.params.orgId,
                id: id
            }, group, function (response) {
                $analytics.eventTrack('Edited Group');
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
