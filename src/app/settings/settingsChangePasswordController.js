angular
    .module('bit.settings')

    .controller('settingsChangePasswordController', function ($scope, $state, apiService, $uibModalInstance,
        cryptoService, authService, validationService, toastr, $analytics) {
        $analytics.eventTrack('settingsChangePasswordController', { category: 'Modal' });

        $scope.save = function (model, form) {
            var error = false;

            var encKey = cryptoService.getEncKey();
            if (!encKey) {
                validationService.addError(form, null,
                    'You cannot change your master password until you update your encryption key.', true);
                error = true;
            }

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

            var makeResult;
            $scope.savePromise = authService.getUserProfile().then(function (profile) {
                return cryptoService.makeKeyAndHash(profile.email, model.newMasterPassword);
            }).then(function (result) {
                makeResult = result;
                return cryptoService.hashPassword(model.masterPassword);
            }).then(function (hash) {
                var encKey = cryptoService.getEncKey();
                var newEncKey = cryptoService.encrypt(encKey.key, makeResult.key, 'raw');

                var request = {
                    masterPasswordHash: hash,
                    newMasterPasswordHash: makeResult.hash,
                    key: newEncKey
                };

                return apiService.accounts.putPassword(request).$promise;
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                $analytics.eventTrack('Changed Password');
                return $state.go('frontend.login.info');
            }).then(function () {
                toastr.success('Please log back in.', 'Master Password Changed');
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
