angular
    .module('bit.organization')

    .controller('organizationSubvaultsUsersController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics, subvault, toastr) {
        $scope.loading = true;
        $scope.subvault = subvault;
        $scope.users = [];

        $uibModalInstance.opened.then(function () {
            $scope.loading = false;
            apiService.subvaultUsers.listSubvault(
                {
                    orgId: $state.params.orgId,
                    subvaultId: subvault.id
                },
                function (userList) {
                    if (userList && userList.Data.length) {
                        var users = [];
                        for (var i = 0; i < userList.Data.length; i++) {
                            users.push({
                                id: userList.Data[i].Id,
                                userId: userList.Data[i].UserId,
                                name: userList.Data[i].Name,
                                email: userList.Data[i].Email,
                                type: userList.Data[i].Type,
                                status: userList.Data[i].Status,
                                readOnly: userList.Data[i].ReadOnly,
                                accessAllSubvaults: userList.Data[i].AccessAllSubvaults
                            });
                        }
                        $scope.users = users;
                    }
                });
        });

        $scope.remove = function (user) {
            if (!confirm('Are you sure you want to remove this user (' + user.email + ') from this ' +
                'subvault (' + subvault.name + ')?')) {
                return;
            }

            apiService.subvaultUsers.del({ orgId: $state.params.orgId, id: user.id }, null, function () {
                toastr.success(user.email + ' has been removed.', 'User Removed');
                var index = $scope.users.indexOf(user);
                if (index > -1) {
                    $scope.users.splice(index, 1);
                }
            }, function () {
                toastr.error('Unable to remove user.', 'Error');
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
