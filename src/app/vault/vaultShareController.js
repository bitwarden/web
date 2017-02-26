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

        $scope.sharePromise = null;
        $scope.share = function () {
            $uibModalInstance.close({});
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
