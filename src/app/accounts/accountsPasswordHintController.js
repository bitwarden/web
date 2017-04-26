angular
    .module('bit.accounts')

    .controller('accountsPasswordHintController', function ($scope, $rootScope, apiService, $analytics) {
        $scope.success = false;

        $scope.submit = function (model) {
            $scope.submitPromise = apiService.accounts.postPasswordHint({ email: model.email }, function () {
                $analytics.eventTrack('Requested Password Hint');
                $scope.success = true;
            }).$promise;
        };
    });
