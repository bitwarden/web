angular
    .module('bit.organization')

    .controller('organizationPeopleGroupsController', function ($scope, $state, $uibModalInstance, apiService,
        orgUser, $analytics) {
        $analytics.eventTrack('organizationPeopleGroupsController', { category: 'Modal' });

        $scope.loading = true;
        $scope.groups = [];
        $scope.selectedGroups = {};
        $scope.orgUser = orgUser;

        $uibModalInstance.opened.then(function () {
            return apiService.groups.listOrganization({ orgId: $state.params.orgId }).$promise;
        }).then(function (groupsList) {
            var groups = [];
            for (var i = 0; i < groupsList.Data.length; i++) {
                groups.push({
                    id: groupsList.Data[i].Id,
                    name: groupsList.Data[i].Name
                });
            }
            $scope.groups = groups;

            return apiService.organizationUsers.listGroups({ orgId: $state.params.orgId, id: orgUser.id }).$promise;
        }).then(function (groupIds) {
            var selectedGroups = {};
            if (groupIds) {
                for (var i = 0; i < groupIds.length; i++) {
                    selectedGroups[groupIds[i]] = true;
                }
            }
            $scope.selectedGroups = selectedGroups;
            $scope.loading = false;
        }, function (error) {

        });

        $scope.toggleGroupSelectionAll = function ($event) {
            var groups = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.groups.length; i++) {
                    groups[$scope.groups[i].id] = true;
                }
            }

            $scope.selectedGroups = groups;
        };

        $scope.toggleGroupSelection = function (id) {
            if (id in $scope.selectedGroups) {
                delete $scope.selectedGroups[id];
            }
            else {
                $scope.selectedGroups[id] = true;
            }
        };

        $scope.groupSelected = function (group) {
            return group.id in $scope.selectedGroups;
        };

        $scope.allSelected = function () {
            return Object.keys($scope.selectedGroups).length === $scope.groups.length;
        };

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            var groups = [];
            for (var groupId in $scope.selectedGroups) {
                if ($scope.selectedGroups.hasOwnProperty(groupId)) {
                    groups.push(groupId);
                }
            }

            $scope.submitPromise = apiService.organizationUsers.putGroups({ orgId: $state.params.orgId, id: orgUser.id }, {
                groupIds: groups,
            }, function () {
                $analytics.eventTrack('Edited User Groups');
                $uibModalInstance.close();
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
