angular
    .module('bit.directives')

    .directive('apiForm', function ($rootScope, validationService, $timeout) {
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
                $timeout(function () {
                    form.$loading = false;
                });
            }, function failure(reason) {
                $timeout(function () {
                    form.$loading = false;
                    if (typeof reason === 'string') {
                        validationService.addError(form, null, reason, true);
                    }
                    else {
                        validationService.addErrors(form, reason);
                    }
                    scope.$broadcast('show-errors-check-validity');
                    $('html, body').animate({ scrollTop: 0 }, 200);
                });
            });
        }
    });