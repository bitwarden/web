angular
    .module('bit')

    .factory('apiInterceptor', function ($injector, $q, toastr) {
        return {
            request: function (config) {
                return config;
            },
            response: function (response) {
                if (response.status === 401 || response.status == 403) {
                    $injector.get('authService').logOut();
                    $injector.get('$state').go('frontend.login.info').then(function () {
                        toastr.warning('Your login session has expired.', 'Logged out');
                    });
                }

                return response || $q.when(response);
            },
            responseError: function (rejection) {
                if (rejection.status === 401 || rejection.status == 403) {
                    $injector.get('authService').logOut();
                    $injector.get('$state').go('frontend.login.info').then(function () {
                        toastr.warning('Your login session has expired.', 'Logged out');
                    });
                }
                return $q.reject(rejection);
            }
        };
    });