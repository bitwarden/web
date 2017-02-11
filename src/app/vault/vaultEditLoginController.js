angular
    .module('bit.vault')

    .controller('vaultEditLoginController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService, passwordService, loginId, folders, $analytics) {
        $analytics.eventTrack('vaultEditLoginController', { category: 'Modal' });
        $scope.folders = folders;
        $scope.login = {};

        apiService.logins.get({ id: loginId }, function (login) {
            $scope.login = cipherService.decryptLogin(login);
        });

        $scope.save = function (model) {
            var login = cipherService.encryptLogin(model);
            $scope.savePromise = apiService.logins.put({ id: loginId }, login, function (loginResponse) {
                $analytics.eventTrack('Edited Login');
                var decLogin = cipherService.decryptLogin(loginResponse);
                $uibModalInstance.close({
                    action: 'edit',
                    data: decLogin
                });
            }).$promise;
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
