angular
    .module('bit.settings')

    .controller('settingsTwoFactorController', function ($scope, apiService, $uibModalInstance, cryptoService, authService, $q, toastr) {
        var _issuer = 'bitwarden',
            _profile = authService.getUserProfile(),
            _masterPasswordHash;

        $scope.account = _profile.email;
        $scope.enabled = function () {
            return _profile.extended && _profile.extended.twoFactorEnabled;
        };

        $scope.auth = function (model) {
            _masterPasswordHash = cryptoService.hashPassword(model.masterPassword);

            $scope.authPromise = apiService.accounts.getTwoFactor({
                masterPasswordHash: _masterPasswordHash,
                provider: 0 /* Only authenticator provider for now. */
            }, function (response) {
                var key = response.AuthenticatorKey;
                $scope.twoFactorModel = {
                    enabled: response.TwoFactorEnabled,
                    key: key.replace(/(.{4})/g, '$1 ').trim(),
                    qr: 'https://chart.googleapis.com/chart?chs=120x120&chld=L|0&cht=qr&chl=otpauth://totp/' +
                        _issuer + ':' + encodeURIComponent(_profile.email) +
                        '%3Fsecret=' + encodeURIComponent(key) +
                        '%26issuer=' + _issuer
                };
            }).$promise;
        };

        $scope.update = function (model) {
            var currentlyEnabled = $scope.twoFactorModel.enabled;
            if (currentlyEnabled && !confirm('Are you sure you want to disable two-step login?')) {
                return;
            }

            var request = {
                enabled: !currentlyEnabled,
                token: model ? model.token : null,
                masterPasswordHash: _masterPasswordHash,
            };

            $scope.updatePromise = apiService.accounts.putTwoFactor({}, request, function (response) {
                if (response.TwoFactorEnabled) {
                    toastr.success('Two-step login has been enabled.');
                    if (_profile.extended) _profile.extended.twoFactorEnabled = true;
                }
                else {
                    toastr.success('Two-step login has been disabled.');
                    if (_profile.extended) _profile.extended.twoFactorEnabled = false;
                }

                $scope.close();
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
