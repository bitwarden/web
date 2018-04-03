angular
    .module('bit.organization')

    .controller('organizationSettingsController', function ($scope, $state, apiService, toastr, authService, $uibModal,
        $analytics, appSettings, constants, $filter) {
        $scope.selfHosted = appSettings.selfHosted;
        $scope.model = {};
        $scope.twoStepProviders = $filter('filter')(constants.twoFactorProviderInfo, { organization: true });
        $scope.use2fa = false;

        $scope.$on('$viewContentLoaded', function () {
            apiService.organizations.get({ id: $state.params.orgId }).$promise.then(function (org) {
                $scope.model = {
                    name: org.Name,
                    billingEmail: org.BillingEmail,
                    businessName: org.BusinessName,
                    businessAddress1: org.BusinessAddress1,
                    businessAddress2: org.BusinessAddress2,
                    businessAddress3: org.BusinessAddress3,
                    businessCountry: org.BusinessCountry,
                    businessTaxNumber: org.BusinessTaxNumber
                };

                $scope.use2fa = org.Use2fa;
                if (org.Use2fa) {
                    return apiService.twoFactor.listOrganization({ orgId: $state.params.orgId }).$promise;
                }
                else {
                    return null;
                }
            }).then(function (response) {
                if (!response || !response.Data) {
                    return;
                }

                for (var i = 0; i < response.Data.length; i++) {
                    if (!response.Data[i].Enabled) {
                        continue;
                    }

                    var provider = $filter('filter')($scope.twoStepProviders, { type: response.Data[i].Type });
                    if (provider.length) {
                        provider[0].enabled = true;
                    }
                }
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

        $scope.import = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/tools/views/toolsImport.html',
                controller: 'organizationSettingsImportController'
            });
        };

        $scope.export = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/tools/views/toolsExport.html',
                controller: 'organizationSettingsExportController'
            });
        };

        $scope.delete = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationDelete.html',
                controller: 'organizationDeleteController'
            });
        };

        $scope.edit = function (provider) {
            if (provider.type === constants.twoFactorProvider.organizationDuo) {
                typeName = 'Duo';
            }
            else {
                return;
            }

            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsTwoStep' + typeName + '.html',
                controller: 'settingsTwoStep' + typeName + 'Controller',
                resolve: {
                    enabled: function () { return provider.enabled; },
                    orgId: function () { return $state.params.orgId; }
                }
            });

            modal.result.then(function (enabled) {
                if (enabled || enabled === false) {
                    // do not adjust when undefined or null
                    provider.enabled = enabled;
                }
            });
        };
    });
