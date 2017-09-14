angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider, jwtOptionsProvider,
        $uibTooltipProvider, toastrConfig, $locationProvider, $qProvider, appSettings
        // @if !selfHosted
        , stripeProvider
        // @endif
    ) {
        angular.extend(appSettings, window.bitwardenAppSettings);

        $qProvider.errorOnUnhandledRejections(false);
        $locationProvider.hashPrefix('');
        jwtOptionsProvider.config({
            // Using Content-Language header since it is unused and is a CORS-safelisted header. This avoids pre-flights.
            authHeader: 'Content-Language',
            whiteListedDomains: appSettings.whitelistDomains
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

        // @if !selfHosted
        stripeProvider.setPublishableKey(appSettings.stripeKey);
        // @endif

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

        // stop IE from caching get requests
        if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }
            $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
            $httpProvider.defaults.headers.get.Pragma = 'no-cache';
        }

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
                data: {
                    pageTitle: 'My Vault',
                    controlSidebar: true
                },
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
            .state('backend.user.settingsTwoStep', {
                url: '^/settings/two-step',
                templateUrl: 'app/settings/views/settingsTwoStep.html',
                controller: 'settingsTwoStepController',
                data: { pageTitle: 'Two-step Login' }
            })
            .state('backend.user.settingsCreateOrg', {
                url: '^/settings/create-organization',
                templateUrl: 'app/settings/views/settingsCreateOrganization.html',
                controller: 'settingsCreateOrganizationController',
                data: { pageTitle: 'Create Organization' }
            })
            .state('backend.user.settingsBilling', {
                url: '^/settings/billing',
                templateUrl: 'app/settings/views/settingsBilling.html',
                controller: 'settingsBillingController',
                data: { pageTitle: 'Billing' }
            })
            .state('backend.user.settingsPremium', {
                url: '^/settings/premium',
                templateUrl: 'app/settings/views/settingsPremium.html',
                controller: 'settingsPremiumController',
                data: { pageTitle: 'Go Premium' }
            })
            .state('backend.user.tools', {
                url: '^/tools',
                templateUrl: 'app/tools/views/tools.html',
                controller: 'toolsController',
                data: { pageTitle: 'Tools' }
            })
            .state('backend.user.reportsBreach', {
                url: '^/reports/breach',
                templateUrl: 'app/reports/views/reportsBreach.html',
                controller: 'reportsBreachController',
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
                    email: null,
                    premium: null,
                    org: null
                },
                data: {
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.login.info', {
                url: '^/?org&premium&email',
                templateUrl: 'app/accounts/views/accountsLoginInfo.html',
                data: {
                    pageTitle: 'Log In'
                }
            })
            .state('frontend.login.twoFactor', {
                url: '^/two-step?org&premium&email',
                templateUrl: 'app/accounts/views/accountsLoginTwoFactor.html',
                data: {
                    pageTitle: 'Log In (Two-step)'
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
            .state('frontend.recover-delete', {
                url: '^/recover-delete',
                templateUrl: 'app/accounts/views/accountsRecoverDelete.html',
                controller: 'accountsRecoverDeleteController',
                data: {
                    pageTitle: 'Delete Account',
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.verify-recover-delete', {
                url: '^/verify-recover-delete?userId&token&email',
                templateUrl: 'app/accounts/views/accountsVerifyRecoverDelete.html',
                controller: 'accountsVerifyRecoverDeleteController',
                data: {
                    pageTitle: 'Confirm Delete Account',
                    bodyClass: 'login-page'
                }
            })
            .state('frontend.register', {
                url: '^/register?org&premium',
                templateUrl: 'app/accounts/views/accountsRegister.html',
                controller: 'accountsRegisterController',
                params: {
                    returnState: null,
                    email: null,
                    org: null,
                    premium: null
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
            })
            .state('frontend.verifyEmail', {
                url: '^/verify-email?userId&token',
                templateUrl: 'app/accounts/views/accountsVerifyEmail.html',
                controller: 'accountsVerifyEmailController',
                data: {
                    pageTitle: 'Verifying Email',
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