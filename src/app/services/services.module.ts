import {
    APP_INITIALIZER,
    LOCALE_ID,
    NgModule,
} from '@angular/core';

import { ToasterModule } from 'angular2-toaster';

import { BroadcasterMessagingService } from '../../services/broadcasterMessaging.service';
import { HtmlStorageService } from '../../services/htmlStorage.service';
import { I18nService } from '../../services/i18n.service';
import { MemoryStorageService } from '../../services/memoryStorage.service';
import { WebPlatformUtilsService } from '../../services/webPlatformUtils.service';

import { EventService } from './event.service';
import { OrganizationGuardService } from './organization-guard.service';
import { OrganizationTypeGuardService } from './organization-type-guard.service';
import { RouterService } from './router.service';
import { UnauthGuardService } from './unauth-guard.service';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';
import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';
import { ValidationService } from 'jslib/angular/services/validation.service';

import { Analytics } from 'jslib/misc/analytics';

import { ApiService } from 'jslib/services/api.service';
import { AppIdService } from 'jslib/services/appId.service';
import { AuditService } from 'jslib/services/audit.service';
import { AuthService } from 'jslib/services/auth.service';
import { AzureStorageService } from 'jslib/services/azureStorage.service';
import { CipherService } from 'jslib/services/cipher.service';
import { CollectionService } from 'jslib/services/collection.service';
import { ConsoleLogService } from 'jslib/services/consoleLog.service';
import { ConstantsService } from 'jslib/services/constants.service';
import { ContainerService } from 'jslib/services/container.service';
import { CryptoService } from 'jslib/services/crypto.service';
import { EnvironmentService } from 'jslib/services/environment.service';
import { EventService as EventLoggingService } from 'jslib/services/event.service';
import { ExportService } from 'jslib/services/export.service';
import { FolderService } from 'jslib/services/folder.service';
import { ImportService } from 'jslib/services/import.service';
import { NotificationsService } from 'jslib/services/notifications.service';
import { PasswordGenerationService } from 'jslib/services/passwordGeneration.service';
import { PolicyService } from 'jslib/services/policy.service';
import { SearchService } from 'jslib/services/search.service';
import { SendService } from 'jslib/services/send.service';
import { SettingsService } from 'jslib/services/settings.service';
import { StateService } from 'jslib/services/state.service';
import { SyncService } from 'jslib/services/sync.service';
import { TokenService } from 'jslib/services/token.service';
import { TotpService } from 'jslib/services/totp.service';
import { UserService } from 'jslib/services/user.service';
import { VaultTimeoutService } from 'jslib/services/vaultTimeout.service';
import { WebCryptoFunctionService } from 'jslib/services/webCryptoFunction.service';

import { ApiService as ApiServiceAbstraction } from 'jslib/abstractions/api.service';
import { AppIdService as AppIdServiceAbstraction } from 'jslib/abstractions/appId.service';
import { AuditService as AuditServiceAbstraction } from 'jslib/abstractions/audit.service';
import { AuthService as AuthServiceAbstraction } from 'jslib/abstractions/auth.service';
import { CipherService as CipherServiceAbstraction } from 'jslib/abstractions/cipher.service';
import { CollectionService as CollectionServiceAbstraction } from 'jslib/abstractions/collection.service';
import { CryptoService as CryptoServiceAbstraction } from 'jslib/abstractions/crypto.service';
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from 'jslib/abstractions/cryptoFunction.service';
import { EnvironmentService as EnvironmentServiceAbstraction } from 'jslib/abstractions/environment.service';
import { EventService as EventLoggingServiceAbstraction } from 'jslib/abstractions/event.service';
import { ExportService as ExportServiceAbstraction } from 'jslib/abstractions/export.service';
import { FolderService as FolderServiceAbstraction } from 'jslib/abstractions/folder.service';
import { I18nService as I18nServiceAbstraction } from 'jslib/abstractions/i18n.service';
import { ImportService as ImportServiceAbstraction } from 'jslib/abstractions/import.service';
import { LogService as LogServiceAbstraction } from 'jslib/abstractions/log.service';
import { MessagingService as MessagingServiceAbstraction } from 'jslib/abstractions/messaging.service';
import { NotificationsService as NotificationsServiceAbstraction } from 'jslib/abstractions/notifications.service';
import {
    PasswordGenerationService as PasswordGenerationServiceAbstraction,
} from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from 'jslib/abstractions/platformUtils.service';
import { PolicyService as PolicyServiceAbstraction } from 'jslib/abstractions/policy.service';
import { SearchService as SearchServiceAbstraction } from 'jslib/abstractions/search.service';
import { SendService as SendServiceAbstraction } from 'jslib/abstractions/send.service';
import { SettingsService as SettingsServiceAbstraction } from 'jslib/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib/abstractions/state.service';
import { StorageService as StorageServiceAbstraction } from 'jslib/abstractions/storage.service';
import { SyncService as SyncServiceAbstraction } from 'jslib/abstractions/sync.service';
import { TokenService as TokenServiceAbstraction } from 'jslib/abstractions/token.service';
import { TotpService as TotpServiceAbstraction } from 'jslib/abstractions/totp.service';
import { UserService as UserServiceAbstraction } from 'jslib/abstractions/user.service';
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from 'jslib/abstractions/vaultTimeout.service';

