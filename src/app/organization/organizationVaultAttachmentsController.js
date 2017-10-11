angular
    .module('bit.organization')

    .controller('organizationVaultAttachmentsController', function ($scope, apiService, $uibModalInstance, cryptoService,
        cipherService, cipherId, $analytics, validationService, toastr, $timeout) {
        $analytics.eventTrack('organizationVaultAttachmentsController', { category: 'Modal' });
        $scope.cipher = {};
        $scope.loading = true;
        $scope.isPremium = true;
        $scope.canUseAttachments = true;
        var closing = false;

        apiService.ciphers.getAdmin({ id: cipherId }, function (cipher) {
            $scope.cipher = cipherService.decryptCipher(cipher);
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

            var key = cryptoService.getOrgKey($scope.cipher.organizationId);
            $scope.savePromise = cipherService.encryptAttachmentFile(key, files[0]).then(function (encValue) {
                var fd = new FormData();
                var blob = new Blob([encValue.data], { type: 'application/octet-stream' });
                fd.append('data', blob, encValue.fileName);
                return apiService.ciphers.postAttachment({ id: cipherId }, fd).$promise;
            }).then(function (response) {
                $analytics.eventTrack('Added Attachment');
                toastr.success('The attachment has been added.');
                closing = true;
                $uibModalInstance.close(true);
            }, function (err) {
                if (err) {
                    validationService.addError(form, 'file', err, true);
                }
                else {
                    validationService.addError(form, 'file', 'Something went wrong.', true);
                }
            });
        };

        $scope.download = function (attachment) {
            attachment.loading = true;
            var key = cryptoService.getOrgKey($scope.cipher.organizationId);
            cipherService.downloadAndDecryptAttachment(key, attachment, true).then(function (res) {
                $timeout(function () {
                    attachment.loading = false;
                });
            }, function () {
                $timeout(function () {
                    attachment.loading = false;
                });
            });
        };

        $scope.remove = function (attachment) {
            if (!confirm('Are you sure you want to delete this attachment (' + attachment.fileName + ')?')) {
                return;
            }

            attachment.loading = true;
            apiService.ciphers.delAttachment({ id: cipherId, attachmentId: attachment.id }).$promise.then(function () {
                attachment.loading = false;
                $analytics.eventTrack('Deleted Organization Attachment');
                var index = $scope.cipher.attachments.indexOf(attachment);
                if (index > -1) {
                    $scope.cipher.attachments.splice(index, 1);
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
            $uibModalInstance.close(!!$scope.cipher.attachments && $scope.cipher.attachments.length > 0);
        });
    });
