angular
    .module('bit.organization')

    .controller('organizationCollectionsUsersController', function ($scope, $state, $uibModalInstance, apiService, cipherService,
        $analytics, collection, toastr) {
        $analytics.eventTrack('organizationCollectionsUsersController', { category: 'Modal' });
        $scope.loading = true;
        $scope.collection = collection;
        $scope.users = [];

        $uibModalInstance.opened.then(function () {
            $scope.loading = false;
            apiService.collectionUsers.listCollection(
                {
                    orgId: $state.params.orgId,
                    collectionId: collection.id
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
                                accessAll: userList.Data[i].AccessAll
                            });
                        }
                        $scope.users = users;
                    }
                });
        });

        $scope.remove = function (user) {
            if (!confirm('Are you sure you want to remove this user (' + user.email + ') from this ' +
                'collection (' + collection.name + ')?')) {
                return;
            }

            apiService.collectionUsers.del({ orgId: $state.params.orgId, id: user.id }, null, function () {
                toastr.success(user.email + ' has been removed.', 'User Removed');
                $analytics.eventTrack('Removed User From Collection');
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
