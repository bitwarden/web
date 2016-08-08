angular
    .module('bit.tools')

    .controller('toolsAuditsController', function ($scope, apiService, $uibModalInstance, toastr) {
        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
