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

        $scope.$on('toolsImport', function (event, args) {
            $scope.import();
        });

        $scope.export = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/tools/views/toolsExport.html',
                controller: 'toolsExportController',
                size: 'sm'
            });
        };

        $scope.$on('toolsExport', function (event, args) {
            $scope.export();
        });

        $scope.audits = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/tools/views/toolsAudits.html',
                controller: 'toolsAuditsController'
            });
        };

        $scope.$on('toolsAudits', function (event, args) {
            $scope.audits();
        });
    });
