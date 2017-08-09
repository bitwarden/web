angular
    .module('bit.accounts')

    .controller('accountsRecoverDeleteController', function ($scope, $rootScope, apiService, $analytics) {
        $scope.success = false;

        $scope.submit = function (model) {
            $scope.submitPromise = apiService.accounts.postDeleteRecover({ email: model.email }, function () {
                $analytics.eventTrack('Started Delete Recovery');
                $scope.success = true;
            }).$promise;
        };
    });
