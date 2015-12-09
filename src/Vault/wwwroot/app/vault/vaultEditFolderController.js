angular
    .module('bit.vault')

    .controller('vaultEditFolderController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService, folderId) {
        $scope.folder = {};

        apiService.folders.get({ id: folderId }, function (folder) {
            $scope.folder = cipherService.decryptFolder(folder);
        });

        $scope.savePromise = null;
        $scope.save = function (model) {
            var folder = cipherService.encryptFolder(model);
            $scope.savePromise = apiService.folders.put({ id: folderId }, folder, function (response) {
                var decFolder = cipherService.decryptFolder(response);
                $uibModalInstance.close(decFolder);
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
