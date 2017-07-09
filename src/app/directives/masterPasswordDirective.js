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

                        return cryptoService.makeKey(value, profile.email).then(function (result) {
                            var valid = result.keyB64 === cryptoService.getKey().keyB64;
                            ngModel.$setValidity('masterPassword', valid);
                            return valid ? value : undefined;
                        });
                    });

                    // For model -> DOM validation
                    ngModel.$formatters.unshift(function (value) {
                        if (!value) {
                            return undefined;
                        }

                        return cryptoService.makeKey(value, profile.email).then(function (result) {
                            var valid = result.keyB64 === cryptoService.getKey().keyB64;
                            ngModel.$setValidity('masterPassword', valid);
                            return value;
                        });
                    });
                });
            }
        };
    });