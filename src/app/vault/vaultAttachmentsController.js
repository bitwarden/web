angular
    .module('bit.vault')

    .controller('vaultAttachmentsController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService,
        loginId, $analytics, validationService) {
        $analytics.eventTrack('vaultAttachmentsController', { category: 'Modal' });
        $scope.login = {};
        $scope.readOnly = false;
        $scope.loading = true;

        apiService.logins.get({ id: loginId }, function (login) {
            $scope.login = cipherService.decryptLogin(login);
            $scope.readOnly = !login.Edit;
            $scope.loading = false;
        }, function () {
            $scope.loading = false;
        });

        $scope.save = function (form) {
            var files = document.getElementById('file').files;
            if (!files || !files.length) {
                validationService.addError(form, 'file', 'Select a file.', true);
                return;
            }

            var file = files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function (evt) {
                var key = null;
                var encFilename = cryptoService.encrypt(file.name, key);
                cryptoService.encryptToBytes(evt.target.result, key).then(function (encData) {
                    var fd = new FormData();
                    var blob = new Blob([encData], { type: 'application/octet-stream' });
                    fd.append('data', blob, encFilename);
                    return apiService.ciphers.postAttachment({ id: loginId }, fd).$promise;
                }).then(function (response) {
                    $analytics.eventTrack('Added Attachment');
                    $uibModalInstance.close({
                        action: 'attach',
                        data: $scope.login
                    });
                });
            };
            reader.onerror = function (evt) {
                validationService.addError(form, 'file', 'Error reading file.', true);
            };
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
