angular
    .module('bit.tools')

    .controller('toolsController', function ($scope, $uibModal, apiService, toastr, authService) {
        $scope.import = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/tools/views/toolsImport.html',
                controller: 'toolsImportController'
            });
        };

        $scope.export = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/tools/views/toolsExport.html',
                controller: 'toolsExportController'
            });
        };
    });
