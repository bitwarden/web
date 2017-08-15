angular
    .module('bit.settings')

    .controller('settingsTwoStepAuthenticatorController', function ($scope, apiService, $uibModalInstance, cryptoService,
        authService, $q, toastr, $analytics, constants, $timeout) {
        $analytics.eventTrack('settingsTwoStepAuthenticatorController', { category: 'Modal' });
        var _issuer = 'bitwarden',
            _profile = null,
            _masterPasswordHash,
            _key = null;

        $timeout(function () {
            $("#masterPassword").focus();
        });

        $scope.auth = function (model) {
            var response = null;
            $scope.authPromise = cryptoService.hashPassword(model.masterPassword).then(function (hash) {
                _masterPasswordHash = hash;
                return apiService.twoFactor.getAuthenticator({}, {
                    masterPasswordHash: _masterPasswordHash
                }).$promise;
            }).then(function (apiResponse) {
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
            _key = response.Key;

            $scope.model = {
                key: formatString(_key),
                qr: 'https://chart.googleapis.com/chart?chs=123x123&chld=L|0&cht=qr&chl=otpauth://totp/' +
                _issuer + ':' + encodeURIComponent(_profile.email) +
                '%3Fsecret=' + encodeURIComponent(_key) +
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
                $scope.enabled = response.Enabled;
                $scope.close();
            }).$promise;
        }

        function update(model) {
            $scope.submitPromise = apiService.twoFactor.putAuthenticator({}, {
                token: model.token.replace(' ', ''),
                key: _key,
                masterPasswordHash: _masterPasswordHash
            }, function (response) {
                $analytics.eventTrack('Enabled Two-step Authenticator');
                processResponse(response);
                model.token = null;
            }).$promise;
        }

        var closing = false;
        $scope.close = function () {
            closing = true;
            $uibModalInstance.close($scope.enabled);
        };

        $scope.$on('modal.closing', function (e, reason, closed) {
            if (closing) {
                return;
            }

            e.preventDefault();
            $scope.close();
        });
    });
