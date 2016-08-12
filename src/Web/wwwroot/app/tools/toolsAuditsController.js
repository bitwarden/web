angular
    .module('bit.tools')

    .controller('toolsAuditsController', function ($scope, apiService, $uibModalInstance, toastr, $analytics) {
        $analytics.eventTrack('toolsAuditsController', { category: 'Modal' });
        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
