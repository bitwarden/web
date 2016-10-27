angular
    .module('bit.services')

    .factory('sideNavService', function () {
        var _service = {};

        _service.toggleSideNav = function () {
            if (localStorage.showSideNav == "false") {
                localStorage.showSideNav = "true";
            } else {
                localStorage.showSideNav = "false";
            }
        };

        _service.isToggled = function() {
            if (localStorage.showSideNav == "false") {
              return true;
            } else {
              return false;
            }
        };

        return _service;
    });
