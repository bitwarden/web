angular
    .module('bit.vault')

    .controller('vaultShareController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService,
        id, name, isFolder, $analytics) {
        $analytics.eventTrack('vaultShareController', { category: 'Modal' });
        $scope.cipher = {
            id: id,
            name: name,
            isFolder: isFolder
        };

        $scope.savePromise = null;
        $scope.save = function (model) {
            $uibModalInstance.close({});
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
