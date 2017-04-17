angular
    .module('bit.settings')

    .controller('settingsChangePasswordController', function ($scope, $state, apiService, $uibModalInstance,
        cryptoService, authService, cipherService, validationService, $q, toastr, $analytics) {
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

            authService.getUserProfile().then(function (profile) {
                return cryptoService.makeKey(model.newMasterPassword, profile.email.toLowerCase());
            }).then(function (newKey) {
                var reencryptedLogins = [];
                var loginsPromise = apiService.logins.list({}, function (encryptedLogins) {
                    var filteredEncryptedLogins = [];
                    for (var i = 0; i < encryptedLogins.Data.length; i++) {
                        if (encryptedLogins.Data[i].OrganizationId) {
                            continue;
                        }

                        filteredEncryptedLogins.push(encryptedLogins.Data[i]);
                    }

                    var unencryptedLogins = cipherService.decryptLogins(filteredEncryptedLogins);
                    reencryptedLogins = cipherService.encryptLogins(unencryptedLogins, newKey);
                }).$promise;

                var reencryptedFolders = [];
                var foldersPromise = apiService.folders.list({}, function (encryptedFolders) {
                    var unencryptedFolders = cipherService.decryptFolders(encryptedFolders.Data);
                    reencryptedFolders = cipherService.encryptFolders(unencryptedFolders, newKey);
                }).$promise;

                var privateKey = cryptoService.getPrivateKey('raw'),
                    reencryptedPrivateKey = null;
                if (privateKey) {
                    reencryptedPrivateKey = cryptoService.encrypt(privateKey, newKey, 'raw');
                }

                $q.all([loginsPromise, foldersPromise]).then(function () {
                    var request = {
                        masterPasswordHash: cryptoService.hashPassword(model.masterPassword),
                        newMasterPasswordHash: cryptoService.hashPassword(model.newMasterPassword, newKey),
                        data: {
                            ciphers: reencryptedLogins,
                            folders: reencryptedFolders,
                            privateKey: reencryptedPrivateKey
                        }
                    };

                    $scope.savePromise = apiService.accounts.putPassword(request, function () {
                        $uibModalInstance.dismiss('cancel');
                        authService.logOut();
                        $analytics.eventTrack('Changed Password');
                        $state.go('frontend.login.info').then(function () {
                            toastr.success('Please log back in.', 'Master Password Changed');
                        });
                    }, function () {
                        $uibModalInstance.dismiss('cancel');
                        toastr.error('Something went wrong.', 'Oh No!');
                    }).$promise;
                });

            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
