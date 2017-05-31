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

            var encKey = cryptoService.getEncKey();
            if (encKey) {
                $scope.savePromise = changePassword(model);
            }
            else {
                // User is not using an enc key, let's make them one
                $scope.savePromise = updateKey(model);
            }
        };

        function updateKey(model) {
            var madeEncKey = cryptoService.makeEncKey(null);
            encKey = madeEncKey.encKey;
            var encKeyEnc = madeEncKey.encKeyEnc;

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
                reencryptedLogins = cipherService.encryptLogins(unencryptedLogins, encKey);
            }).$promise;

            var reencryptedFolders = [];
            var foldersPromise = apiService.folders.list({}, function (encryptedFolders) {
                var unencryptedFolders = cipherService.decryptFolders(encryptedFolders.Data);
                reencryptedFolders = cipherService.encryptFolders(unencryptedFolders, encKey);
            }).$promise;

            var privateKey = cryptoService.getPrivateKey('raw'),
                reencryptedPrivateKey = null;
            if (privateKey) {
                reencryptedPrivateKey = cryptoService.encrypt(privateKey, encKey, 'raw');
            }

            return $q.all([loginsPromise, foldersPromise]).then(function () {
                var request = {
                    masterPasswordHash: cryptoService.hashPassword(model.masterPassword),
                    ciphers: reencryptedLogins,
                    folders: reencryptedFolders,
                    privateKey: reencryptedPrivateKey,
                    key: encKeyEnc
                };

                return apiService.accounts.putKey(request).$promise;
            }, error).then(function () {
                cryptoService.setEncKey(encKey, null, true);
                return changePassword(model);
            }, function () {
                cryptoService.clearEncKey();
                error();
            });
        }

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
            }, error).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                $analytics.eventTrack('Changed Password');
                $state.go('frontend.login.info').then(function () {
                    toastr.success('Please log back in.', 'Master Password Changed');
                });
            }, error);
        }

        function error() {
            $uibModalInstance.dismiss('cancel');
            toastr.error('Something went wrong.', 'Oh No!');
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
