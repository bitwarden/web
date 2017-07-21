angular
    .module('bit.vault')

    .controller('vaultAttachmentsController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService,
        loginId, $analytics, validationService, toastr, $timeout, authService, $uibModal) {
        $analytics.eventTrack('vaultAttachmentsController', { category: 'Modal' });
        $scope.login = {};
        $scope.readOnly = true;
        $scope.loading = true;
        $scope.isPremium = true;
        var closing = false;

        authService.getUserProfile().then(function (profile) {
            $scope.isPremium = profile.premium;
        });

        apiService.logins.get({ id: loginId }, function (login) {
            $scope.login = cipherService.decryptLogin(login);
            $scope.readOnly = !login.Edit;
            $scope.loading = false;
        }, function () {
            $scope.loading = false;
        });

        $scope.save = function (form) {
            var fileEl = document.getElementById('file');
            var files = fileEl.files;
            if (!files || !files.length) {
                validationService.addError(form, 'file', 'Select a file.', true);
                return;
            }

            $scope.savePromise = cipherService.encryptAttachmentFile(getKeyForLogin(), files[0]).then(function (encValue) {
                var fd = new FormData();
                var blob = new Blob([encValue.data], { type: 'application/octet-stream' });
                fd.append('data', blob, encValue.fileName);
                return apiService.ciphers.postAttachment({ id: loginId }, fd).$promise;
            }).then(function (response) {
                $analytics.eventTrack('Added Attachment');
                $scope.login = cipherService.decryptLogin(response);

                // reset file input
                // ref: https://stackoverflow.com/a/20552042
                fileEl.type = '';
                fileEl.type = 'file';
                fileEl.value = '';
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

            if (!$scope.login.organizationId && !$scope.isPremium) {
                attachment.loading = false;
                alert('Premium membership is required to use this feature.');
                return;
            }

            cipherService.downloadAndDecryptAttachment(getKeyForLogin(), attachment, true).then(function (res) {
                $timeout(function () {
                    attachment.loading = false;
                });
            }, function () {
                $timeout(function () {
                    attachment.loading = false;
                });
            });
        };

        function getKeyForLogin() {
            if ($scope.login.organizationId) {
                return cryptoService.getOrgKey($scope.login.organizationId);
            }

            return null;
        }

        $scope.remove = function (attachment) {
            if (!confirm('Are you sure you want to delete this attachment (' + attachment.fileName + ')?')) {
                return;
            }

            attachment.loading = true;
            apiService.ciphers.delAttachment({ id: loginId, attachmentId: attachment.id }).$promise.then(function () {
                attachment.loading = false;
                $analytics.eventTrack('Deleted Attachment');
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

        $scope.showUpgrade = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/views/premiumRequired.html',
                controller: 'premiumRequiredController'
            });
        };
    });
