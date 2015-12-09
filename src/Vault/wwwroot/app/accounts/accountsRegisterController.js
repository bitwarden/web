angular
    .module('bit.accounts')

    .controller('accountsRegisterController', function ($scope, $rootScope, apiService) {
        $scope.success = false;

        $scope.registerPromise = null;
        $scope.register = function (model) {
            $scope.registerPromise = apiService.accounts.registerToken({ email: model.email }, function () {
                $scope.success = true;
            }).$promise;
        };
    });
