angular
    .module('bit.organization')

    .controller('organizationGroupsController', function ($scope, $state, apiService, $uibModal, $filter,
        toastr, $analytics, $uibModalStack) {
        $scope.groups = [];
        $scope.loading = true;
        $scope.$on('$viewContentLoaded', function () {
            loadList();
        });

        $scope.$on('organizationGroupsAdd', function (event, args) {
            $scope.add();
        });

        $scope.add = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationGroupsAdd.html',
                controller: 'organizationGroupsAddController'
            });

            modal.result.then(function (group) {
                $scope.groups.push(group);
            });
        };

        $scope.edit = function (group) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationGroupsEdit.html',
                controller: 'organizationGroupsEditController',
                resolve: {
                    id: function () { return group.id; }
                }
            });

            modal.result.then(function (editedGroup) {
                var existingGroups = $filter('filter')($scope.groups, { id: editedGroup.id }, true);
                if (existingGroups && existingGroups.length > 0) {
                    existingGroups[0].name = editedGroup.name;
                }
            });
        };

        $scope.users = function (group) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationGroupsUsers.html',
                controller: 'organizationGroupsUsersController',
                size: 'lg',
                resolve: {
                    group: function () { return group; }
                }
            });

            modal.result.then(function () {
                // nothing to do
            });
        };

        $scope.delete = function (group) {
            if (!confirm('Are you sure you want to delete this group (' + group.name + ')?')) {
                return;
            }

            apiService.groups.del({ orgId: $state.params.orgId, id: group.id }, function () {
                var index = $scope.groups.indexOf(group);
                if (index > -1) {
                    $scope.groups.splice(index, 1);
                }

                $analytics.eventTrack('Deleted Group');
                toastr.success(group.name + ' has been deleted.', 'Group Deleted');
            }, function () {
                toastr.error(group.name + ' was not able to be deleted.', 'Error');
            });
        };

        function loadList() {
            apiService.groups.listOrganization({ orgId: $state.params.orgId }, function (list) {
                var groups = [];
                for (var i = 0; i < list.Data.length; i++) {
                    groups.push({
                        id: list.Data[i].Id,
                        name: list.Data[i].Name
                    });
                }
                $scope.groups = groups;
                $scope.loading = false;

                if ($state.params.search) {
                    $uibModalStack.dismissAll();
                    $scope.filterSearch = $state.params.search;
                    $('#filterSearch').focus();
                }
            });
        }
    });
