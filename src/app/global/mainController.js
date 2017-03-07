angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state, authService, appSettings, toastr) {
        var vm = this;
        vm.bodyClass = '';
        vm.searchVaultText = null;
        vm.version = appSettings.version;
        vm.userProfile = authService.getUserProfile();

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

                $(document).off('click', '.sidebar li a');
            }

            $('.table-responsive').on('shown.bs.dropdown', function (e) {
                var t = $(this),
                    m = $(e.target).find('.dropdown-menu'),
                    tb = t.offset().top + t.height(),
                    mb = m.offset().top + m.outerHeight(true),
                    d = 20; // Space for shadow + scrollbar.
                if (t[0].scrollWidth > t.innerWidth()) {
                    if (mb + d > tb) {
                        t.css('padding-bottom', ((mb + d) - tb));
                    }
                }
                else {
                    t.css('overflow', 'visible');
                }
            }).on('hidden.bs.dropdown', function () {
                $(this).css({ 'padding-bottom': '', 'overflow': '' });
            });
        });

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            vm.searchVaultText = null;

            if (toState.data.bodyClass) {
                vm.bodyClass = toState.data.bodyClass;
                return;
            }
            else {
                vm.bodyClass = '';
            }
        });

        $scope.searchVault = function () {
            $state.go('backend.user.vault');
        };

        $scope.addLogin = function () {
            $scope.$broadcast('vaultAddLogin');
        };

        $scope.addFolder = function () {
            $scope.$broadcast('vaultAddFolder');
        };
    });
