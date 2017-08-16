angular
    .module('bit.organization')

    .controller('organizationSettingsController', function ($scope, $state, apiService, toastr, authService, $uibModal,
        $analytics, appSettings) {
        $scope.selfHosted = appSettings.selfHosted;
        $scope.model = {};
        $scope.$on('$viewContentLoaded', function () {
            apiService.organizations.get({ id: $state.params.orgId }, function (org) {
                $scope.model = {
                    name: org.Name,
                    billingEmail: org.BillingEmail,
                    businessName: org.BusinessName
                };
            });
        });

        $scope.generalSave = function () {
            if ($scope.selfHosted) {
                return;
            }

            $scope.generalPromise = apiService.organizations.put({ id: $state.params.orgId }, $scope.model, function (org) {
                authService.updateProfileOrganization(org).then(function (updatedOrg) {
                    $analytics.eventTrack('Updated Organization Settings');
                    toastr.success('Organization has been updated.', 'Success!');
                });
            }).$promise;
        };

        $scope.delete = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationDelete.html',
                controller: 'organizationDeleteController'
            });
        };
    });
