angular
    .module('bit.accounts')

    .controller('accountsTwoFactorMethodsController', function ($scope, $uibModalInstance, $analytics, providers, constants) {
        $analytics.eventTrack('accountsTwoFactorMethodsController', { category: 'Modal' });

        $scope.providers = [];

        if (providers.hasOwnProperty(constants.twoFactorProvider.authenticator)) {
            $scope.providers.push({
                id: constants.twoFactorProvider.authenticator,
                name: 'Authenticator App'
            });
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.yubikey)) {
            $scope.providers.push({
                id: constants.twoFactorProvider.yubikey,
                name: 'YubiKey'
            });
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.email)) {
            $scope.providers.push({
                id: constants.twoFactorProvider.email,
                name: 'Email'
            });
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.duo)) {
            $scope.providers.push({
                id: constants.twoFactorProvider.duo,
                name: 'Duo'
            });
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.u2f)) {
            $scope.providers.push({
                id: constants.twoFactorProvider.u2f,
                name: 'FIDO U2F Security Key'
            });
        }

        $scope.choose = function (provider) {
            $uibModalInstance.close(provider.id);
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };
    });
