angular
    .module('bit.organization')

    .controller('organizationGroupsAddController', function ($scope, $state, $uibModalInstance, apiService,
        $analytics) {
        $analytics.eventTrack('organizationGroupsAddController', { category: 'Modal' });

        $scope.submit = function (model) {
            var group = {
                name: model.name
            };
            $scope.submitPromise = apiService.groups.post({ orgId: $state.params.orgId }, group, function (response) {
                $analytics.eventTrack('Created Group');
                $uibModalInstance.close({
                    id: response.Id,
                    name: response.Name
                });
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
