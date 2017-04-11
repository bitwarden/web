angular
    .module('bit.directives')

    .directive('apiForm', function ($rootScope, validationService) {
        return {
            require: 'form',
            restrict: 'A',
            link: function (scope, element, attrs, formCtrl) {
                var watchPromise = attrs.apiForm || null;
                if (watchPromise !== void 0) {
                    scope.$watch(watchPromise, formSubmitted.bind(null, formCtrl, scope));
                }
            }
        };

        function formSubmitted(form, scope, promise) {
            if (!promise || !promise.then) {
                return;
            }

            // reset errors
            form.$errors = null;

            // start loading
            form.$loading = true;

            promise.then(function success(response) {
                form.$loading = false;
            }, function failure(reason) {
                form.$loading = false;
                validationService.addErrors(form, reason);
                scope.$broadcast('show-errors-check-validity');
                $('html, body').animate({ scrollTop: 0 }, 200);
            });
        }
    });