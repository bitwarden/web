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

        $scope.submit = function (model) {
            var group = {
                name: model.name,
                accessAll: !!model.accessAll
            };

            if (!group.accessAll) {
                group.collectionIds = [];
                for (var id in $scope.selectedCollections) {
                    if ($scope.selectedCollections.hasOwnProperty(id)) {
                        group.collectionIds.push(id);
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
