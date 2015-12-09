angular
    .module('bit.directives')

    .directive('apiField', function () {
        var linkFn = function (scope, element, attrs, ngModel) {
            ngModel.$registerApiError = registerApiError;
            ngModel.$validators.apiValidate = apiValidator;

            function apiValidator() {
                ngModel.$setValidity('api', true);
                return true;
            }

            function registerApiError() {
                ngModel.$setValidity('api', false);
            }
        };

        return {
            require: 'ngModel',
            restrict: 'A',
            compile: function (elem, attrs) {
                if (!attrs.name || attrs.name === '') {
                    throw 'api-field element does not have a valid name attribute';
                }

                return linkFn;
            }
        };
    });