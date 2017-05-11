angular
    .module('bit.organization')

    .controller('organizationPeopleController', function ($scope, $state, $uibModal, cryptoService, apiService, authService,
        toastr, $analytics) {
        $scope.users = [];
        $scope.useGroups = false;

        $scope.$on('$viewContentLoaded', function () {
            loadList();

            authService.getUserProfile().then(function (profile) {
                if (profile.organizations) {
                    var org = profile.organizations[$state.params.orgId];
                    $scope.useGroups = !!org.useGroups;
                }
            });
        });

        $scope.reinvite = function (user) {
            apiService.organizationUsers.reinvite({ orgId: $state.params.orgId, id: user.id }, null, function () {
                $analytics.eventTrack('Reinvited User');
                toastr.success(user.email + ' has been invited again.', 'User Invited');
            }, function () {
                toastr.error('Unable to invite user.', 'Error');
            });
        };

        $scope.delete = function (user) {
            if (!confirm('Are you sure you want to remove this user (' + user.email + ')?')) {
                return;
            }

            apiService.organizationUsers.del({ orgId: $state.params.orgId, id: user.id }, null, function () {
                $analytics.eventTrack('Deleted User');
                toastr.success(user.email + ' has been removed.', 'User Removed');
                var index = $scope.users.indexOf(user);
                if (index > -1) {
                    $scope.users.splice(index, 1);
                }
            }, function () {
                toastr.error('Unable to remove user.', 'Error');
            });
        };

        $scope.confirm = function (user) {
            apiService.users.getPublicKey({ id: user.userId }, function (userKey) {
                var orgKey = cryptoService.getOrgKey($state.params.orgId);
                if (!orgKey) {
                    toastr.error('Unable to confirm user.', 'Error');
                    return;
                }

                var key = cryptoService.rsaEncrypt(orgKey.key, userKey.PublicKey);
                apiService.organizationUsers.confirm({ orgId: $state.params.orgId, id: user.id }, { key: key }, function () {
                    user.status = 2;
                    $analytics.eventTrack('Confirmed User');
                    toastr.success(user.email + ' has been confirmed.', 'User Confirmed');
                }, function () {
                    toastr.error('Unable to confirm user.', 'Error');
                });
            }, function () {
                toastr.error('Unable to confirm user.', 'Error');
            });
        };

        $scope.$on('organizationPeopleInvite', function (event, args) {
            $scope.invite();
        });

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

        $scope.edit = function (orgUser) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationPeopleEdit.html',
                controller: 'organizationPeopleEditController',
                resolve: {
                    orgUser: function () { return orgUser; }
                }
            });

            modal.result.then(function () {
                loadList();
            });
        };

        $scope.groups = function (user) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationPeopleGroups.html',
                controller: 'organizationPeopleGroupsController',
                resolve: {
                    orgUser: function () { return user; }
                }
            });

            modal.result.then(function () {

            });
        };

        function loadList() {
            apiService.organizationUsers.list({ orgId: $state.params.orgId }, function (list) {
                var users = [];

                for (var i = 0; i < list.Data.length; i++) {
                    var user = {
                        id: list.Data[i].Id,
                        userId: list.Data[i].UserId,
                        name: list.Data[i].Name,
                        email: list.Data[i].Email,
                        status: list.Data[i].Status,
                        type: list.Data[i].Type,
                        accessAll: list.Data[i].AccessAll
                    };

                    users.push(user);
                }

                $scope.users = users;
            });
        }
    });
