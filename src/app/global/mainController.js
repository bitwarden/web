angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state, authService, appSettings, toastr, $window, $document) {
        var vm = this;
        vm.bodyClass = '';
        vm.usingControlSidebar = vm.openControlSidebar = false;
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

                $document.off('click', '.sidebar li a');
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

            vm.usingControlSidebar = !!toState.data.controlSidebar;
            vm.openControlSidebar = vm.usingControlSidebar && $document.width() > 768;
        });

        $scope.addLogin = function () {
            $scope.$broadcast('vaultAddLogin');
        };

        $scope.addFolder = function () {
            $scope.$broadcast('vaultAddFolder');
        };

        $scope.addOrganizationLogin = function () {
            $scope.$broadcast('organizationVaultAddLogin');
        };

        $scope.addOrganizationCollection = function () {
            $scope.$broadcast('organizationCollectionsAdd');
        };

        $scope.inviteOrganizationUser = function () {
            $scope.$broadcast('organizationPeopleInvite');
        };

        $scope.addOrganizationGroup = function () {
            $scope.$broadcast('organizationGroupsAdd');
        };

        // Append dropdown menu somewhere else
        var bodyScrollbarWidth,
            appendedDropdownMenu,
            appendedDropdownMenuParent;

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
            /*jshint -W120 */
            var target = appendedDropdownMenuParent = $(e.target);

            var appendTo = target.data('appendTo');
            if (!appendTo) {
                return true;
            }

            appendedDropdownMenu = target.find('.dropdown-menu');
            var appendToEl = $(appendTo);
            appendToEl.append(appendedDropdownMenu.detach());

            var offset = target.offset();
            var css = {
                display: 'block',
                top: offset.top + target.outerHeight()
            };

            if (appendedDropdownMenu.hasClass('dropdown-menu-right')) {
                var scrollbarInfo = dropdownHelpers.scrollbarInfo();
                var scrollbarWidth = 0;
                if (scrollbarInfo.visible && scrollbarInfo.width) {
                    scrollbarWidth = scrollbarInfo.width;
                }

                css.right = $window.innerWidth - scrollbarWidth - (offset.left + target.prop('offsetWidth')) + 'px';
                css.left = 'auto';
            }
            else {
                css.left = offset.left + 'px';
                css.right = 'auto';
            }

            appendedDropdownMenu.css(css);
        });

        $(window).on('hide.bs.dropdown', function (e) {
            if (!appendedDropdownMenu) {
                return true;
            }

            $(e.target).append(appendedDropdownMenu.detach());
            appendedDropdownMenu.hide();
            appendedDropdownMenu = null;
            appendedDropdownMenuParent = null;
        });

        $scope.$on('removeAppendedDropdownMenu', function (event, args) {
            if (!appendedDropdownMenu && !appendedDropdownMenuParent) {
                return true;
            }

            appendedDropdownMenuParent.append(appendedDropdownMenu.detach());
            appendedDropdownMenu.hide();
            appendedDropdownMenu = null;
            appendedDropdownMenuParent = null;
        });
    });
