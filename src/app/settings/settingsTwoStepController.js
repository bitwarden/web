angular
    .module('bit.settings')

    .controller('settingsTwoStepController', function ($scope, apiService, toastr, $analytics, constants,
        $filter, $uibModal, authService) {
        $scope.providers = $filter('filter')(constants.twoFactorProviderInfo, { organization: false });
        $scope.premium = true;

        authService.getUserProfile().then(function (profile) {
            $scope.premium = profile.premium;
            return apiService.twoFactor.list({}).$promise;
        }).then(function (response) {
            if (response.Data) {
                for (var i = 0; i < response.Data.length; i++) {
                    if (!response.Data[i].Enabled) {
                        continue;
                    }

                    var provider = $filter('filter')($scope.providers, { type: response.Data[i].Type });
                    if (provider.length) {
                        provider[0].enabled = true;
                    }
                }
            }

            return;
        });

        $scope.edit = function (provider) {
            if (!$scope.premium && !provider.free) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'app/views/premiumRequired.html',
                    controller: 'premiumRequiredController'
                });
                return;
            }

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
                    enabled: function () { return provider.enabled; },
                    orgId: function () { return null; }
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
