angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state, authService, appSettings, toastr) {
        var vm = this;
        vm.bodyClass = '';
        vm.userProfile = null;
        vm.searchVaultText = null;
        vm.version = appSettings.version;

        $scope.currentYear = new Date().getFullYear();

        $scope.$on('$viewContentLoaded', function () {
            if ($.AdminLTE) {
                if ($.AdminLTE.layout) {
                    $.AdminLTE.layout.fix();
                    $.AdminLTE.layout.fixSidebar();
                }

                if ($.AdminLTE.pushMenu) {
                    $.AdminLTE.pushMenu.expandOnHover();
                }
            }
        });

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            vm.searchVaultText = null;
            vm.userProfile = authService.getUserProfile();

            if (toState.data.bodyClass) {
                vm.bodyClass = toState.data.bodyClass;
                return;
            }
            else {
                vm.bodyClass = '';
            }
        });

        $scope.searchVault = function () {
            $state.go('backend.vault');
        };

        $scope.addLogin = function () {
            $scope.$broadcast('vaultAddLogin');
        };

        $scope.addFolder = function () {
            $scope.$broadcast('vaultAddFolder');
        };
    });
