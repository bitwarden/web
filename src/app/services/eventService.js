angular
    .module('bit.services')

    .factory('eventService', function (constants, $filter, constants) {
        var _service = {};

        _service.getDefaultDateFilters = function () {
            var d = new Date();
            var filterEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59);
            d.setDate(d.getDate() - 30);
            var filterStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0);

            return {
                start: filterStart,
                end: filterEnd
            };
        };

        _service.formatDateFilters = function (filterStart, filterEnd) {
            var result = {
                start: null,
                end: null,
                error: null
            };

            try {
                var format = 'yyyy-MM-ddTHH:mm';
                result.start = $filter('date')(filterStart, format + 'Z', 'UTC');
                result.end = $filter('date')(filterEnd, format + ':59.999Z', 'UTC');
            } catch (e) { }

            if (!result.start || !result.end || result.end < result.start) {
                result.error = 'Invalid date range.';
            }

            return result;
        };

        _service.getEventInfo = function (ev, options) {
            options = options || {
                cipherInfo: true
            };

            var appInfo = getAppInfo(ev);

            return {
                message: getEventMessage(ev, options),
                appIcon: appInfo.icon,
                appName: appInfo.name
            };
        };

        function getEventMessage(ev, options) {
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
                    msg = options.cipherInfo ? 'Created item ' + formatCipherId(ev) + '.' : 'Created.';
                    break;
                case constants.eventType.Cipher_Updated:
                    msg = options.cipherInfo ? 'Edited item ' + formatCipherId(ev) + '.' : 'Edited.';
                    break;
                case constants.eventType.Cipher_Deleted:
                    msg = options.cipherInfo ? 'Deleted item ' + formatCipherId(ev) + '.' : 'Deleted';
                    break;
                case constants.eventType.Cipher_AttachmentCreated:
                    msg = options.cipherInfo ? 'Created attachment for item ' + formatCipherId(ev) + '.' :
                        'Created attachment.';
                    break;
                case constants.eventType.Cipher_AttachmentDeleted:
                    msg = options.cipherInfo ? 'Deleted attachment for item ' + formatCipherId(ev) + '.' :
                        'Deleted attachment.';
                    break;
                case constants.eventType.Cipher_Shared:
                    msg = options.cipherInfo ? 'Shared item ' + formatCipherId(ev) + '.' : 'Shared.';
                    break;
                case constants.eventType.Cipher_UpdatedCollections:
                    msg = options.cipherInfo ? 'Update collections for item ' + formatCipherId(ev) + '.' :
                        'Updated collections.';
                    break;
                // Collection
                case constants.eventType.Collection_Created:
                    msg = 'Created collection ' + formatCollectionId(ev) + '.';
                    break;
                case constants.eventType.Collection_Updated:
                    msg = 'Edited collection ' + formatCollectionId(ev) + '.';
                    break;
                case constants.eventType.Collection_Deleted:
                    msg = 'Deleted collection ' + formatCollectionId(ev) + '.';
                    break;
                // Group
                case constants.eventType.Group_Created:
                    msg = 'Created group ' + formatGroupId(ev) + '.';
                    break;
                case constants.eventType.Group_Updated:
                    msg = 'Edited group ' + formatGroupId(ev) + '.';
                    break;
                case constants.eventType.Group_Deleted:
                    msg = 'Deleted group ' + formatGroupId(ev) + '.';
                    break;
                // Org user
                case constants.eventType.OrganizationUser_Invited:
                    msg = 'Invited user ' + formatOrgUserId(ev) + '.';
                    break;
                case constants.eventType.OrganizationUser_Confirmed:
                    msg = 'Confirmed user ' + formatOrgUserId(ev) + '.';
                    break;
                case constants.eventType.OrganizationUser_Updated:
                    msg = 'Edited user ' + formatOrgUserId(ev) + '.';
                    break;
                case constants.eventType.OrganizationUser_Removed:
                    msg = 'Removed user ' + formatOrgUserId(ev) + '.';
                    break;
                case constants.eventType.OrganizationUser_UpdatedGroups:
                    msg = 'Edited groups for user ' + formatOrgUserId(ev) + '.';
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

        function getAppInfo(ev) {
            var appInfo = {
                icon: 'fa-globe',
                name: 'Unknown'
            };

            switch (ev.DeviceType) {
                case constants.deviceType.android:
                    appInfo.icon = 'fa-android';
                    appInfo.name = 'Mobile App - Android';
                    break;
                case constants.deviceType.ios:
                    appInfo.icon = 'fa-apple';
                    appInfo.name = 'Mobile App - iOS';
                    break;
                case constants.deviceType.uwp:
                    appInfo.icon = 'fa-windows';
                    appInfo.name = 'Mobile App - Windows';
                    break;
                case constants.deviceType.chromeExt:
                    appInfo.icon = 'fa-chrome';
                    appInfo.name = 'Extension - Chrome';
                    break;
                case constants.deviceType.firefoxExt:
                    appInfo.icon = 'fa-firefox';
                    appInfo.name = 'Extension - Firefox';
                    break;
                case constants.deviceType.operaExt:
                    appInfo.icon = 'fa-opera';
                    appInfo.name = 'Extension - Opera';
                    break;
                case constants.deviceType.edgeExt:
                    appInfo.icon = 'fa-edge';
                    appInfo.name = 'Extension - Edge';
                    break;
                case constants.deviceType.vivaldiExt:
                    appInfo.icon = 'fa-puzzle-piece';
                    appInfo.name = 'Extension - Vivaldi';
                    break;
                case constants.deviceType.windowsDesktop:
                    appInfo.icon = 'fa-windows';
                    appInfo.name = 'Desktop - Windows';
                    break;
                case constants.deviceType.macOsDesktop:
                    appInfo.icon = 'fa-apple';
                    appInfo.name = 'Desktop - macOS';
                    break;
                case constants.deviceType.linuxDesktop:
                    appInfo.icon = 'fa-linux';
                    appInfo.name = 'Desktop - Linux';
                    break;
                case constants.deviceType.chrome:
                    appInfo.icon = 'fa-globe';
                    appInfo.name = 'Web Vault - Chrome';
                    break;
                case constants.deviceType.firefox:
                    appInfo.icon = 'fa-globe';
                    appInfo.name = 'Web Vault - Firefox';
                    break;
                case constants.deviceType.opera:
                    appInfo.icon = 'fa-globe';
                    appInfo.name = 'Web Vault - Opera';
                    break;
                case constants.deviceType.safari:
                    appInfo.icon = 'fa-globe';
                    appInfo.name = 'Web Vault - Safari';
                    break;
                case constants.deviceType.vivaldi:
                    appInfo.icon = 'fa-globe';
                    appInfo.name = 'Web Vault - Vivaldi';
                    break;
                case constants.deviceType.edge:
                    appInfo.icon = 'fa-globe';
                    appInfo.name = 'Web Vault - Edge';
                    break;
                case constants.deviceType.ie:
                    appInfo.icon = 'fa-globe';
                    appInfo.name = 'Web Vault - IE';
                    break;
                case constants.deviceType.unknown:
                    appInfo.icon = 'fa-globe';
                    appInfo.name = 'Web Vault - Unknown';
                    break;
                default:
                    break;
            }

            return appInfo;
        }

        function formatCipherId(ev) {
            var shortId = ev.CipherId.substring(0, 8);
            if (!ev.OrganizationId) {
                return '<code>' + shortId + '</code>';
            }

            return '<a title="View item ' + ev.CipherId + '" ui-sref="backend.org.vault({orgId:\'' + ev.OrganizationId + '\',search:\'' + shortId + '\',viewEvents:\'' + ev.CipherId + '\'})">' +
                '<code>' + shortId + '</code></a>';
        }

        function formatGroupId(ev) {
            var shortId = ev.GroupId.substring(0, 8);
            return '<a title="View group ' + ev.GroupId + '" ui-sref="backend.org.groups({orgId:\'' + ev.OrganizationId + '\',search:\'' + shortId + '\'})">' +
                '<code>' + shortId + '</code></a>';
        }

        function formatCollectionId(ev) {
            var shortId = ev.CollectionId.substring(0, 8);
            return '<a title="View collection ' + ev.CollectionId + '" ui-sref="backend.org.collections({orgId:\'' + ev.OrganizationId + '\',search:\'' + shortId + '\'})">' +
                '<code>' + shortId + '</code></a>';
        }

        function formatOrgUserId(ev) {
            var shortId = ev.OrganizationUserId.substring(0, 8);
            return '<a title="View user ' + ev.OrganizationUserId + '" ui-sref="backend.org.people({orgId:\'' + ev.OrganizationId + '\',search:\'' + shortId + '\'})">' +
                '<code>' + shortId + '</code></a>';
        }

        return _service;
    });
