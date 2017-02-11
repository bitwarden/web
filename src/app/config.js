angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider, $uibTooltipProvider, toastrConfig) {
        jwtInterceptorProvider.urlParam = 'access_token2';
        var refreshPromise;
        jwtInterceptorProvider.tokenGetter = /*@ngInject*/ function (config, appSettings, tokenService, apiService, jwtHelper, $q) {
            if (config.url.indexOf(appSettings.apiUri) !== 0) {
                return;
            }

            if (refreshPromise) {
                return refreshPromise;
            }

            var token = tokenService.getToken();
            if (!token) {
                return;
            }

            if (!tokenService.tokenNeedsRefresh(token)) {
                return token;
            }

            var refreshToken = tokenService.getRefreshToken();
            if (!refreshToken) {
                return;
            }

            var deferred = $q.defer();
            apiService.identity.token({
                grant_type: 'refresh_token',
                client_id: 'web',
                refresh_token: refreshToken
            }, function (response) {
                tokenService.setToken(response.access_token);
                tokenService.setRefreshToken(response.refresh_token);
                refreshPromise = null;
                deferred.resolve(response.access_token);
            });
            refreshPromise = deferred.promise;
            return refreshPromise;
        };

        angular.extend(toastrConfig, {
            closeButton: true,
            progressBar: true,
            showMethod: 'slideDown',
            target: '.toast-target'
        });

        $uibTooltipProvider.options({
            popupDelay: 600,
            appendToBody: true

        });

        if ($httpProvider.defaults.headers.post) {
            $httpProvider.defaults.headers.post = {};
        }

        $httpProvider.defaults.headers.post['Content-Type'] = 'text/plain; charset=utf-8';

        $httpProvider.interceptors.push('apiInterceptor');
        $httpProvider.interceptors.push('jwtInterceptor');

        $urlRouterProvider.otherwise('/');

        $stateProvider
        // Backend
            .state('backend', {
                templateUrl: 'app/views/backendLayout.html',
                abstract: true,
                data: {
                    authorize: true
                }
            })
            .state('backend.vault', {
                url: '^/vault',
                templateUrl: 'app/vault/views/vault.html',
                controller: 'vaultController',
                data: { pageTitle: 'My Vault' }
            })
            .state('backend.settings', {
                url: '^/settings',
                templateUrl: 'app/settings/views/settings.html',
                controller: 'settingsController',
                data: { pageTitle: 'Settings' }
            })
            .state('backend.settingsDomains', {
                url: '^/settings/domains',
                templateUrl: 'app/settings/views/settingsDomains.html',
                controller: 'settingsDomainsController',
                data: { pageTitle: 'Domain Settings' }
            })
            .state('backend.tools', {
                url: '^/tools',
                templateUrl: 'app/tools/views/tools.html',
                controller: 'toolsController',
                data: { pageTitle: 'Tools' }
            })

        // Frontend
            .state('frontend', {
                templateUrl: 'app/views/frontendLayout.html',
                abstract: true,
                data: {
                    authorize: false
                }
            })
            .state('frontend.login', {
                templateUrl: 'app/accounts/views/accountsLogin.html',
                controller: 'accountsLoginController',
                data: {
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.login.info', {
                url: '^/',
                templateUrl: 'app/accounts/views/accountsLoginInfo.html',
                data: {
                    pageTitle: 'Log In'
                }
            })
            .state('frontend.login.twoFactor', {
                url: '^/two-factor',
                templateUrl: 'app/accounts/views/accountsLoginTwoFactor.html',
                data: {
                    pageTitle: 'Log In (Two Factor)',
                    authorizeTwoFactor: true
                }
            })
            .state('frontend.logout', {
                url: '^/logout',
                controller: 'accountsLogoutController',
                data: {
                    authorize: true
                }
            })
            .state('frontend.passwordHint', {
                url: '^/password-hint',
                templateUrl: 'app/accounts/views/accountsPasswordHint.html',
                controller: 'accountsPasswordHintController',
                data: {
                    pageTitle: 'Master Password Hint',
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.recover', {
                url: '^/recover',
                templateUrl: 'app/accounts/views/accountsRecover.html',
                controller: 'accountsRecoverController',
                data: {
                    pageTitle: 'Recover Account',
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.register', {
                url: '^/register',
                templateUrl: 'app/accounts/views/accountsRegister.html',
                controller: 'accountsRegisterController',
                data: {
                    pageTitle: 'Register',
                    bodyClass: 'register-page'
                }
            });
    })
    .run(function ($rootScope, authService, jwtHelper, tokenService, $state) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if (!toState.data || !toState.data.authorize) {
                if (authService.isAuthenticated()) {
                    event.preventDefault();
                    $state.go('backend.vault');
                }

                return;
            }

            if (!authService.isAuthenticated()) {
                event.preventDefault();
                authService.logOut();
                $state.go('frontend.login.info');
            }
        });
    });