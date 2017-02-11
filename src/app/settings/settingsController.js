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
                controller: 'settingsChangeEmailController',
                size: 'sm'
            });
        };

        $scope.twoFactor = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsTwoFactor.html',
                controller: 'settingsTwoFactorController'
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
                controller: 'settingsDeleteController',
                size: 'sm'
            });
        };
    });
