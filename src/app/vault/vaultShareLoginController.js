angular
    .module('bit.vault')

    .controller('vaultShareLoginController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService,
        id, $analytics) {
        $analytics.eventTrack('vaultShareLoginController', { category: 'Modal' });

        apiService.logins.get({
            id: id
        }, function (login) {
            $scope.login = cipherService.decryptLogin(login);
        });

        $scope.enablePromise = null;
        $scope.enable = function () {
            var shareKey = cryptoService.makeShareKey();
            var encLogin = cipherService.encryptLogin($scope.login, shareKey);
            encLogin.key = cryptoService.rsaEncrypt(shareKey);

            $scope.enablePromise = apiService.logins.put({ id: $scope.login.id }, encLogin, function (login) {
                $scope.login = cipherService.decryptLogin(login);
            }).$promise;
        };

        $scope.sharePromise = null;
        $scope.share = function () {
            $uibModalInstance.close({});
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
