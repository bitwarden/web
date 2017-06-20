angular
    .module('bit.settings')

    .controller('settingsTwoStepAuthenticatorController', function ($scope, apiService, $uibModalInstance, cryptoService,
        authService, $q, toastr, $analytics, constants) {
        $analytics.eventTrack('settingsTwoStepAuthenticatorController', { category: 'Modal' });
        var _issuer = 'bitwarden',
            _profile = null,
            _masterPasswordHash;

        $scope.auth = function (model) {
            _masterPasswordHash = cryptoService.hashPassword(model.masterPassword);

            var response = null;
            $scope.authPromise = apiService.twoFactor.getAuthenticator({}, {
                masterPasswordHash: _masterPasswordHash
            }).$promise.then(function (apiResponse) {
                response = apiResponse;
                return authService.getUserProfile();
            }).then(function (profile) {
                _profile = profile;
                $scope.account = _profile.email;
                processResponse(response);
            });
        };

        function formatString(s) {
            if (!s) {
                return null;
            }

            return s.replace(/(.{4})/g, '$1 ').trim().toUpperCase();
        }

        function processResponse(response) {
            $scope.enabled = response.Enabled;

            $scope.model = {
                key: formatString(response.Key),
                qr: 'https://chart.googleapis.com/chart?chs=120x120&chld=L|0&cht=qr&chl=otpauth://totp/' +
                _issuer + ':' + encodeURIComponent(_profile.email) +
                '%3Fsecret=' + encodeURIComponent(response.Key) +
                '%26issuer=' + _issuer
            };
            $scope.updateModel = {
                token: null
            };
        }

        $scope.submit = function (model) {
            if (!model || !model.token) {
                disable();
                return;
            }

            update(model);
        };

        function disable() {
            if (!confirm('Are you sure you want to disable the authenticator app provider?')) {
                return;
            }

            $scope.submitPromise = apiService.twoFactor.disable({}, {
                masterPasswordHash: _masterPasswordHash,
                type: constants.twoFactorProvider.authenticator
            }, function (response) {
                $analytics.eventTrack('Disabled Two-step Authenticator');
                toastr.success('Authenticator app has been disabled.');
                $scope.close();
            }).$promise;
        }

        function update(model) {
            $scope.submitPromise = apiService.twoFactor.putAuthenticator({}, {
                token: model.token.replace(' ', ''),
                masterPasswordHash: _masterPasswordHash
            }, function (response) {
                $analytics.eventTrack('Enabled Two-step Authenticator');
                processResponse(response);
                model.token = null;
            }).$promise;
        }

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });
