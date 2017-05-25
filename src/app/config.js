angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider, jwtOptionsProvider,
        $uibTooltipProvider, toastrConfig, $locationProvider, $qProvider, stripeProvider, appSettings) {
        $qProvider.errorOnUnhandledRejections(false);
        $locationProvider.hashPrefix('');
        jwtOptionsProvider.config({
            urlParam: 'access_token3',
            whiteListedDomains: ['api.bitwarden.com', 'preview-api.bitwarden.com', 'localhost', '192.168.1.8']
        });
        var refreshPromise;
        jwtInterceptorProvider.tokenGetter = /*@ngInject*/ function (options, tokenService, authService) {
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

            refreshPromise = authService.refreshAccessToken().then(function (newToken) {
                refreshPromise = null;
                return newToken || token;
            });
            return refreshPromise;
        };

        stripeProvider.setPublishableKey(appSettings.stripeKey);

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
                data: { pageTitle: 'My Vault' },
                params: {
                    refreshFromServer: false
                }
            })
            .state('backend.user.shared', {
                url: '^/shared',
                templateUrl: 'app/vault/views/vaultShared.html',
                controller: 'vaultSharedController',
                data: { pageTitle: 'Shared' }
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
            .state('backend.user.settingsCreateOrg', {
                url: '^/settings/create-organization',
                templateUrl: 'app/settings/views/settingsCreateOrganization.html',
                controller: 'settingsCreateOrganizationController',
                data: { pageTitle: 'Create Organization' }
            })
            .state('backend.user.tools', {
                url: '^/tools',
                templateUrl: 'app/tools/views/tools.html',
                controller: 'toolsController',
                data: { pageTitle: 'Tools' }
            })
            .state('backend.user.toolsReportBreach', {
                url: '^/reports/breach',
                templateUrl: 'app/tools/views/toolsReportBreach.html',
                controller: 'toolsReportBreachController',
                data: { pageTitle: 'Data Breach Report' }
            })
            .state('backend.user.apps', {
                url: '^/apps',
                templateUrl: 'app/views/apps.html',
                controller: 'appsController',
                data: { pageTitle: 'Get the Apps' }
            })
            .state('backend.org', {
                templateUrl: 'app/views/organizationLayout.html',
                abstract: true
            })
            .state('backend.org.dashboard', {
                url: '^/organization/:orgId',
                templateUrl: 'app/organization/views/organizationDashboard.html',
                controller: 'organizationDashboardController',
                data: { pageTitle: 'Organization Dashboard' }
            })
            .state('backend.org.people', {
                url: '/organization/:orgId/people',
                templateUrl: 'app/organization/views/organizationPeople.html',
                controller: 'organizationPeopleController',
                data: { pageTitle: 'Organization People' }
            })
            .state('backend.org.collections', {
                url: '/organization/:orgId/collections',
                templateUrl: 'app/organization/views/organizationCollections.html',
                controller: 'organizationCollectionsController',
                data: { pageTitle: 'Organization Collections' }
            })
            .state('backend.org.settings', {
                url: '/organization/:orgId/settings',
                templateUrl: 'app/organization/views/organizationSettings.html',
                controller: 'organizationSettingsController',
                data: { pageTitle: 'Organization Settings' }
            })
            .state('backend.org.billing', {
                url: '/organization/:orgId/billing',
                templateUrl: 'app/organization/views/organizationBilling.html',
                controller: 'organizationBillingController',
                data: { pageTitle: 'Organization Billing' }
            })
            .state('backend.org.vault', {
                url: '/organization/:orgId/vault',
                templateUrl: 'app/organization/views/organizationVault.html',
                controller: 'organizationVaultController',
                data: { pageTitle: 'Organization Vault' }
            })
            .state('backend.org.groups', {
                url: '/organization/:orgId/groups',
                templateUrl: 'app/organization/views/organizationGroups.html',
                controller: 'organizationGroupsController',
                data: { pageTitle: 'Organization Groups' }
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
                    returnState: null,
                    email: null
                },
                data: {
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.login.info', {
                url: '^/?org',
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
                url: '^/register?org',
                templateUrl: 'app/accounts/views/accountsRegister.html',
                controller: 'accountsRegisterController',
                params: {
                    returnState: null,
                    email: null
                },
                data: {
                    pageTitle: 'Register',
                    bodyClass: 'register-page'
                }
            })
            .state('frontend.organizationAccept', {
                url: '^/accept-organization?organizationId&organizationUserId&token&email&organizationName',
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
        $rootScope.$on('$stateChangeSuccess', function () {
            $('html, body').animate({ scrollTop: 0 }, 200);
        });

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
                return;
            }

            if (!authService.isAuthenticated()) {
                event.preventDefault();
                authService.logOut();
                $state.go('frontend.login.info');
                return;
            }

            // user is guaranteed to be authenticated becuase of previous check
            if (toState.name.indexOf('backend.org.') > -1 && toParams.orgId) {
                // clear vault rootScope when visiting org admin section
                $rootScope.vaultLogins = $rootScope.vaultFolders = null;

                authService.getUserProfile().then(function (profile) {
                    var orgs = profile.organizations;
                    if (!orgs || !(toParams.orgId in orgs) || orgs[toParams.orgId].status !== 2 ||
                        orgs[toParams.orgId].type === 2) {
                        event.preventDefault();
                        $state.go('backend.user.vault');
                    }
                });
            }
        });
    });