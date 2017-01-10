angular
    .module('bit.settings')

    .controller('settingsController', function ($scope, $uibModal, apiService, toastr, authService) {
        $scope.model = {};

        apiService.accounts.getProfile({}, function (user) {
            $scope.model = {
                name: user.Name,
                email: user.Email,
                masterPasswordHint: user.MasterPasswordHint,
                culture: user.Culture,
                twoFactorEnabled: user.TwoFactorEnabled
            };
        });

        $scope.save = function (model) {
            $scope.savePromise = apiService.accounts.putProfile({}, model, function (profile) {
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

        $scope.$on('settingsChangePassword', function (event, args) {
            $scope.changePassword();
        });

        $scope.changeEmail = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsChangeEmail.html',
                controller: 'settingsChangeEmailController',
                size: 'sm'
            });
        };

        $scope.$on('settingsChangeEmail', function (event, args) {
            $scope.changeEmail();
        });

        $scope.twoFactor = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsTwoFactor.html',
                controller: 'settingsTwoFactorController'
            });
        };

        $scope.$on('settingsTwoFactor', function (event, args) {
            $scope.twoFactor();
        });

        $scope.sessions = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsSessions.html',
                controller: 'settingsSessionsController'
            });
        };

        $scope.$on('settingsSessions', function (event, args) {
            $scope.sessions();
        });

        $scope.domains = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsDomains.html',
                controller: 'settingsDomainsController'
            });
        };

        $scope.$on('settingsDomains', function (event, args) {
            $scope.domains();
        });

        $scope.delete = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsDelete.html',
                controller: 'settingsDeleteController',
                size: 'sm'
            });
        };

        $scope.$on('settingsDelete', function (event, args) {
            $scope.delete();
        });
    });
