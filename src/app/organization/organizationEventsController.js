angular
    .module('bit.organization')

    .controller('organizationEventsController', function ($scope, $state, apiService, $uibModal, $filter,
        toastr, $analytics, constants) {
        $scope.events = [];
        $scope.orgUsers = [];
        $scope.loading = true;
        $scope.$on('$viewContentLoaded', function () {
            load();
        });

        var i = 0,
            orgUsersUserIdDict = {},
            orgUsersIdDict = {};

        function load() {
            apiService.organizationUsers.list({ orgId: $state.params.orgId }).$promise.then(function (list) {
                var users = [];
                for (i = 0; i < list.Data.length; i++) {
                    var user = {
                        id: list.Data[i].Id,
                        userId: list.Data[i].UserId,
                        name: list.Data[i].Name,
                        email: list.Data[i].Email
                    };

                    users.push(user);

                    var displayName = user.name || user.email;
                    orgUsersUserIdDict[user.userId] = displayName;
                    orgUsersIdDict[user.id] = displayName;
                }

                $scope.orgUsers = users;
                return apiService.events.listOrganization({ orgId: $state.params.orgId }).$promise;
            }).then(function (list) {
                var events = [];
                for (i = 0; i < list.Data.length; i++) {
                    var userId = list.Data[i].ActingUserId || list.Data[i].UserId;
                    events.push({
                        message: eventMessage(list.Data[i]),
                        appIcon: 'fa-globe',
                        appName: 'Web',
                        userId: userId,
                        userName: userId ? (orgUsersUserIdDict[userId] || '-') : '-',
                        date: list.Data[i].Date
                    });
                }
                $scope.events = events;
                $scope.loading = false;
            });
        }

        function eventMessage(ev) {
            var msg = '';
            switch (ev.Type) {
                // User
                case constants.eventType.User_LoggedIn:
                    msg = 'Logged in.';
                    break;
                case constants.eventType.User_ChangedPassword:
                    msg = 'Changed account password.';
                    break;
                case constants.eventType.User_Enabled2fa:
                    msg = 'Enabled two-step login.';
                    break;
                case constants.eventType.User_Disabled2fa:
                    msg = 'Disabled two-step login.';
                    break;
                case constants.eventType.User_Recovered2fa:
                    msg = 'Recovered account from two-step login.';
                    break;
                case constants.eventType.User_FailedLogIn:
                    msg = 'Login attempt failed with incorrect password.';
                    break;
                case constants.eventType.User_FailedLogIn2fa:
                    msg = 'Login attempt failed with incorrect two-step login.';
                    break;
                // Cipher
                case constants.eventType.Cipher_Created:
                    msg = 'Created item ' + ev.CipherId + '.';
                    break;
                case constants.eventType.Cipher_Updated:
                    msg = 'Edited item ' + ev.CipherId + '.';
                    break;
                case constants.eventType.Cipher_Deleted:
                    msg = 'Deleted item ' + ev.CipherId + '.';
                    break;
                case constants.eventType.Cipher_AttachmentCreated:
                    msg = 'Created attachment for item ' + ev.CipherId + '.';
                    break;
                case constants.eventType.Cipher_AttachmentDeleted:
                    msg = 'Deleted attachment for item ' + ev.CipherId + '.';
                    break;
                case constants.eventType.Cipher_Shared:
                    msg = 'Shared item ' + ev.CipherId + '.';
                    break;
                case constants.eventType.Cipher_UpdatedCollections:
                    msg = 'Update collections for item ' + ev.CipherId + '.';
                    break;
                // Collection
                case constants.eventType.Collection_Created:
                    msg = 'Created collection ' + ev.CollectionId + '.';
                    break;
                case constants.eventType.Collection_Updated:
                    msg = 'Edited collection ' + ev.CollectionId + '.';
                    break;
                case constants.eventType.Collection_Deleted:
                    msg = 'Deleted collection ' + ev.CollectionId + '.';
                    break;
                // Group
                case constants.eventType.Group_Created:
                    msg = 'Created group ' + ev.GroupId + '.';
                    break;
                case constants.eventType.Group_Updated:
                    msg = 'Edited group ' + ev.GroupId + '.';
                    break;
                case constants.eventType.Group_Deleted:
                    msg = 'Deleted group ' + ev.GroupId + '.';
                    break;
                // Org user
                case constants.eventType.OrganizationUser_Invited:
                    msg = 'Invited user ' + ev.OrganizationUserId + '.';
                    break;
                case constants.eventType.OrganizationUser_Confirmed:
                    msg = 'Confirmed user ' + ev.OrganizationUserId + '.';
                    break;
                case constants.eventType.OrganizationUser_Updated:
                    msg = 'Edited user ' + ev.OrganizationUserId + '.';
                    break;
                case constants.eventType.OrganizationUser_Removed:
                    msg = 'Removed user ' + ev.OrganizationUserId + '.';
                    break;
                case constants.eventType.OrganizationUser_UpdatedGroups:
                    msg = 'Edited groups for user ' + ev.OrganizationUserId + '.';
                    break;
                // Org
                case constants.eventType.Organization_Updated:
                    msg = 'Edited organization settings.';
                    break;
                default:
                    break;
            }

            return msg === '' ? null : msg;
        }
    });
