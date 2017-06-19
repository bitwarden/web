angular
    .module('bit.settings')

    .controller('settingsTwoStepController', function ($scope, apiService, authService, toastr, $analytics, constants,
        $filter) {
        $scope.providers = [
            {
                type: constants.twoFactorProvider.authenticator,
                name: 'Authenticator App',
                description: 'Use auth app.',
                enabled: false,
                free: true
            },
            {
                type: constants.twoFactorProvider.yubikey,
                name: 'YubiKey OTP',
                description: '',
                enabled: false
            },
            {
                type: constants.twoFactorProvider.duo,
                name: 'Duo',
                description: '',
                enabled: false
            },
            {
                type: constants.twoFactorProvider.u2f,
                name: 'FIDO U2F Security Key',
                description: '',
                enabled: false
            },
            {
                type: constants.twoFactorProvider.email,
                name: 'Email',
                description: '',
                enabled: false
            }
        ];

        apiService.twoFactor.list({}, function (response) {
            for (var i = 0; i < response.Data.length; i++) {
                if (!response.Data[i].Enabled) {
                    continue;
                }

                var provider = $filter('filter')($scope.providers, { type: response.Data[i].Type });
                if (provider.length) {
                    provider[0].enabled = true;
                }
            }
        });

        authService.getUserProfile().then(function (profile) {
            _profile = profile;
        });
    });
