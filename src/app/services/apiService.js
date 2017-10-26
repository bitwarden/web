angular
    .module('bit.services')

    .factory('apiService', function ($resource, tokenService, appSettings, $httpParamSerializer) {
        var _service = {},
            _apiUri = appSettings.apiUri,
            _identityUri = appSettings.identityUri;

        _service.folders = $resource(_apiUri + '/folders/:id', {}, {
            get: { method: 'GET', params: { id: '@id' } },
            list: { method: 'GET', params: {} },
            post: { method: 'POST', params: {} },
            put: { method: 'POST', params: { id: '@id' } },
            del: { url: _apiUri + '/folders/:id/delete', method: 'POST', params: { id: '@id' } }
        });

        _service.ciphers = $resource(_apiUri + '/ciphers/:id', {}, {
            get: { method: 'GET', params: { id: '@id' } },
            getAdmin: { url: _apiUri + '/ciphers/:id/admin', method: 'GET', params: { id: '@id' } },
            getDetails: { url: _apiUri + '/ciphers/:id/details', method: 'GET', params: { id: '@id' } },
            list: { method: 'GET', params: {} },
            listDetails: { url: _apiUri + '/ciphers/details', method: 'GET', params: {} },
            listOrganizationDetails: { url: _apiUri + '/ciphers/organization-details', method: 'GET', params: {} },
            post: { method: 'POST', params: {} },
            postAdmin: { url: _apiUri + '/ciphers/admin', method: 'POST', params: {} },
            put: { method: 'POST', params: { id: '@id' } },
            putAdmin: { url: _apiUri + '/ciphers/:id/admin', method: 'POST', params: { id: '@id' } },
            'import': { url: _apiUri + '/ciphers/import', method: 'POST', params: {} },
            importOrg: { url: _apiUri + '/ciphers/import-organization?organizationId=:orgId', method: 'POST', params: { orgId: '@orgId' } },
            putPartial: { url: _apiUri + '/ciphers/:id/partial', method: 'POST', params: { id: '@id' } },
            putShare: { url: _apiUri + '/ciphers/:id/share', method: 'POST', params: { id: '@id' } },
            putCollections: { url: _apiUri + '/ciphers/:id/collections', method: 'POST', params: { id: '@id' } },
            putCollectionsAdmin: { url: _apiUri + '/ciphers/:id/collections-admin', method: 'POST', params: { id: '@id' } },
            del: { url: _apiUri + '/ciphers/:id/delete', method: 'POST', params: { id: '@id' } },
            delAdmin: { url: _apiUri + '/ciphers/:id/delete-admin', method: 'POST', params: { id: '@id' } },
            delMany: { url: _apiUri + '/ciphers/delete', method: 'POST' },
            moveMany: { url: _apiUri + '/ciphers/move', method: 'POST' },
            purge: { url: _apiUri + '/ciphers/purge', method: 'POST' },
            postAttachment: {
                url: _apiUri + '/ciphers/:id/attachment',
                method: 'POST',
                headers: { 'Content-Type': undefined },
                params: { id: '@id' }
            },
            postShareAttachment: {
                url: _apiUri + '/ciphers/:id/attachment/:attachmentId/share?organizationId=:orgId',
                method: 'POST',
                headers: { 'Content-Type': undefined },
                params: { id: '@id', attachmentId: '@attachmentId', orgId: '@orgId' }
            },
            delAttachment: { url: _apiUri + '/ciphers/:id/attachment/:attachmentId/delete', method: 'POST', params: { id: '@id', attachmentId: '@attachmentId' } }
        });

        _service.organizations = $resource(_apiUri + '/organizations/:id', {}, {
            get: { method: 'GET', params: { id: '@id' } },
            getBilling: { url: _apiUri + '/organizations/:id/billing', method: 'GET', params: { id: '@id' } },
            getLicense: { url: _apiUri + '/organizations/:id/license', method: 'GET', params: { id: '@id' } },
            list: { method: 'GET', params: {} },
            post: { method: 'POST', params: {} },
            put: { method: 'POST', params: { id: '@id' } },
            putPayment: { url: _apiUri + '/organizations/:id/payment', method: 'POST', params: { id: '@id' } },
            putSeat: { url: _apiUri + '/organizations/:id/seat', method: 'POST', params: { id: '@id' } },
            putStorage: { url: _apiUri + '/organizations/:id/storage', method: 'POST', params: { id: '@id' } },
            putUpgrade: { url: _apiUri + '/organizations/:id/upgrade', method: 'POST', params: { id: '@id' } },
            putCancel: { url: _apiUri + '/organizations/:id/cancel', method: 'POST', params: { id: '@id' } },
            putReinstate: { url: _apiUri + '/organizations/:id/reinstate', method: 'POST', params: { id: '@id' } },
            postLeave: { url: _apiUri + '/organizations/:id/leave', method: 'POST', params: { id: '@id' } },
            postVerifyBank: { url: _apiUri + '/organizations/:id/verify-bank', method: 'POST', params: { id: '@id' } },
            del: { url: _apiUri + '/organizations/:id/delete', method: 'POST', params: { id: '@id' } },
            postLicense: {
                url: _apiUri + '/organizations/license',
                method: 'POST',
                headers: { 'Content-Type': undefined }
            },
            putLicense: {
                url: _apiUri + '/organizations/:id/license',
                method: 'POST',
                headers: { 'Content-Type': undefined }
            }
        });

        _service.organizationUsers = $resource(_apiUri + '/organizations/:orgId/users/:id', {}, {
            get: { method: 'GET', params: { id: '@id', orgId: '@orgId' } },
            list: { method: 'GET', params: { orgId: '@orgId' } },
            listGroups: { url: _apiUri + '/organizations/:orgId/users/:id/groups', method: 'GET', params: { id: '@id', orgId: '@orgId' }, isArray: true },
            invite: { url: _apiUri + '/organizations/:orgId/users/invite', method: 'POST', params: { orgId: '@orgId' } },
            reinvite: { url: _apiUri + '/organizations/:orgId/users/:id/reinvite', method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            accept: { url: _apiUri + '/organizations/:orgId/users/:id/accept', method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            confirm: { url: _apiUri + '/organizations/:orgId/users/:id/confirm', method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            put: { method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            putGroups: { url: _apiUri + '/organizations/:orgId/users/:id/groups', method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            del: { url: _apiUri + '/organizations/:orgId/users/:id/delete', method: 'POST', params: { id: '@id', orgId: '@orgId' } }
        });

        _service.collections = $resource(_apiUri + '/organizations/:orgId/collections/:id', {}, {
            get: { method: 'GET', params: { id: '@id', orgId: '@orgId' } },
            getDetails: { url: _apiUri + '/organizations/:orgId/collections/:id/details', method: 'GET', params: { id: '@id', orgId: '@orgId' } },
            listMe: { url: _apiUri + '/collections?writeOnly=:writeOnly', method: 'GET', params: { writeOnly: '@writeOnly' } },
            listOrganization: { method: 'GET', params: { orgId: '@orgId' } },
            listUsers: { url: _apiUri + '/organizations/:orgId/collections/:id/users', method: 'GET', params: { id: '@id', orgId: '@orgId' } },
            post: { method: 'POST', params: { orgId: '@orgId' } },
            put: { method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            del: { url: _apiUri + '/organizations/:orgId/collections/:id/delete', method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            delUser: { url: _apiUri + '/organizations/:orgId/collections/:id/delete-user/:orgUserId', method: 'POST', params: { id: '@id', orgId: '@orgId', orgUserId: '@orgUserId' } }
        });

        _service.groups = $resource(_apiUri + '/organizations/:orgId/groups/:id', {}, {
            get: { method: 'GET', params: { id: '@id', orgId: '@orgId' } },
            getDetails: { url: _apiUri + '/organizations/:orgId/groups/:id/details', method: 'GET', params: { id: '@id', orgId: '@orgId' } },
            listOrganization: { method: 'GET', params: { orgId: '@orgId' } },
            listUsers: { url: _apiUri + '/organizations/:orgId/groups/:id/users', method: 'GET', params: { id: '@id', orgId: '@orgId' } },
            post: { method: 'POST', params: { orgId: '@orgId' } },
            put: { method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            del: { url: _apiUri + '/organizations/:orgId/groups/:id/delete', method: 'POST', params: { id: '@id', orgId: '@orgId' } },
            delUser: { url: _apiUri + '/organizations/:orgId/groups/:id/delete-user/:orgUserId', method: 'POST', params: { id: '@id', orgId: '@orgId', orgUserId: '@orgUserId' } }
        });

        _service.accounts = $resource(_apiUri + '/accounts', {}, {
            register: { url: _apiUri + '/accounts/register', method: 'POST', params: {} },
            emailToken: { url: _apiUri + '/accounts/email-token', method: 'POST', params: {} },
            email: { url: _apiUri + '/accounts/email', method: 'POST', params: {} },
            verifyEmailToken: { url: _apiUri + '/accounts/verify-email-token', method: 'POST', params: {} },
            verifyEmail: { url: _apiUri + '/accounts/verify-email', method: 'POST', params: {} },
            postDeleteRecoverToken: { url: _apiUri + '/accounts/delete-recover-token', method: 'POST', params: {} },
            postDeleteRecover: { url: _apiUri + '/accounts/delete-recover', method: 'POST', params: {} },
            putPassword: { url: _apiUri + '/accounts/password', method: 'POST', params: {} },
            getProfile: { url: _apiUri + '/accounts/profile', method: 'GET', params: {} },
            putProfile: { url: _apiUri + '/accounts/profile', method: 'POST', params: {} },
            getDomains: { url: _apiUri + '/accounts/domains', method: 'GET', params: {} },
            putDomains: { url: _apiUri + '/accounts/domains', method: 'POST', params: {} },
            postPasswordHint: { url: _apiUri + '/accounts/password-hint', method: 'POST', params: {} },
            putSecurityStamp: { url: _apiUri + '/accounts/security-stamp', method: 'POST', params: {} },
            putKeys: { url: _apiUri + '/accounts/keys', method: 'POST', params: {} },
            putKey: { url: _apiUri + '/accounts/key', method: 'POST', params: {} },
            'import': { url: _apiUri + '/accounts/import', method: 'POST', params: {} },
            postDelete: { url: _apiUri + '/accounts/delete', method: 'POST', params: {} },
            putStorage: { url: _apiUri + '/accounts/storage', method: 'POST', params: {} },
            putPayment: { url: _apiUri + '/accounts/payment', method: 'POST', params: {} },
            putCancelPremium: { url: _apiUri + '/accounts/cancel-premium', method: 'POST', params: {} },
            putReinstatePremium: { url: _apiUri + '/accounts/reinstate-premium', method: 'POST', params: {} },
            getBilling: { url: _apiUri + '/accounts/billing', method: 'GET', params: {} },
            postPremium: {
                url: _apiUri + '/accounts/premium',
                method: 'POST',
                headers: { 'Content-Type': undefined }
            },
            putLicense: {
                url: _apiUri + '/accounts/license',
                method: 'POST',
                headers: { 'Content-Type': undefined }
            }
        });

        _service.twoFactor = $resource(_apiUri + '/two-factor', {}, {
            list: { method: 'GET', params: {} },
            getEmail: { url: _apiUri + '/two-factor/get-email', method: 'POST', params: {} },
            getU2f: { url: _apiUri + '/two-factor/get-u2f', method: 'POST', params: {} },
            getDuo: { url: _apiUri + '/two-factor/get-duo', method: 'POST', params: {} },
            getAuthenticator: { url: _apiUri + '/two-factor/get-authenticator', method: 'POST', params: {} },
            getYubi: { url: _apiUri + '/two-factor/get-yubikey', method: 'POST', params: {} },
            sendEmail: { url: _apiUri + '/two-factor/send-email', method: 'POST', params: {} },
            sendEmailLogin: { url: _apiUri + '/two-factor/send-email-login', method: 'POST', params: {} },
            putEmail: { url: _apiUri + '/two-factor/email', method: 'POST', params: {} },
            putU2f: { url: _apiUri + '/two-factor/u2f', method: 'POST', params: {} },
            putAuthenticator: { url: _apiUri + '/two-factor/authenticator', method: 'POST', params: {} },
            putDuo: { url: _apiUri + '/two-factor/duo', method: 'POST', params: {} },
            putYubi: { url: _apiUri + '/two-factor/yubikey', method: 'POST', params: {} },
            disable: { url: _apiUri + '/two-factor/disable', method: 'POST', params: {} },
            recover: { url: _apiUri + '/two-factor/recover', method: 'POST', params: {} },
            getRecover: { url: _apiUri + '/two-factor/get-recover', method: 'POST', params: {} }
        });

        _service.settings = $resource(_apiUri + '/settings', {}, {
            getDomains: { url: _apiUri + '/settings/domains', method: 'GET', params: {} },
            putDomains: { url: _apiUri + '/settings/domains', method: 'POST', params: {} },
        });

        _service.users = $resource(_apiUri + '/users/:id', {}, {
            getPublicKey: { url: _apiUri + '/users/:id/public-key', method: 'GET', params: { id: '@id' } }
        });

        _service.identity = $resource(_identityUri + '/connect', {}, {
            token: {
                url: _identityUri + '/connect/token',
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
                transformRequest: transformUrlEncoded,
                skipAuthorization: true,
                params: {}
            }
        });

        _service.hibp = $resource('https://haveibeenpwned.com/api/v2/breachedaccount/:email', {}, {
            get: { method: 'GET', params: { email: '@email' }, isArray: true },
        });

        function transformUrlEncoded(data) {
            return $httpParamSerializer(data);
        }

        return _service;
    });
