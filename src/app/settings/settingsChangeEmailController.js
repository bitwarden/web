angular
    .module('bit.settings')

    .controller('settingsChangeEmailController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        cipherService, authService, $q, toastr, $analytics) {
        $analytics.eventTrack('settingsChangeEmailController', { category: 'Modal' });
        var _masterPasswordHash,
            _newMasterPasswordHash,
            _newKey;

        $scope.token = function (model) {
            _masterPasswordHash = cryptoService.hashPassword(model.masterPassword);
            var newEmail = model.newEmail.toLowerCase();

            var request = {
                newEmail: newEmail,
                masterPasswordHash: _masterPasswordHash
            };

            $scope.tokenPromise = apiService.accounts.emailToken(request, function () {
                _newKey = cryptoService.makeKey(model.masterPassword, newEmail);
                _newMasterPasswordHash = cryptoService.hashPassword(model.masterPassword, _newKey);

                $scope.tokenSent = true;
            }).$promise;
        };

        $scope.confirm = function (model) {
            $scope.processing = true;

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
                reencryptedLogins = cipherService.encryptLogins(unencryptedLogins, _newKey);
            }).$promise;

            var reencryptedFolders = [];
            var foldersPromise = apiService.folders.list({}, function (encryptedFolders) {
                var unencryptedFolders = cipherService.decryptFolders(encryptedFolders.Data);
                reencryptedFolders = cipherService.encryptFolders(unencryptedFolders, _newKey);
            }).$promise;

            var privateKey = cryptoService.getPrivateKey('raw'),
                reencryptedPrivateKey = null;
            if (privateKey) {
                reencryptedPrivateKey = cryptoService.encrypt(privateKey, _newKey, 'raw');
            }

            $q.all([loginsPromise, foldersPromise]).then(function () {
                var request = {
                    token: model.token,
                    newEmail: model.newEmail.toLowerCase(),
                    masterPasswordHash: _masterPasswordHash,
                    newMasterPasswordHash: _newMasterPasswordHash,
                    data: {
                        ciphers: reencryptedLogins,
                        folders: reencryptedFolders,
                        privateKey: reencryptedPrivateKey
                    }
                };

                $scope.confirmPromise = apiService.accounts.email(request, function () {
                    $uibModalInstance.dismiss('cancel');
                    $analytics.eventTrack('Changed Email');
                    authService.logOut();
                    $state.go('frontend.login.info').then(function () {
                        toastr.success('Please log back in.', 'Email Changed');
                    });
                }, function () {
                    $uibModalInstance.dismiss('cancel');
                    toastr.error('Something went wrong.', 'Oh No!');
                }).$promise;
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
