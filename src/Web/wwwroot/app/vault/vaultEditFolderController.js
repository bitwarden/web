angular
    .module('bit.vault')

    .controller('vaultEditFolderController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService, folderId, $analytics) {
        $analytics.eventTrack('vaultEditFolderController', { category: 'Modal' });
        $scope.folder = {};

        apiService.folders.get({ id: folderId }, function (folder) {
            $scope.folder = cipherService.decryptFolder(folder);
        });

        $scope.savePromise = null;
        $scope.save = function (model) {
            var folder = cipherService.encryptFolder(model);
            $scope.savePromise = apiService.folders.put({ id: folderId }, folder, function (response) {
                $analytics.eventTrack('Edited Folder');
                var decFolder = cipherService.decryptFolder(response);
                $uibModalInstance.close(decFolder);
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
