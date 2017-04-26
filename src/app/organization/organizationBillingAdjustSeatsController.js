angular
    .module('bit.organization')

    .controller('organizationBillingAdjustSeatsController', function ($scope, $state, $uibModalInstance, apiService,
        $analytics, toastr, add) {
        $analytics.eventTrack('organizationBillingAdjustSeatsController', { category: 'Modal' });
        $scope.add = add;
        $scope.seatAdjustment = 0;

        $scope.submit = function () {
            var request = {
                seatAdjustment: $scope.seatAdjustment
            };

            if (!add) {
                request.seatAdjustment *= -1;
            }

            $scope.submitPromise = apiService.organizations.putSeat({ id: $state.params.orgId }, request)
                .$promise.then(function (response) {
                    if (add) {
                        $analytics.eventTrack('Added Seats');
                        toastr.success('You have added ' + $scope.seatAdjustment + ' seats.');
                    }
                    else {
                        $analytics.eventTrack('Removed Seats');
                        toastr.success('You have removed ' + $scope.seatAdjustment + ' seats.');
                    }

                    $uibModalInstance.close();
                });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
