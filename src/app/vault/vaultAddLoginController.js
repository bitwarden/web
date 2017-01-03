angular
    .module('bit.vault')

    .controller('vaultAddLoginController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService, passwordService, folders, selectedFolder, $analytics) {
        $analytics.eventTrack('vaultAddLoginController', { category: 'Modal' });
        $scope.folders = folders;
        $scope.login = {
            folderId: selectedFolder ? selectedFolder.id : null
        };

        $scope.savePromise = null;
        $scope.save = function (model) {
            var login = cipherService.encryptLogin(model);
            $scope.savePromise = apiService.logins.post(login, function (loginResponse) {
                $analytics.eventTrack('Created Login');
                var decLogin = cipherService.decryptLogin(loginResponse);
                $uibModalInstance.close(decLogin);
            }).$promise;
        };

        $scope.generatePassword = function () {
            if (!$scope.login.password || confirm('Are you sure you want to overwrite the current password?')) {
                $analytics.eventTrack('Generated Password From Add');
                $scope.login.password = passwordService.generatePassword({ length: 10, special: true });
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

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };
    });
