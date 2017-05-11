angular
    .module('bit.organization')

    .controller('organizationCollectionsEditController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics, id, authService) {
        $analytics.eventTrack('organizationCollectionsEditController', { category: 'Modal' });
        var groupsLength = 0;
        $scope.collection = {};
        $scope.groups = [];
        $scope.selectedGroups = {};
        $scope.loading = true;
        $scope.useGroups = false;

        $uibModalInstance.opened.then(function () {
            return apiService.collections.getDetails({ orgId: $state.params.orgId, id: id }).$promise;
        }).then(function (collection) {
            $scope.collection = cipherService.decryptCollection(collection);

            var groups = {};
            if (collection.Groups) {
                for (var i = 0; i < collection.Groups.length; i++) {
                    groups[collection.Groups[i].Id] = {
                        id: collection.Groups[i].Id,
                        readOnly: collection.Groups[i].ReadOnly
                    };
                }
            }
            $scope.selectedGroups = groups;

            return authService.getUserProfile();
        }).then(function (profile) {
            if (profile.organizations) {
                var org = profile.organizations[$state.params.orgId];
                $scope.useGroups = !!org.useGroups;
            }

            if ($scope.useGroups) {
                return apiService.groups.listOrganization({ orgId: $state.params.orgId }).$promise;
            }

            return null;
        }).then(function (groups) {
            if (!groups) {
                $scope.loading = false;
                return;
            }

            var groupsArr = [];
            for (var i = 0; i < groups.Data.length; i++) {
                groupsArr.push({
                    id: groups.Data[i].Id,
                    name: groups.Data[i].Name,
                    accessAll: groups.Data[i].AccessAll
                });

                if (!groups.Data[i].AccessAll) {
                    groupsLength++;
                }
            }

            $scope.groups = groupsArr;
            $scope.loading = false;
        });

        $scope.toggleGroupSelectionAll = function ($event) {
            var groups = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.groups.length; i++) {
                    groups[$scope.groups[i].id] = {
                        id: $scope.groups[i].id,
                        readOnly: ($scope.groups[i].id in $scope.selectedGroups) ?
                            $scope.selectedGroups[$scope.groups[i].id].readOnly : false
                    };
                }
            }

            $scope.selectedGroups = groups;
        };

        $scope.toggleGroupSelection = function (id) {
            if (id in $scope.selectedGroups) {
                delete $scope.selectedGroups[id];
            }
            else {
                $scope.selectedGroups[id] = {
                    id: id,
                    readOnly: false
                };
            }
        };

        $scope.toggleGroupReadOnlySelection = function (group) {
            if (group.id in $scope.selectedGroups) {
                $scope.selectedGroups[group.id].readOnly = !group.accessAll && !!!$scope.selectedGroups[group.id].readOnly;
            }
        };

        $scope.groupSelected = function (group) {
            return group.id in $scope.selectedGroups || group.accessAll;
        };

        $scope.allSelected = function () {
            return Object.keys($scope.selectedGroups).length >= groupsLength;
        };

        $scope.submit = function (model) {
            var collection = cipherService.encryptCollection(model, $state.params.orgId);

            if ($scope.useGroups) {
                collection.groups = [];

                for (var groupId in $scope.selectedGroups) {
                    if ($scope.selectedGroups.hasOwnProperty(groupId)) {
                        for (var i = 0; i < $scope.groups.length; i++) {
                            if ($scope.groups[i].id === $scope.selectedGroups[groupId].id) {
                                if (!$scope.groups[i].accessAll) {
                                    collection.groups.push($scope.selectedGroups[groupId]);
                                }
                                break;
                            }
                        }
                    }
                }
            }

            $scope.submitPromise = apiService.collections.put({
                orgId: $state.params.orgId,
                id: id
            }, collection, function (response) {
                $analytics.eventTrack('Edited Collection');
                var decCollection = cipherService.decryptCollection(response, $state.params.orgId, true);
                $uibModalInstance.close(decCollection);
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
