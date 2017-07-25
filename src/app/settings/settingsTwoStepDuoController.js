angular
    .module('bit.settings')

    .controller('settingsTwoStepDuoController', function ($scope, apiService, $uibModalInstance, cryptoService,
        toastr, $analytics, constants, $timeout) {
        $analytics.eventTrack('settingsTwoStepDuoController', { category: 'Modal' });
        var _masterPasswordHash;

        $scope.updateModel = {
            token: null,
            host: null,
            ikey: null,
            skey: null
        };

        $timeout(function () {
            $("#masterPassword").focus();
        });

        $scope.auth = function (model) {
            $scope.authPromise = cryptoService.hashPassword(model.masterPassword).then(function (hash) {
                _masterPasswordHash = hash;
                return apiService.twoFactor.getDuo({}, {
                    masterPasswordHash: _masterPasswordHash
                }).$promise;
            }).then(function (apiResponse) {
                processResult(apiResponse);
                $scope.authed = true;
            });
        };

        $scope.submit = function (model) {
            if ($scope.enabled) {
                disable();
                return;
            }

            update(model);
        };

        function disable() {
            if (!confirm('Are you sure you want to disable the Duo provider?')) {
                return;
            }

            $scope.submitPromise = apiService.twoFactor.disable({}, {
                masterPasswordHash: _masterPasswordHash,
                type: constants.twoFactorProvider.duo
            }, function (response) {
                $analytics.eventTrack('Disabled Two-step Duo');
                toastr.success('Duo has been disabled.');
                $scope.enabled = response.Enabled;
                $scope.close();
            }).$promise;
        }

        function update(model) {
            $scope.submitPromise = apiService.twoFactor.putDuo({}, {
                integrationKey: model.ikey,
                secretKey: model.skey,
                host: model.host,
                masterPasswordHash: _masterPasswordHash
            }, function (response) {
                $analytics.eventTrack('Enabled Two-step Duo');
                processResult(response);
            }).$promise;
        }

        function processResult(response) {
            $scope.enabled = response.Enabled;
            $scope.updateModel = {
                ikey: response.IntegrationKey,
                skey: response.SecretKey,
                host: response.Host
            };
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
