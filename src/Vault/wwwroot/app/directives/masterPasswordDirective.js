angular
    .module('bit.directives')

    .directive('masterPassword', function (cryptoService, authService) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elem, attr, ngModel) {
                var profile = authService.getUserProfile();
                if (!profile) {
                    return;
                }

                // For DOM -> model validation
                ngModel.$parsers.unshift(function (value) {
                    if (!value) {
                        return undefined;
                    }

                    var key = cryptoService.makeKey(value, profile.email, true);
                    var valid = key == cryptoService.getKey(true);
                    ngModel.$setValidity('masterPassword', valid);
                    return valid ? value : undefined;
                });

                // For model -> DOM validation
                ngModel.$formatters.unshift(function (value) {
                    if (!value) {
                        return undefined;
                    }

                    var key = cryptoService.makeKey(value, profile.email, true);
                    var valid = key == cryptoService.getKey(true);

                    ngModel.$setValidity('masterPassword', valid);
                    return value;
                });
            }
        };
    });