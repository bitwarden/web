angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider, jwtOptionsProvider,
        $uibTooltipProvider, toastrConfig, $locationProvider, $qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
        $locationProvider.hashPrefix('');
        jwtOptionsProvider.config({
            urlParam: 'access_token2',
            whiteListedDomains: ['api.bitwarden.com', 'localhost']
        });
        var refreshPromise;
        jwtInterceptorProvider.tokenGetter = /*@ngInject*/ function (options, appSettings, tokenService, apiService, jwtHelper, $q) {
            if (options.url.indexOf(appSettings.apiUri) !== 0) {
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
            .state('backend.user', {
                templateUrl: 'app/views/userLayout.html',
                abstract: true
            })
            .state('backend.user.vault', {
                url: '^/vault',
                templateUrl: 'app/vault/views/vault.html',
                controller: 'vaultController',
                data: { pageTitle: 'My Vault' }
            })
            .state('backend.user.settings', {
                url: '^/settings',
                templateUrl: 'app/settings/views/settings.html',
                controller: 'settingsController',
                data: { pageTitle: 'Settings' }
            })
            .state('backend.user.settingsDomains', {
                url: '^/settings/domains',
                templateUrl: 'app/settings/views/settingsDomains.html',
                controller: 'settingsDomainsController',
                data: { pageTitle: 'Domain Settings' }
            })
            .state('backend.user.tools', {
                url: '^/tools',
                templateUrl: 'app/tools/views/tools.html',
                controller: 'toolsController',
                data: { pageTitle: 'Tools' }
            })
            .state('backend.user.sharing', {
                url: '^/sharing',
                templateUrl: 'app/sharing/views/sharing.html',
                controller: 'sharingController',
                data: { pageTitle: 'Sharing Center' }
            })
            .state('backend.org', {
                templateUrl: 'app/views/organizationLayout.html',
                abstract: true
            })
            .state('backend.org.dashboard', {
                url: '^/organization/:orgId',
                templateUrl: 'app/organization/views/organizationDashboard.html',
                controller: 'organizationDashboardController',
                data: { pageTitle: 'Dashboard' }
            })
            .state('backend.org.people', {
                url: '/organization/:orgId/people',
                templateUrl: 'app/organization/views/organizationPeople.html',
                controller: 'organizationPeopleController',
                data: { pageTitle: 'People' }
            })
            .state('backend.org.subvaults', {
                url: '/organization/:orgId/subvaults',
                templateUrl: 'app/organization/views/organizationSubvaults.html',
                controller: 'organizationSubvaultsController',
                data: { pageTitle: 'Subvaults' }
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
                params: {
                    returnState: null
                },
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
                params: {
                    returnState: null
                },
                data: {
                    pageTitle: 'Register',
                    bodyClass: 'register-page'
                }
            })
            .state('frontend.organizationAccept', {
                url: '^/accept-organization?organizationId&organizationUserId&token',
                templateUrl: 'app/accounts/views/accountsOrganizationAccept.html',
                controller: 'accountsOrganizationAcceptController',
                data: {
                    pageTitle: 'Accept Organization Invite',
                    bodyClass: 'login-page',
                    skipAuthorize: true
                }
            });
    })
    .run(function ($rootScope, authService, $state) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if (!toState.data || !toState.data.authorize) {
                if (toState.data && toState.data.skipAuthorize) {
                    return;
                }

                if (!authService.isAuthenticated()) {
                    return;
                }

                event.preventDefault();
                $state.go('backend.user.vault');
            }

            if (!authService.isAuthenticated()) {
                event.preventDefault();
                authService.logOut();
                $state.go('frontend.login.info');
            }
        });
    });