angular
    .module('bit.accounts')

    .controller('accountsPasswordHintController', function ($scope, $rootScope, apiService) {
        $scope.success = false;

        $scope.submit = function (model) {
            $scope.submitPromise = apiService.accounts.postPasswordHint({ email: model.email }, function () {
                $scope.success = true;
            }).$promise;
        };
    });