const i18nService = new I18nService(window.navigator.language, 'locales');
const stateService = new StateService();
const broadcasterService = new BroadcasterService();
const messagingService = new BroadcasterMessagingService(broadcasterService);
const platformUtilsService = new WebPlatformUtilsService(i18nService, messagingService);
const storageService: StorageServiceAbstraction = new HtmlStorageService(platformUtilsService);
const secureStorageService: StorageServiceAbstraction = new MemoryStorageService();
const cryptoFunctionService: CryptoFunctionServiceAbstraction = new WebCryptoFunctionService(window,
    platformUtilsService);
const consoleLogService = new ConsoleLogService(false);
const cryptoService = new CryptoService(storageService,
    platformUtilsService.isDev() ? storageService : secureStorageService, cryptoFunctionService, platformUtilsService,
    consoleLogService);
const tokenService = new TokenService(storageService);
const appIdService = new AppIdService(storageService);
const apiService = new ApiService(tokenService, platformUtilsService,
    async (expired: boolean) => messagingService.send('logout', { expired: expired }));
const userService = new UserService(tokenService, storageService);
const settingsService = new SettingsService(userService, storageService);
export let searchService: SearchService = null;
const cipherService = new CipherService(cryptoService, userService, settingsService,
    apiService, storageService, i18nService, () => searchService);
const folderService = new FolderService(cryptoService, userService, apiService, storageService,
    i18nService, cipherService);
const collectionService = new CollectionService(cryptoService, userService, storageService, i18nService);
searchService = new SearchService(cipherService, consoleLogService);
const policyService = new PolicyService(userService, storageService);
const azureStorageService = new AzureStorageService(consoleLogService);
const sendService = new SendService(cryptoService, userService, apiService, azureStorageService, storageService,
    i18nService, cryptoFunctionService);
const vaultTimeoutService = new VaultTimeoutService(cipherService, folderService, collectionService,
    cryptoService, platformUtilsService, storageService, messagingService, searchService, userService, tokenService,
    null, async () => messagingService.send('logout', { expired: false }));
const syncService = new SyncService(userService, apiService, settingsService,
    folderService, cipherService, cryptoService, collectionService, storageService, messagingService, policyService,
    sendService, async (expired: boolean) => messagingService.send('logout', { expired: expired }));
const passwordGenerationService = new PasswordGenerationService(cryptoService, storageService, policyService);
const totpService = new TotpService(storageService, cryptoFunctionService);
const containerService = new ContainerService(cryptoService);
const authService = new AuthService(cryptoService, apiService,
    userService, tokenService, appIdService, i18nService, platformUtilsService, messagingService, vaultTimeoutService,
    consoleLogService);
const exportService = new ExportService(folderService, cipherService, apiService);
const importService = new ImportService(cipherService, folderService, apiService, i18nService, collectionService,
    platformUtilsService);
const notificationsService = new NotificationsService(userService, syncService, appIdService,
    apiService, vaultTimeoutService, async () => messagingService.send('logout', { expired: true }), consoleLogService);
const environmentService = new EnvironmentService(apiService, storageService, notificationsService);
const auditService = new AuditService(cryptoFunctionService, apiService);
const eventLoggingService = new EventLoggingService(storageService, apiService, userService, cipherService);

const analytics = new Analytics(window, () => platformUtilsService.isDev() || platformUtilsService.isSelfHost(),
    platformUtilsService, storageService, appIdService);
containerService.attachToWindow(window);

