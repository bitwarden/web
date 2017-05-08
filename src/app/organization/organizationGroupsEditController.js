angular
    .module('bit.organization')

    .controller('organizationGroupsEditController', function ($scope, $state, $uibModalInstance, apiService,
        $analytics, id) {
        $analytics.eventTrack('organizationGroupsEditController', { category: 'Modal' });
        $scope.collection = {};

        $uibModalInstance.opened.then(function () {
            apiService.groups.get({ orgId: $state.params.orgId, id: id }, function (group) {
                $scope.group = {
                    id: id,
                    name: group.Name
                };
            });
        });

        $scope.submit = function () {
            $scope.submitPromise = apiService.groups.put({ orgId: $state.params.orgId }, $scope.group, function (response) {
                $analytics.eventTrack('Edited Group');
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
