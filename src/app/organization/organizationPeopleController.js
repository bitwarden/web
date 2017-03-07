angular
    .module('bit.organization')

    .controller('organizationPeopleController', function ($scope, $state, $uibModal, cryptoService, apiService, toastr) {
        $scope.users = [];
        loadList();

        $scope.confirm = function (user) {
            apiService.users.getPublicKey({ id: user.userId }, function (userKey) {
                var orgKey = cryptoService.getOrgKey($state.params.orgId);
                if (!orgKey) {
                    toastr.error('Unable to confirm user.', 'Error');
                    return;
                }

                var key = cryptoService.rsaEncrypt(orgKey, userKey.PublicKey);
                apiService.organizationUsers.confirm({ orgId: $state.params.orgId, id: user.id }, { key: key }, function () {
                    user.status = 2;
                    toastr.success(user.email + ' has been confirmed.', 'User Confirmed');
                }, function () {
                    toastr.error('Unable to confirm user.', 'Error');
                });
            }, function () {
                toastr.error('Unable to confirm user.', 'Error');
            });
        };

        $scope.invite = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationPeopleInvite.html',
                controller: 'organizationPeopleInviteController'
            });

            modal.result.then(function () {
                loadList();
            });
        };

        function loadList() {
            apiService.organizationUsers.list({ orgId: $state.params.orgId }, function (list) {
                var users = [];

                for (var i = 0; i < list.Data.length; i++) {
                    users.push({
                        id: list.Data[i].Id,
                        userId: list.Data[i].UserId,
                        name: list.Data[i].Name,
                        email: list.Data[i].Email,
                        status: list.Data[i].Status,
                        type: list.Data[i].Type
                    });
                }

                $scope.users = users;
            });
        }
    });
