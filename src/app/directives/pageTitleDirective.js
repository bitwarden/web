angular
    .module('bit.directives')

    .directive('pageTitle', function ($rootScope, $timeout, appSettings) {
        return {
            link: function (scope, element) {
                var listener = function (event, toState, toParams, fromState, fromParams) {
                    // Default title
                    var title = 'Bitwarden Web Vault';
                    if (toState.data && toState.data.pageTitle) {
                        title = toState.data.pageTitle + ' - ' + title;
                    }

                    $timeout(function () {
                        element.text(title);
                    });
                };

                $rootScope.$on('$stateChangeStart', listener);
            }
        };
    });