angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state, authService, appSettings, toastr, $window, $document) {
        var vm = this;
        vm.bodyClass = '';
        vm.searchVaultText = null;
        vm.version = appSettings.version;

        $scope.currentYear = new Date().getFullYear();

        $scope.$on('$viewContentLoaded', function () {
            authService.getUserProfile().then(function (profile) {
                vm.userProfile = profile;
            });

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

        // Append dropdown menus to body
        var bodyScrollbarWidth,
            bodyDropdownMenu;
        var dropdownHelpers = {
            scrollbarWidth: function () {
                if (!bodyScrollbarWidth) {
                    var bodyElem = $('body');
                    bodyElem.addClass('bit-position-body-scrollbar-measure');
                    bodyScrollbarWidth = $window.innerWidth - bodyElem[0].clientWidth;
                    bodyScrollbarWidth = isFinite(bodyScrollbarWidth) ? bodyScrollbarWidth : 0;
                    bodyElem.removeClass('bit-position-body-scrollbar-measure');
                }

                return bodyScrollbarWidth;
            },
            scrollbarInfo: function () {
                return {
                    width: dropdownHelpers.scrollbarWidth(),
                    visible: $document.height() > $($window).height()
                };
            }
        };

        $(window).on('show.bs.dropdown', function (e) {
            var target = $(e.target);
            if (!target.hasClass('dropdown-to-body')) {
                return true;
            }

            bodyDropdownMenu = target.find('.dropdown-menu');
            var body = $('body');
            body.append(bodyDropdownMenu.detach());

            var eOffset = target.offset();
            var css = {
                display: 'block',
                top: eOffset.top + target.outerHeight()
            };

            if (bodyDropdownMenu.hasClass('dropdown-menu-right')) {
                var scrollbarInfo = dropdownHelpers.scrollbarInfo();
                var scrollbarWidth = 0;
                if (scrollbarInfo.visible && scrollbarInfo.width) {
                    scrollbarWidth = scrollbarInfo.width;
                }

                css.right = $window.innerWidth - scrollbarWidth - (eOffset.left + target.prop('offsetWidth')) + 'px';
                css.left = 'auto';
            }
            else {
                css.left = eOffset.left + 'px';
                css.right = 'auto';
            }

            bodyDropdownMenu.css(css);
        });

        $(window).on('hide.bs.dropdown', function (e) {
            var target = $(e.target);
            if (!target.hasClass('dropdown-to-body')) {
                return true;
            }

            target.append(bodyDropdownMenu.detach());
            bodyDropdownMenu.hide();
        });
    });
