angular
    .module('bit.accounts')

    .controller('accountsRecoverController', function ($scope, apiService, cryptoService, $analytics) {
        $scope.success = false;

        $scope.submit = function (model) {
            var email = model.email.toLowerCase();

            $scope.submitPromise = cryptoService.makeKeyAndHash(model.email, model.masterPassword).then(function (result) {
                return apiService.twoFactor.recover({
                    email: email,
                    masterPasswordHash: result.hash,
                    recoveryCode: model.code.replace(/\s/g, '').toLowerCase()
                }).$promise;
            }).then(function () {
                $analytics.eventTrack('Recovered 2FA');
                $scope.success = true;
            });
        };
    });
