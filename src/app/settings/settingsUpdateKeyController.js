angular
    .module('bit.settings')

    .controller('settingsUpdateKeyController', function ($scope, $state, apiService, $uibModalInstance, cipherService,
        cryptoService, authService, validationService, toastr, $analytics, $q) {
        $analytics.eventTrack('settingsUpdateKeyController', { category: 'Modal' });

        $scope.save = function (form) {
            var encKey = cryptoService.getEncKey();
            if (encKey) {
                validationService.addError(form, 'MasterPasswordHash',
                    'You do not need to update. You are already using the new encryption key.', true);
                return;
            }

            $scope.savePromise = cryptoService.hashPassword($scope.masterPassword).then(function (hash) {
                return updateKey(hash);
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                $analytics.eventTrack('Key Updated');
                return $state.go('frontend.login.info');
            }, function (e) {
                throw e ? e : 'Error occurred.';
            }).then(function () {
                toastr.success('Please log back in. If you are using other bitwarden applications, ' +
                    'log out and back in to those as well.', 'Key Updated', { timeOut: 10000 });
            });
        };

        function updateKey(masterPasswordHash) {
            var madeEncKey = cryptoService.makeEncKey(null);

            var reencryptedLogins = [];
            var loginsPromise = apiService.ciphers.list({}, function (encryptedLogins) {
                var filteredEncryptedLogins = [];
                for (var i = 0; i < encryptedLogins.Data.length; i++) {
                    if (encryptedLogins.Data[i].OrganizationId) {
                        continue;
                    }

                    filteredEncryptedLogins.push(encryptedLogins.Data[i]);
                }

                var unencryptedLogins = cipherService.decryptLogins(filteredEncryptedLogins);
                reencryptedLogins = cipherService.encryptLogins(unencryptedLogins, madeEncKey.encKey);
            }).$promise;

            var reencryptedFolders = [];
            var foldersPromise = apiService.folders.list({}, function (encryptedFolders) {
                var unencryptedFolders = cipherService.decryptFolders(encryptedFolders.Data);
                reencryptedFolders = cipherService.encryptFolders(unencryptedFolders, madeEncKey.encKey);
            }).$promise;

            var privateKey = cryptoService.getPrivateKey('raw'),
                reencryptedPrivateKey = null;
            if (privateKey) {
                reencryptedPrivateKey = cryptoService.encrypt(privateKey, madeEncKey.encKey, 'raw');
            }

            return $q.all([loginsPromise, foldersPromise]).then(function () {
                var request = {
                    masterPasswordHash: masterPasswordHash,
                    ciphers: reencryptedLogins,
                    folders: reencryptedFolders,
                    privateKey: reencryptedPrivateKey,
                    key: madeEncKey.encKeyEnc
                };

                return apiService.accounts.putKey(request).$promise;
            }, function () {
                throw 'Error while encrypting data.';
            }).then(function () {
                cryptoService.setEncKey(madeEncKey.encKey, null, true);
            });
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
