angular
    .module('bit.services')

    .factory('apiService', function ($resource, tokenService, appSettings) {
        var _service = {},
            _apiUri = appSettings.apiUri;

        _service.sites = $resource(_apiUri + '/sites/:id', {}, {
            get: { method: 'GET', params: { id: '@id' } },
            list: { method: 'GET', params: {} },
            post: { method: 'POST', params: {} },
            put: { method: 'PUT', params: { id: '@id' } },
            del: { method: 'DELETE', params: { id: '@id' } }
        });

        _service.folders = $resource(_apiUri + '/folders/:id', {}, {
            get: { method: 'GET', params: { id: '@id' } },
            list: { method: 'GET', params: {} },
            post: { method: 'POST', params: {} },
            put: { method: 'PUT', params: { id: '@id' } },
            del: { method: 'DELETE', params: { id: '@id' } }
        });

        _service.accounts = $resource(_apiUri + '/accounts', {}, {
            registerToken: { url: _apiUri + '/accounts/register-token', method: 'POST', params: {} },
            register: { url: _apiUri + '/accounts/register', method: 'POST', params: {} },
            emailToken: { url: _apiUri + '/accounts/email-token', method: 'POST', params: {} },
            email: { url: _apiUri + '/accounts/email', method: 'PUT', params: {} },
            putPassword: { url: _apiUri + '/accounts/password', method: 'PUT', params: {} },
            getProfile: { url: _apiUri + '/accounts/profile', method: 'GET', params: {} },
            putProfile: { url: _apiUri + '/accounts/profile', method: 'PUT', params: {} },
            getTwoFactor: { url: _apiUri + '/accounts/two-factor', method: 'GET', params: {} },
            putTwoFactor: { url: _apiUri + '/accounts/two-factor', method: 'PUT', params: {} },
            postPasswordHint: { url: _apiUri + '/accounts/password-hint', method: 'POST', params: {} },
            putSecurityStamp: { url: _apiUri + '/accounts/security-stamp', method: 'PUT', params: {} },
            'import': { url: _apiUri + '/accounts/import', method: 'POST', params: {} },
            postDelete: { url: _apiUri + '/accounts/delete', method: 'POST', params: {} }
        });

        _service.auth = $resource(_apiUri + '/auth', {}, {
            token: { url: _apiUri + '/auth/token', method: 'POST', params: {} },
            tokenTwoFactor: { url: _apiUri + '/auth/token/two-factor', method: 'POST', params: {} }
        });

        return _service;
    });
