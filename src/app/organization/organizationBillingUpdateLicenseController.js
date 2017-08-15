angular
    .module('bit.organization')

    .controller('organizationBillingUpdateLicenseController', function ($scope, $state, $uibModalInstance, apiService,
        $analytics, toastr, validationService) {
        $analytics.eventTrack('organizationBillingUpdateLicenseController', { category: 'Modal' });

        $scope.submit = function (form) {
            var fileEl = document.getElementById('file');
            var files = fileEl.files;
            if (!files || !files.length) {
                validationService.addError(form, 'file', 'Select a license file.', true);
                return;
            }

            var fd = new FormData();
            fd.append('license', files[0]);

            $scope.submitPromise = apiService.organizations.putLicense({ id: $state.params.orgId }, fd)
                .$promise.then(function (response) {
                    $analytics.eventTrack('Updated License');
                    toastr.success('You have updated your license.');
                    $uibModalInstance.close();
                });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
