angular
    .module('bit.organization')

    .controller('organizationVaultAttachmentsController', function ($scope, apiService, $uibModalInstance, cryptoService,
        cipherService, loginId, $analytics, validationService, toastr) {
        $analytics.eventTrack('organizationVaultAttachmentsController', { category: 'Modal' });
        $scope.login = {};
        $scope.loading = true;
        var closing = false;

        apiService.logins.getAdmin({ id: loginId }, function (login) {
            $scope.login = cipherService.decryptLogin(login);
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

                var key = cryptoService.getOrgKey($scope.login.organizationId);
                var encFilename = cryptoService.encrypt(file.name, key);
                $scope.savePromise = cryptoService.encryptToBytes(evt.target.result, key).then(function (encData) {
                    var fd = new FormData();
                    var blob = new Blob([encData], { type: 'application/octet-stream' });
                    fd.append('data', blob, encFilename);
                    return apiService.ciphers.postAttachment({ id: loginId }, fd).$promise;
                }).then(function (response) {
                    $analytics.eventTrack('Added Organization Attachment');
                    toastr.success('The attachment has been added.');
                    closing = true;
                    $uibModalInstance.close(true);
                });
            };
            reader.onerror = function (evt) {
                validationService.addError(form, 'file', 'Error reading file.', true);
            };
        }

        $scope.download = function (attachment) {
            attachment.loading = true;

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

                var key = cryptoService.getOrgKey($scope.login.organizationId);
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

        $scope.remove = function (attachment) {
            if (!confirm('Are you sure you want to delete this attachment (' + attachment.fileName + ')?')) {
                return;
            }

            attachment.loading = true;
            apiService.ciphers.delAttachment({ id: loginId, attachmentId: attachment.id }).$promise.then(function () {
                attachment.loading = false;
                $analytics.eventTrack('Deleted Organization Attachment');
                var index = $scope.login.attachments.indexOf(attachment);
                if (index > -1) {
                    $scope.login.attachments.splice(index, 1);
                }
            }, function () {
                toastr.error('Cannot delete attachment.');
                attachment.loading = false;
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.$on('modal.closing', function (e, reason, closed) {
            if (closing) {
                return;
            }

            e.preventDefault();
            closing = true;
            $uibModalInstance.close(!!$scope.login.attachments && $scope.login.attachments.length > 0);
        });
    });
