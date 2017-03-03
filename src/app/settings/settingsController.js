angular
    .module('bit.settings')

    .controller('settingsController', function ($scope, $uibModal, apiService, toastr, authService) {
        $scope.model = {
            profile: {},
            twoFactorEnabled: false,
            email: null
        };

        apiService.accounts.getProfile({}, function (user) {
            $scope.model = {
                profile: {
                    name: user.Name,
                    masterPasswordHint: user.MasterPasswordHint,
                    culture: user.Culture
                },
                email: user.Email,
                twoFactorEnabled: user.TwoFactorEnabled
            };

            if (user.Organizations) {
                var orgs = [];
                for (var i = 0; i < user.Organizations.length; i++) {
                    orgs.push({
                        id: user.Organizations[i].Id,
                        name: user.Organizations[i].Name
                    });
                }

                $scope.model.organizations = orgs;
            }
        });

        $scope.generalSave = function () {
            $scope.generalPromise = apiService.accounts.putProfile({}, $scope.model.profile, function (profile) {
                authService.setUserProfile(profile);
                toastr.success('Account has been updated.', 'Success!');
            }).$promise;
        };

        $scope.passwordHintSave = function () {
            $scope.passwordHintPromise = apiService.accounts.putProfile({}, $scope.model.profile, function (profile) {
                authService.setUserProfile(profile);
                toastr.success('Account has been updated.', 'Success!');
            }).$promise;
        };

        $scope.changePassword = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsChangePassword.html',
                controller: 'settingsChangePasswordController'
            });
        };

        $scope.changeEmail = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsChangeEmail.html',
                controller: 'settingsChangeEmailController'
            });
        };

        $scope.createOrganization = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsCreateOrganization.html',
                controller: 'settingsCreateOrganizationController'
            });
        };

        $scope.twoFactor = function () {
            var twoFactorModal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsTwoFactor.html',
                controller: 'settingsTwoFactorController'
            });

            twoFactorModal.result.then(function (enabled) {
                if (enabled === null) {
                    return;
                }

                $scope.model.twoFactorEnabled = enabled;
            });
        };

        $scope.sessions = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsSessions.html',
                controller: 'settingsSessionsController'
            });
        };

        $scope.delete = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsDelete.html',
                controller: 'settingsDeleteController'
            });
        };
    });
