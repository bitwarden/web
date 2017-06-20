angular
    .module('bit.settings')

    .controller('settingsTwoStepYubiController', function ($scope, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics, constants) {
        $analytics.eventTrack('settingsTwoStepYubiController', { category: 'Modal' });
        var _profile = null,
            _masterPasswordHash;

        $scope.auth = function (model) {
            _masterPasswordHash = cryptoService.hashPassword(model.masterPassword);

            var response = null;
            $scope.authPromise = apiService.twoFactor.getYubi({}, {
                masterPasswordHash: _masterPasswordHash
            }).$promise.then(function (apiResponse) {
                response = apiResponse;
                return authService.getUserProfile();
            }).then(function (profile) {
                _profile = profile;
                processResult(response);
                $scope.authed = true;
            });
        };

        $scope.remove = function (model) {
            model.key = null;
            model.existingKey = null;
        };

        $scope.submit = function (model) {
            $scope.submitPromise = apiService.twoFactor.putYubi({}, {
                key1: model.key1.key,
                key2: model.key2.key,
                key3: model.key3.key,
                key4: model.key4.key,
                key5: model.key5.key,
                masterPasswordHash: _masterPasswordHash
            }, function (response) {
                $analytics.eventTrack('Saved Two-step YubiKey');
                toastr.success('YubiKey saved.');
                processResult(response);
            }).$promise;
        };

        $scope.disable = function () {
            if (!confirm('Are you sure you want to disable the YubiKey provider?')) {
                return;
            }

            $scope.disableLoading = true;
            $scope.submitPromise = apiService.twoFactor.disable({}, {
                masterPasswordHash: _masterPasswordHash,
                type: constants.twoFactorProvider.yubikey
            }, function (response) {
                $scope.disableLoading = false;
                $analytics.eventTrack('Disabled Two-step YubiKey');
                toastr.success('YubiKey has been disabled.');
                $scope.close();
            }, function (response) {
                toastr.error('Failed to disable.');
                $scope.disableLoading = false;
            }).$promise;
        }

        function processResult(response) {
            $scope.enabled = response.Enabled;
            $scope.updateModel = {
                key1: {
                    key: response.Key1,
                    existingKey: padRight(response.Key1, '*', 44)
                },
                key2: {
                    key: response.Key2,
                    existingKey: padRight(response.Key2, '*', 44)
                },
                key3: {
                    key: response.Key3,
                    existingKey: padRight(response.Key3, '*', 44)
                },
                key4: {
                    key: response.Key4,
                    existingKey: padRight(response.Key4, '*', 44)
                },
                key5: {
                    key: response.Key5,
                    existingKey: padRight(response.Key5, '*', 44)
                }
            };
        }

        function padRight(str, character, size) {
            if (!str || !character || str.length >= size) {
                return str;
            }

            var max = (size - str.length) / character.length;
            for (var i = 0; i < max; i++) {
                str += character;
            }
            return str;
        }

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });
