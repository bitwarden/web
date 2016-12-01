angular
    .module('bit.accounts')

    .controller('accountsRecoverController', function ($scope, apiService, cryptoService) {
        $scope.success = false;

        $scope.submit = function (model) {
            var email = model.email.toLowerCase();
            var key = cryptoService.makeKey(model.masterPassword, email);

            var request = {
                email: email,
                masterPasswordHash: cryptoService.hashPassword(model.masterPassword, key),
                recoveryCode: model.code.replace(/\s/g, '').toLowerCase()
            };

            $scope.submitPromise = apiService.accounts.postTwoFactorRecover(request, function () {
                $scope.success = true;
            }).$promise;
        };
    });
