angular
    .module('bit.settings')

    .controller('settingsTwoStepController', function ($scope, apiService, toastr, $analytics, constants,
        $filter, $uibModal) {
        $scope.providers = constants.twoFactorProviderInfo;

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

        $scope.edit = function (provider) {
            if (provider.type === constants.twoFactorProvider.authenticator) {
                typeName = 'Authenticator';
            }
            else if (provider.type === constants.twoFactorProvider.email) {
                typeName = 'Email';
            }
            else if (provider.type === constants.twoFactorProvider.yubikey) {
                typeName = 'Yubi';
            }
            else if (provider.type === constants.twoFactorProvider.duo) {
                typeName = 'Duo';
            }
            else if (provider.type === constants.twoFactorProvider.u2f) {
                typeName = 'U2f';
            }
            else {
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsTwoStep' + typeName + '.html',
                controller: 'settingsTwoStep' + typeName + 'Controller',
                resolve: {
                    enabled: function () { return provider.enabled; }
                }
            });

            modal.result.then(function (enabled) {
                if (enabled || enabled === false) {
                    // do not adjust when undefined or null
                    provider.enabled = enabled;
                }
            });
        };

        $scope.viewRecover = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsTwoStepRecover.html',
                controller: 'settingsTwoStepRecoverController'
            });
        };
    });
