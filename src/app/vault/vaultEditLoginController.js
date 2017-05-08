angular
    .module('bit.vault')

    .controller('vaultEditLoginController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService,
        passwordService, loginId, $analytics, $rootScope) {
        $analytics.eventTrack('vaultEditLoginController', { category: 'Modal' });
        $scope.folders = $rootScope.vaultFolders;
        $scope.login = {};
        $scope.readOnly = false;

        apiService.logins.get({ id: loginId }, function (login) {
            $scope.login = cipherService.decryptLogin(login);
            $scope.readOnly = !login.Edit;
        });

        $scope.save = function (model) {
            if ($scope.readOnly) {
                $scope.savePromise = apiService.ciphers.putPartial({ id: loginId }, {
                    folderId: model.folderId,
                    favorite: model.favorite
                }, function (response) {
                    $analytics.eventTrack('Partially Edited Login');
                    $uibModalInstance.close({
                        action: 'partialEdit',
                        data: {
                            id: loginId,
                            favorite: model.favorite,
                            folderId: model.folderId && model.folderId !== '' ? model.folderId : null
                        }
                    });
                }).$promise;
            }
            else {
                var login = cipherService.encryptLogin(model);
                $scope.savePromise = apiService.logins.put({ id: loginId }, login, function (loginResponse) {
                    $analytics.eventTrack('Edited Login');
                    var decLogin = cipherService.decryptLogin(loginResponse);
                    $uibModalInstance.close({
                        action: 'edit',
                        data: decLogin
                    });
                }).$promise;
            }
        };

        $scope.generatePassword = function () {
            if (!$scope.login.password || confirm('Are you sure you want to overwrite the current password?')) {
                $analytics.eventTrack('Generated Password From Edit');
                $scope.login.password = passwordService.generatePassword({ length: 12, special: true });
            }
        };

        $scope.clipboardSuccess = function (e) {
            e.clearSelection();
            selectPassword(e);
        };

        $scope.clipboardError = function (e, password) {
            if (password) {
                selectPassword(e);
            }
            alert('Your web browser does not support easy clipboard copying. Copy it manually instead.');
        };

        $scope.folderSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        function selectPassword(e) {
            var target = $(e.trigger).parent().prev();
            if (target.attr('type') === 'text') {
                target.select();
            }
        }

        $scope.delete = function () {
            if (!confirm('Are you sure you want to delete this login (' + $scope.login.name + ')?')) {
                return;
            }

            apiService.logins.del({ id: $scope.login.id }, function () {
                $analytics.eventTrack('Deleted Login From Edit');
                $uibModalInstance.close({
                    action: 'delete',
                    data: $scope.login.id
                });
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
