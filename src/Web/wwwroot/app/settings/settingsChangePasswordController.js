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

            var profile = authService.getUserProfile();
            var newKey = cryptoService.makeKey(model.newMasterPassword, profile.email);

            var reencryptedSites = [];
            var sitesPromise = apiService.sites.list({ dirty: false }, function (encryptedSites) {
                var unencryptedSites = cipherService.decryptSites(encryptedSites.Data);
                reencryptedSites = cipherService.encryptSites(unencryptedSites, newKey);
            }).$promise;

            var reencryptedFolders = [];
            var foldersPromise = apiService.folders.list({ dirty: false }, function (encryptedFolders) {
                var unencryptedFolders = cipherService.decryptFolders(encryptedFolders.Data);
                reencryptedFolders = cipherService.encryptFolders(unencryptedFolders, newKey);
            }).$promise;

            $q.all([sitesPromise, foldersPromise]).then(function () {
                var request = {
                    masterPasswordHash: cryptoService.hashPassword(model.masterPassword),
                    newMasterPasswordHash: cryptoService.hashPassword(model.newMasterPassword, newKey),
                    ciphers: reencryptedSites.concat(reencryptedFolders)
                };

                $scope.savePromise = apiService.accounts.putPassword(request, function () {
                    $uibModalInstance.dismiss('cancel');
                    authService.logOut();
                    $analytics.eventTrack('Changed Password');
                    $state.go('frontend.login.info').then(function () {
                        toastr.success('Please log back in.', 'Master Password Changed');
                    });
                }, function () {
                    // TODO: recovery mode
                    $uibModalInstance.dismiss('cancel');
                    toastr.error('Something went wrong.', 'Oh No!');
                }).$promise;
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
