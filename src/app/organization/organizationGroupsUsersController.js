angular
    .module('bit.organization')

    .controller('organizationGroupsUsersController', function ($scope, $state, $uibModalInstance, apiService,
        $analytics, group, toastr) {
        $analytics.eventTrack('organizationGroupUsersController', { category: 'Modal' });
        $scope.loading = true;
        $scope.group = group;
        $scope.users = [];

        $uibModalInstance.opened.then(function () {
            return apiService.groups.listUsers({
                orgId: $state.params.orgId,
                id: group.id
            }).$promise;
        }).then(function (userList) {
            var users = [];
            if (userList && userList.Data.length) {
                for (var i = 0; i < userList.Data.length; i++) {
                    users.push({
                        organizationUserId: userList.Data[i].OrganizationUserId,
                        name: userList.Data[i].Name,
                        email: userList.Data[i].Email,
                        type: userList.Data[i].Type,
                        status: userList.Data[i].Status,
                        accessAll: userList.Data[i].AccessAll
                    });
                }
            }

            $scope.users = users;
            $scope.loading = false;
        });

        $scope.remove = function (user) {
            if (!confirm('Are you sure you want to remove this user (' + user.email + ') from this ' +
                'group (' + group.name + ')?')) {
                return;
            }

            //apiService.collectionUsers.del({ orgId: $state.params.orgId, id: user.id }, null, function () {
            //    toastr.success(user.email + ' has been removed.', 'User Removed');
            //    $analytics.eventTrack('Removed User From Collection');
            //    var index = $scope.users.indexOf(user);
            //    if (index > -1) {
            //        $scope.users.splice(index, 1);
            //    }
            //}, function () {
            //    toastr.error('Unable to remove user.', 'Error');
            //});
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
