angular
    .module('bit.settings')

    .controller('settingsUpdateKeyController', function ($scope, $state, apiService, $uibModalInstance,
        cryptoService, authService, cipherService, validationService, toastr, $analytics) {
        $analytics.eventTrack('settingsUpdateKeyController', { category: 'Modal' });

        $scope.save = function (form) {
            var encKey = cryptoService.getEncKey();
            if (encKey) {
                validationService.addError(form, 'MasterPasswordHash',
                    'You do not need to update. You are already using the new encryption key.', true);
                return;
            }

            $scope.processing = true;
            $scope.savePromise = cryptoService.hashPassword($scope.masterPassword).then(function (hash) {
                return cipherService.updateKey(hash);
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                $analytics.eventTrack('Key Updated');
                return $state.go('frontend.login.info');
            }).then(function () {
                toastr.success('Please log back in. If you are using other bitwarden applications, ' +
                    'log out and back in to those as well.', 'Key Updated', { timeOut: 10000 });
            }, function () {
                $uibModalInstance.dismiss('cancel');
                toastr.error('Something went wrong.', 'Oh No!');
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
