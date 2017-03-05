angular
    .module('bit.organization')

    .controller('organizationPeopleInviteController', function ($scope, $state, $uibModalInstance, apiService) {
        $scope.submit = function (model) {
            apiService.organizationUsers.invite({ orgId: $state.params.orgId }, { email: model.email }, function () {
                $uibModalInstance.close();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
