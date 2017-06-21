angular
    .module('bit.settings')

    .controller('settingsTwoStepEmailController', function ($scope, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics, constants) {
        $analytics.eventTrack('settingsTwoStepEmailController', { category: 'Modal' });
        var _profile = null,
            _masterPasswordHash;

        $scope.updateModel = {
            token: null,
            email: null
        };

        $scope.auth = function (model) {
            _masterPasswordHash = cryptoService.hashPassword(model.masterPassword);

            var response = null;
            $scope.authPromise = apiService.twoFactor.getEmail({}, {
                masterPasswordHash: _masterPasswordHash
            }).$promise.then(function (apiResponse) {
                response = apiResponse;
                return authService.getUserProfile();
            }).then(function (profile) {
                _profile = profile;
                $scope.enabled = response.Enabled;
                $scope.updateModel.email = $scope.enabled ? response.Email : _profile.email;
                $scope.authed = true;
            });
        };

        $scope.sendEmail = function (model) {
            $scope.emailError = false;
            $scope.emailSuccess = false;

            if (!model || !model.email || model.email.indexOf('@') < 0) {
                $scope.emailError = true;
                $scope.emailSuccess = false;
                return;
            }

            $scope.emailLoading = true;
            apiService.twoFactor.sendEmail({}, {
                masterPasswordHash: _masterPasswordHash,
                email: model.email
            }, function (response) {
                $scope.emailError = false;
                $scope.emailSuccess = true;
                $scope.emailLoading = false;
            }, function (response) {
                $scope.emailError = true;
                $scope.emailSuccess = false;
                $scope.emailLoading = false;
            });
        };

        $scope.submit = function (model) {
            if (!model || !model.token) {
                disable();
                return;
            }

            update(model);
        };

        function disable() {
            if (!confirm('Are you sure you want to disable the email provider?')) {
                return;
            }

            $scope.submitPromise = apiService.twoFactor.disable({}, {
                masterPasswordHash: _masterPasswordHash,
                type: constants.twoFactorProvider.email
            }, function (response) {
                $analytics.eventTrack('Disabled Two-step Email');
                toastr.success('Email has been disabled.');
                $scope.enabled = response.Enabled;
                $scope.close();
            }).$promise;
        }

        function update(model) {
            $scope.submitPromise = apiService.twoFactor.putEmail({}, {
                email: model.email.toLowerCase().trim(),
                token: model.token.replace(' ', ''),
                masterPasswordHash: _masterPasswordHash
            }, function (response) {
                $analytics.eventTrack('Enabled Two-step Email');
                $scope.enabled = response.Enabled;
                model.email = response.Email;
                model.token = null;
            }).$promise;
        }

        $scope.close = function () {
            $uibModalInstance.close($scope.enabled);
        };
    });
