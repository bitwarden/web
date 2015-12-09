angular
    .module('bit.tools')

    .controller('toolsImportController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService, $q, toastr) {
        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
