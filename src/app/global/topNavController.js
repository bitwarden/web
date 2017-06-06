angular
    .module('bit.global')

    .controller('topNavController', function ($scope) {
        $scope.toggleControlSidebar = function () {
            var bod = $('body');
            if (!bod.hasClass('control-sidebar-open')) {
                bod.addClass('control-sidebar-open');
            }
            else {
                bod.removeClass('control-sidebar-open');
            }
        };
    });
