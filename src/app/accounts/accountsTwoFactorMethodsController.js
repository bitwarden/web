angular
    .module('bit.accounts')

    .controller('accountsTwoFactorMethodsController', function ($scope, $uibModalInstance, $analytics, providers, constants) {
        $analytics.eventTrack('accountsTwoFactorMethodsController', { category: 'Modal' });

        $scope.providers = [];

        if (providers.hasOwnProperty(constants.twoFactorProvider.authenticator)) {
            add(constants.twoFactorProvider.authenticator);
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.yubikey)) {
            add(constants.twoFactorProvider.yubikey);
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.email)) {
            add(constants.twoFactorProvider.email);
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.duo)) {
            add(constants.twoFactorProvider.duo);
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.u2f) && u2f.isSupported) {
            add(constants.twoFactorProvider.u2f);
        }

        $scope.choose = function (provider) {
            $uibModalInstance.close(provider.type);
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };

        function add(type) {
            for (var i = 0; i < constants.twoFactorProviderInfo.length; i++) {
                if (constants.twoFactorProviderInfo[i].type === type) {
                    $scope.providers.push(constants.twoFactorProviderInfo[i]);
                }
            }
        }
    });