export function initFactory(): Function {
    return async () => {
        await (storageService as HtmlStorageService).init();
        const isDev = platformUtilsService.isDev();
        if (!isDev && platformUtilsService.isSelfHost()) {
            environmentService.baseUrl = window.location.origin;
        } else {
            environmentService.webVaultUrl = isDev ? 'https://localhost:8080' : null;
            environmentService.notificationsUrl = isDev ? 'http://localhost:61840' :
                'https://notifications.bitwarden.com'; // window.location.origin + '/notifications';
            environmentService.enterpriseUrl = isDev ? 'http://localhost:52313' :
                'https://portal.bitwarden.com'; // window.location.origin + '/portal';
        }
        apiService.setUrls({
            base: isDev ? null : window.location.origin,
            api: isDev ? 'http://localhost:4000' : null,
            identity: isDev ? 'http://localhost:33656' : null,
            events: isDev ? 'http://localhost:46273' : null,

            // Uncomment these (and comment out the above) if you want to target production
            // servers for local development.

            // base: null,
            // api: 'https://api.bitwarden.com',
            // identity: 'https://identity.bitwarden.com',
            // events: 'https://events.bitwarden.com',
        });
        setTimeout(() => notificationsService.init(environmentService), 3000);

        vaultTimeoutService.init(true);
        const locale = await storageService.get<string>(ConstantsService.localeKey);
        await i18nService.init(locale);
        eventLoggingService.init(true);
        authService.init();
        const htmlEl = window.document.documentElement;
        htmlEl.classList.add('locale_' + i18nService.translationLocale);
        let theme = await storageService.get<string>(ConstantsService.themeKey);
        if (theme == null) {
            theme = 'light';
        }
        htmlEl.classList.add('theme_' + theme);
        stateService.save(ConstantsService.disableFaviconKey,
            await storageService.get<boolean>(ConstantsService.disableFaviconKey));
        stateService.save('enableGravatars', await storageService.get<boolean>('enableGravatars'));
    };
}

@NgModule({
    imports: [
        ToasterModule,
    ],
    declarations: [],
    providers: [
        ValidationService,
        AuthGuardService,
        OrganizationGuardService,
        OrganizationTypeGuardService,
        UnauthGuardService,
        RouterService,
        EventService,
        { provide: AuditServiceAbstraction, useValue: auditService },
        { provide: AuthServiceAbstraction, useValue: authService },
        { provide: CipherServiceAbstraction, useValue: cipherService },
        { provide: FolderServiceAbstraction, useValue: folderService },
        { provide: CollectionServiceAbstraction, useValue: collectionService },
        { provide: EnvironmentServiceAbstraction, useValue: environmentService },
        { provide: TotpServiceAbstraction, useValue: totpService },
        { provide: TokenServiceAbstraction, useValue: tokenService },
        { provide: I18nServiceAbstraction, useValue: i18nService },
        { provide: CryptoServiceAbstraction, useValue: cryptoService },
        { provide: PlatformUtilsServiceAbstraction, useValue: platformUtilsService },
        { provide: PasswordGenerationServiceAbstraction, useValue: passwordGenerationService },
        { provide: ApiServiceAbstraction, useValue: apiService },
        { provide: SyncServiceAbstraction, useValue: syncService },
        { provide: UserServiceAbstraction, useValue: userService },
        { provide: MessagingServiceAbstraction, useValue: messagingService },
        { provide: BroadcasterService, useValue: broadcasterService },
        { provide: SettingsServiceAbstraction, useValue: settingsService },
        { provide: VaultTimeoutServiceAbstraction, useValue: vaultTimeoutService },
        { provide: StorageServiceAbstraction, useValue: storageService },
        { provide: StateServiceAbstraction, useValue: stateService },
        { provide: ExportServiceAbstraction, useValue: exportService },
        { provide: SearchServiceAbstraction, useValue: searchService },
        { provide: ImportServiceAbstraction, useValue: importService },
        { provide: NotificationsServiceAbstraction, useValue: notificationsService },
        { provide: CryptoFunctionServiceAbstraction, useValue: cryptoFunctionService },
        { provide: EventLoggingServiceAbstraction, useValue: eventLoggingService },
        { provide: PolicyServiceAbstraction, useValue: policyService },
        { provide: SendServiceAbstraction, useValue: sendService },
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [],
            multi: true,
        },
        {
            provide: LOCALE_ID,
            useFactory: () => i18nService.translationLocale,
            deps: [],
        },
    ],
})
export class ServicesModule {
}
