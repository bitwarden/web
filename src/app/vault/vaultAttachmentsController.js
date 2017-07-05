angular
    .module('bit.vault')

    .controller('vaultAttachmentsController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService,
        loginId, $analytics, validationService, toastr) {
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
            if (file.size > 104857600) { // 100 MB
                validationService.addError(form, 'file', 'Maximum file size is 100 MB.', true);
                return;
            }

            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function (evt) {
                form.$loading = true;
                $scope.$apply();

                var key = getKeyForLogin();

                var encFilename = cryptoService.encrypt(file.name, key);
                $scope.savePromise = cryptoService.encryptToBytes(evt.target.result, key).then(function (encData) {
                    var fd = new FormData();
                    var blob = new Blob([encData], { type: 'application/octet-stream' });
                    fd.append('data', blob, encFilename);
                    return apiService.ciphers.postAttachment({ id: loginId }, fd).$promise;
                }).then(function (response) {
                    $analytics.eventTrack('Added Attachment');
                    toastr.success('The attachment has been added.');
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

        $scope.download = function (attachment) {
            attachment.loading = true;
            var key = getKeyForLogin();

            var req = new XMLHttpRequest();
            req.open('GET', attachment.url, true);
            req.responseType = 'arraybuffer';
            req.onload = function (evt) {
                if (!req.response) {
                    attachment.loading = false;
                    $scope.$apply();

                    // error
                    return;
                }

                cryptoService.decryptFromBytes(req.response, key).then(function (decBuf) {
                    var blob = new Blob([decBuf]);

                    // IE hack. ref http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveBlob(blob, attachment.fileName);
                    }
                    else {
                        var a = window.document.createElement('a');
                        a.href = window.URL.createObjectURL(blob);
                        a.download = attachment.fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }

                    attachment.loading = false;
                    $scope.$apply();
                });
            };
            req.send(null);
        };

        function getKeyForLogin() {
            if ($scope.login.organizationId) {
                return cryptoService.getOrgKey($scope.login.organizationId);
            }

            return null;
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
