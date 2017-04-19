angular
    .module('bit.directives')

    .directive('masterPassword', function (cryptoService, authService) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elem, attr, ngModel) {
                authService.getUserProfile().then(function (profile) {
                    // For DOM -> model validation
                    ngModel.$parsers.unshift(function (value) {
                        if (!value) {
                            return undefined;
                        }

                        var key = cryptoService.makeKey(value, profile.email);
                        var valid = key.keyB64 === cryptoService.getKey().keyB64;
                        ngModel.$setValidity('masterPassword', valid);
                        return valid ? value : undefined;
                    });

                    // For model -> DOM validation
                    ngModel.$formatters.unshift(function (value) {
                        if (!value) {
                            return undefined;
                        }

                        var key = cryptoService.makeKey(value, profile.email);
                        var valid = key.keyB64 === cryptoService.getKey().keyB64;

                        ngModel.$setValidity('masterPassword', valid);
                        return value;
                    });
                });
            }
        };
    });