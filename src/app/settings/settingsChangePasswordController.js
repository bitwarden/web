angular
    .module('bit.settings')

    .controller('settingsChangePasswordController', function ($scope, $state, apiService, $uibModalInstance,
        cryptoService, authService, cipherService, validationService, toastr, $analytics) {
        $analytics.eventTrack('settingsChangePasswordController', { category: 'Modal' });

        $scope.save = function (model, form) {
            var error = false;

            if ($scope.model.newMasterPassword.length < 8) {
                validationService.addError(form, 'NewMasterPasswordHash',
                    'Master password must be at least 8 characters long.', true);
                error = true;
            }
            if ($scope.model.newMasterPassword !== $scope.model.confirmNewMasterPassword) {
                validationService.addError(form, 'ConfirmNewMasterPasswordHash',
                    'New master password confirmation does not match.', true);
                error = true;
            }

            if (error) {
                return;
            }

            $scope.processing = true;

            var encKey = cryptoService.getEncKey();
            if (encKey) {
                $scope.savePromise = changePassword(model);
            }
            else {
                // User is not using an enc key, let's make them one
                var mpHash = cryptoService.hashPassword(model.masterPassword);
                $scope.savePromise = cipherService.updateKey(mpHash, function () {
                    return changePassword(model);
                }, processError);
            }
        };

        function changePassword(model) {
            return authService.getUserProfile().then(function (profile) {
                var newKey = cryptoService.makeKey(model.newMasterPassword, profile.email.toLowerCase());
                var encKey = cryptoService.getEncKey();
                var newEncKey = cryptoService.encrypt(encKey.key, newKey, 'raw');

                var request = {
                    masterPasswordHash: cryptoService.hashPassword(model.masterPassword),
                    newMasterPasswordHash: cryptoService.hashPassword(model.newMasterPassword, newKey),
                    key: newEncKey
                };

                return apiService.accounts.putPassword(request).$promise;
            }, processError).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                $analytics.eventTrack('Changed Password');
                return $state.go('frontend.login.info');
            }, processError).then(function () {
                toastr.success('Please log back in.', 'Master Password Changed');
            }, processError);
        }

        function processError() {
            $uibModalInstance.dismiss('cancel');
            toastr.error('Something went wrong.', 'Oh No!');
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
