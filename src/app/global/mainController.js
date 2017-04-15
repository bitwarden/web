angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state, authService, appSettings, toastr) {
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
        var bodyScrollbarWidth;
        var bodyDropdownMenu;
        var dropdownHelpers = {
            scrollParent: function (elem, includeHidden, includeSelf) {
                var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;
                var documentEl = $(document).documentElement;
                var elemStyle = window.getComputedStyle(elem);

                if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
                    return elem;
                }

                var excludeStatic = elemStyle.position === 'absolute';
                var scrollParent = elem.parentElement || documentEl;

                if (scrollParent === documentEl || elemStyle.position === 'fixed') {
                    return documentEl;
                }

                while (scrollParent.parentElement && scrollParent !== documentEl) {
                    var spStyle = window.getComputedStyle(scrollParent);
                    if (excludeStatic && spStyle.position !== 'static') {
                        excludeStatic = false;
                    }

                    if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
                        break;
                    }
                    scrollParent = scrollParent.parentElement;
                }

                return scrollParent;
            },
            scrollbarWidth: function () {
                if (!bodyScrollbarWidth) {
                    var bodyElem = $('body');
                    bodyElem.addClass('bit-position-body-scrollbar-measure');
                    bodyScrollbarWidth = window.innerWidth - bodyElem[0].clientWidth;
                    bodyScrollbarWidth = isFinite(bodyScrollbarWidth) ? bodyScrollbarWidth : 0;
                    bodyElem.removeClass('bit-position-body-scrollbar-measure');
                }

                return bodyScrollbarWidth;
            },
            scrollbarPadding: function (elem) {
                elem = elem[0];
                var scrollParent = dropdownHelpers.scrollParent(elem, false, true);
                var scrollbarWidth = dropdownHelpers.scrollbarWidth();

                return {
                    scrollbarWidth: scrollbarWidth,
                    widthOverflow: scrollParent.scrollWidth > scrollParent.clientWidth,
                    heightOverflow: scrollParent.scrollHeight > scrollParent.clientHeight
                };
            }
        };

        $('.dropdown-menu-body').on('show.bs.dropdown', function (e) {
            bodyScrollbarWidth = $(e.target).find('.dropdown-menu');
            var body = $('body');
            body.append(bodyScrollbarWidth.detach());

            var eOffset = $(e.target).offset();
            var css = {
                display: 'block',
                top: eOffset.top + $(e.target).outerHeight()
            };

            if (bodyScrollbarWidth.hasClass('dropdown-menu-right')) {
                var scrollbarPadding = dropdownHelpers.scrollbarPadding(body);
                var scrollbarWidth = 0;
                if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
                    scrollbarWidth = scrollbarPadding.scrollbarWidth;
                }

                css.right = window.innerWidth - scrollbarWidth -
                    (eOffset.left + $(e.target).prop('offsetWidth')) + 'px';
                css.left = 'auto';
            }
            else {
                css.left = eOffset.left + 'px';
                css.right = 'auto';
            }

            bodyScrollbarWidth.css(css);
        });

        $('.dropdown-menu-body').on('hide.bs.dropdown', function (e) {
            $(e.target).append(bodyScrollbarWidth.detach());
            bodyScrollbarWidth.hide();
        });
    });
