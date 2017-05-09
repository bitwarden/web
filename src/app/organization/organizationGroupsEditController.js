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
                name: group.Name
            };

            var collections = {};
            if (group.CollectionIds) {
                for (var i = 0; i < group.CollectionIds.length; i++) {
                    collections[group.CollectionIds[i]] = true;
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
            var group = $scope.group;
            group.collectionIds = [];
            for (var id in $scope.selectedCollections) {
                if ($scope.selectedCollections.hasOwnProperty(id)) {
                    group.collectionIds.push(id);
                }
            }

            $scope.submitPromise = apiService.groups.put({ orgId: $state.params.orgId }, group, function (response) {
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
