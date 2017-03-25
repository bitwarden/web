angular
    .module('bit.settings')

    .controller('settingsTwoFactorController', function ($scope, apiService, $uibModalInstance, cryptoService, authService, $q, toastr, $analytics) {
        $analytics.eventTrack('settingsTwoFactorController', { category: 'Modal' });
        var _issuer = 'bitwarden',
            _profile = null,
            _masterPasswordHash;

        authService.getUserProfile().then(function (profile) {
            _profile = profile;
            $scope.account = _profile.email;
            $scope.enabled = function () {
                return _profile.extended && _profile.extended.twoFactorEnabled;
            };
        });

        $scope.auth = function (model) {
            _masterPasswordHash = cryptoService.hashPassword(model.masterPassword);

            $scope.authPromise = apiService.accounts.getTwoFactor({
                masterPasswordHash: _masterPasswordHash,
                provider: 0 /* Only authenticator provider for now. */
            }, function (response) {
                processResponse(response);
            }).$promise;
        };

        function formatString(s) {
            if (!s) {
                return null;
            }

            return s.replace(/(.{4})/g, '$1 ').trim().toUpperCase();
        }

        function processResponse(response) {
            var key = response.AuthenticatorKey;
            $scope.twoFactorModel = {
                enabled: response.TwoFactorEnabled,
                key: formatString(key),
                recovery: formatString(response.TwoFactorRecoveryCode),
                qr: 'https://chart.googleapis.com/chart?chs=120x120&chld=L|0&cht=qr&chl=otpauth://totp/' +
                    _issuer + ':' + encodeURIComponent(_profile.email) +
                    '%3Fsecret=' + encodeURIComponent(key) +
                    '%26issuer=' + _issuer
            };
        }

        $scope.update = function (model) {
            var currentlyEnabled = $scope.twoFactorModel.enabled;
            if (currentlyEnabled && !confirm('Are you sure you want to disable two-step login?')) {
                return;
            }

            var request = {
                enabled: !currentlyEnabled,
                token: model.token.replace(' ', ''),
                masterPasswordHash: _masterPasswordHash
            };

            $scope.updatePromise = apiService.accounts.putTwoFactor({}, request, function (response) {
                if (response.TwoFactorEnabled) {
                    $analytics.eventTrack('Enabled Two-step Login');
                    toastr.success('Two-step login has been enabled.');
                    if (_profile.extended) _profile.extended.twoFactorEnabled = true;
                    processResponse(response);
                    $('#token').blur();
                    model.token = null;
                }
                else {
                    $analytics.eventTrack('Disabled Two-step Login');
                    toastr.success('Two-step login has been disabled.');
                    if (_profile.extended) _profile.extended.twoFactorEnabled = false;
                    $scope.close();
                }
            }).$promise;
        };

        $scope.print = function (printContent) {
            var w = window.open();
            w.document.write('<div style="font-size: 18px; text-align: center;"><p>bitwarden two-step login recovery code:</p>' +
                '<pre>' + printContent + '</pre>');
            w.print();
            w.close();
        };

        $scope.close = function () {
            $uibModalInstance.close(!_profile.extended ? null : _profile.extended.twoFactorEnabled);
        };
    });
