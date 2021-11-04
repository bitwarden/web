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
import { PasswordRepromptService } from '../../services/passwordReprompt.service';
import { WebPlatformUtilsService } from '../../services/webPlatformUtils.service';

import { EventService } from './event.service';
import { OrganizationGuardService } from './organization-guard.service';
import { OrganizationTypeGuardService } from './organization-type-guard.service';
import { PolicyListService } from './policy-list.service';
import { RouterService } from './router.service';

import { AuthGuardService } from 'jslib-angular/services/auth-guard.service';
import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';
import { LockGuardService } from 'jslib-angular/services/lock-guard.service';
import { ModalService as ModalServiceAbstraction } from 'jslib-angular/services/modal.service';
import { UnauthGuardService } from 'jslib-angular/services/unauth-guard.service';
import { ValidationService } from 'jslib-angular/services/validation.service';

import { ApiService } from 'jslib-common/services/api.service';
import { AppIdService } from 'jslib-common/services/appId.service';
import { AuditService } from 'jslib-common/services/audit.service';
import { AuthService } from 'jslib-common/services/auth.service';
import { CipherService } from 'jslib-common/services/cipher.service';
import { CollectionService } from 'jslib-common/services/collection.service';
import { ConsoleLogService } from 'jslib-common/services/consoleLog.service';
import { ContainerService } from 'jslib-common/services/container.service';
import { CryptoService } from 'jslib-common/services/crypto.service';
import { EnvironmentService } from 'jslib-common/services/environment.service';
import { EventService as EventLoggingService } from 'jslib-common/services/event.service';
import { ExportService } from 'jslib-common/services/export.service';
import { FileUploadService } from 'jslib-common/services/fileUpload.service';
import { FolderService } from 'jslib-common/services/folder.service';
import { ImportService } from 'jslib-common/services/import.service';
import { NotificationsService } from 'jslib-common/services/notifications.service';
import { OrganizationService } from 'jslib-common/services/organization.service';
import { PasswordGenerationService } from 'jslib-common/services/passwordGeneration.service';
import { PolicyService } from 'jslib-common/services/policy.service';
import { ProviderService } from 'jslib-common/services/provider.service';
import { SearchService } from 'jslib-common/services/search.service';
import { SendService } from 'jslib-common/services/send.service';
import { SettingsService } from 'jslib-common/services/settings.service';
import { StateService } from 'jslib-common/services/state.service';
import { SyncService } from 'jslib-common/services/sync.service';
import { TokenService } from 'jslib-common/services/token.service';
import { TotpService } from 'jslib-common/services/totp.service';
import { VaultTimeoutService } from 'jslib-common/services/vaultTimeout.service';
import { WebCryptoFunctionService } from 'jslib-common/services/webCryptoFunction.service';

import { ApiService as ApiServiceAbstraction } from 'jslib-common/abstractions/api.service';
import { AuditService as AuditServiceAbstraction } from 'jslib-common/abstractions/audit.service';
import { AuthService as AuthServiceAbstraction } from 'jslib-common/abstractions/auth.service';
import { CipherService as CipherServiceAbstraction } from 'jslib-common/abstractions/cipher.service';
import { CollectionService as CollectionServiceAbstraction } from 'jslib-common/abstractions/collection.service';
import { CryptoService as CryptoServiceAbstraction } from 'jslib-common/abstractions/crypto.service';
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService as EnvironmentServiceAbstraction, Urls } from 'jslib-common/abstractions/environment.service';
import { EventService as EventLoggingServiceAbstraction } from 'jslib-common/abstractions/event.service';
import { ExportService as ExportServiceAbstraction } from 'jslib-common/abstractions/export.service';
import { FileUploadService as FileUploadServiceAbstraction } from 'jslib-common/abstractions/fileUpload.service';
import { FolderService as FolderServiceAbstraction } from 'jslib-common/abstractions/folder.service';
import { I18nService as I18nServiceAbstraction } from 'jslib-common/abstractions/i18n.service';
import { ImportService as ImportServiceAbstraction } from 'jslib-common/abstractions/import.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { MessagingService as MessagingServiceAbstraction } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService as NotificationsServiceAbstraction } from 'jslib-common/abstractions/notifications.service';
import { OrganizationService as OrganizationServiceAbstraction } from 'jslib-common/abstractions/organization.service';
import {
    PasswordGenerationService as PasswordGenerationServiceAbstraction,
} from 'jslib-common/abstractions/passwordGeneration.service';
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService as PolicyServiceAbstraction } from 'jslib-common/abstractions/policy.service';
import { ProviderService as ProviderServiceAbstraction } from 'jslib-common/abstractions/provider.service';
import { SearchService as SearchServiceAbstraction } from 'jslib-common/abstractions/search.service';
import { SendService as SendServiceAbstraction } from 'jslib-common/abstractions/send.service';
import { SettingsService as SettingsServiceAbstraction } from 'jslib-common/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib-common/abstractions/state.service';
import { StorageService as StorageServiceAbstraction } from 'jslib-common/abstractions/storage.service';
import { SyncService as SyncServiceAbstraction } from 'jslib-common/abstractions/sync.service';
import { TokenService as TokenServiceAbstraction } from 'jslib-common/abstractions/token.service';
import { TotpService as TotpServiceAbstraction } from 'jslib-common/abstractions/totp.service';
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from 'jslib-common/abstractions/vaultTimeout.service';
import { ModalService } from './modal.service';

import { ThemeType } from 'jslib-common/enums/themeType';

const i18nService = new I18nService(window.navigator.language, 'locales');
const broadcasterService = new BroadcasterService();
const messagingService = new BroadcasterMessagingService(broadcasterService);
const consoleLogService = new ConsoleLogService(false);
const platformUtilsService = new WebPlatformUtilsService(i18nService, messagingService, consoleLogService, () => stateService);
const storageService: StorageServiceAbstraction = new HtmlStorageService(platformUtilsService);
const secureStorageService: StorageServiceAbstraction = new MemoryStorageService();
const stateService: StateServiceAbstraction = new StateService(storageService, secureStorageService, consoleLogService);
const organizationService: OrganizationServiceAbstraction = new OrganizationService(stateService);
const providerService: ProviderServiceAbstraction = new ProviderService(stateService);
const cryptoFunctionService: CryptoFunctionServiceAbstraction = new WebCryptoFunctionService(window,
    platformUtilsService);
const cryptoService = new CryptoService(cryptoFunctionService, platformUtilsService,
    consoleLogService, stateService);
const tokenService = new TokenService(stateService);
const appIdService = new AppIdService(storageService);
const environmentService = new EnvironmentService(stateService);
const apiService = new ApiService(tokenService, platformUtilsService, environmentService,
    async (expired: boolean) => messagingService.send('logout', { expired: expired }));
const settingsService = new SettingsService(stateService);
export let searchService: SearchService = null;
const fileUploadService = new FileUploadService(consoleLogService, apiService);
const cipherService = new CipherService(cryptoService, settingsService,
    apiService, fileUploadService, i18nService, () => searchService, consoleLogService, stateService);
const folderService = new FolderService(cryptoService, apiService,
    i18nService, cipherService, stateService);
const collectionService = new CollectionService(cryptoService, i18nService, stateService);
searchService = new SearchService(cipherService, consoleLogService, i18nService);
const policyService = new PolicyService(stateService, organizationService, apiService);
const sendService = new SendService(cryptoService, apiService, fileUploadService,
    i18nService, cryptoFunctionService, stateService);
const vaultTimeoutService = new VaultTimeoutService(cipherService, folderService, collectionService,
    cryptoService, platformUtilsService, messagingService, searchService, tokenService,
    policyService, stateService, null, async () => messagingService.send('logout', { expired: false }));
const syncService = new SyncService(apiService, settingsService,
    folderService, cipherService, cryptoService, collectionService, messagingService, policyService,
    sendService, consoleLogService, async (expired: boolean) => messagingService.send('logout', { expired: expired }),
    stateService, organizationService, providerService);
const passwordGenerationService = new PasswordGenerationService(cryptoService, policyService, stateService);
const totpService = new TotpService(cryptoFunctionService, consoleLogService, stateService);
const containerService = new ContainerService(cryptoService);
const authService = new AuthService(cryptoService, apiService,
    tokenService, appIdService, i18nService, platformUtilsService, messagingService, vaultTimeoutService,
    consoleLogService, cryptoFunctionService, stateService);
const exportService = new ExportService(folderService, cipherService, apiService, cryptoService);
const importService = new ImportService(cipherService, folderService, apiService, i18nService, collectionService,
    platformUtilsService, cryptoService);
const notificationsService = new NotificationsService(syncService, appIdService, apiService, vaultTimeoutService,
    environmentService, async () => messagingService.send('logout', { expired: true }), consoleLogService,
    stateService);
const auditService = new AuditService(cryptoFunctionService, apiService);
const eventLoggingService = new EventLoggingService(apiService, cipherService,
    stateService, consoleLogService, organizationService);

containerService.attachToWindow(window);

export function initFactory(): Function {
    return async () => {
        await (storageService as HtmlStorageService).init();

        const urls = process.env.URLS as Urls;
        urls.base ??= window.location.origin;
        environmentService.setUrls(urls, false);

        setTimeout(() => notificationsService.init(), 3000);

        vaultTimeoutService.init(true);
        const locale = await stateService.getLocale();
        await i18nService.init(locale);
        eventLoggingService.init(true);
        authService.init();
        const htmlEl = window.document.documentElement;
        htmlEl.classList.add('locale_' + i18nService.translationLocale);
        // Initial theme is set in index.html which must be updated if there are any changes to theming logic
        platformUtilsService.onDefaultSystemThemeChange(async sysTheme => {
            const bwTheme = await stateService.getTheme();
            if (bwTheme === ThemeType.System) {
                htmlEl.classList.remove('theme_' + ThemeType.Light, 'theme_' + ThemeType.Dark);
                htmlEl.classList.add('theme_' + sysTheme);
            }
        });
        // TODO: stateService refactor: Either make these global instead of account level, or move elsewhere.
        // await stateService.setDisableFavicon(await storageService.get<boolean>(StorageKey.DisableFavicon));
        // await stateService.setEnableGravitars(await storageService.get<boolean>('enableGravatars'));
    };
}

@NgModule({
    imports: [
        ToasterModule,
    ],
    declarations: [],
    providers: [
        AuthGuardService,
        EventService,
        LockGuardService,
        OrganizationGuardService,
        OrganizationTypeGuardService,
        PolicyListService,
        RouterService,
        UnauthGuardService,
        ValidationService,
        { provide: ApiServiceAbstraction, useValue: apiService },
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [],
            multi: true,
        },
        { provide: AuditServiceAbstraction, useValue: auditService },
        { provide: AuthServiceAbstraction, useValue: authService },
        { provide: BroadcasterService, useValue: broadcasterService },
        { provide: CipherServiceAbstraction, useValue: cipherService },
        { provide: CollectionServiceAbstraction, useValue: collectionService },
        { provide: CryptoFunctionServiceAbstraction, useValue: cryptoFunctionService },
        { provide: CryptoServiceAbstraction, useValue: cryptoService },
        { provide: EnvironmentServiceAbstraction, useValue: environmentService },
        { provide: EventLoggingServiceAbstraction, useValue: eventLoggingService },
        { provide: ExportServiceAbstraction, useValue: exportService },
        { provide: FileUploadServiceAbstraction, useValue: fileUploadService },
        { provide: FolderServiceAbstraction, useValue: folderService },
        { provide: I18nServiceAbstraction, useValue: i18nService },
        { provide: ImportServiceAbstraction, useValue: importService },
        {
            provide: LOCALE_ID,
            useFactory: () => i18nService.translationLocale,
            deps: [],
        },
        { provide: LogService, useValue: consoleLogService },
        { provide: LogService, useValue: consoleLogService },
        { provide: MessagingServiceAbstraction, useValue: messagingService },
        { provide: ModalServiceAbstraction, useClass: ModalService },
        { provide: NotificationsServiceAbstraction, useValue: notificationsService },
        { provide: OrganizationServiceAbstraction, useValue: organizationService },
        { provide: PasswordGenerationServiceAbstraction, useValue: passwordGenerationService },
        { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
        { provide: PlatformUtilsServiceAbstraction, useValue: platformUtilsService },
        { provide: PolicyServiceAbstraction, useValue: policyService },
        { provide: ProviderServiceAbstraction, useValue: providerService },
        { provide: SearchServiceAbstraction, useValue: searchService },
        { provide: SendServiceAbstraction, useValue: sendService },
        { provide: SettingsServiceAbstraction, useValue: settingsService },
        { provide: StateServiceAbstraction, useValue: stateService },
        { provide: StorageServiceAbstraction, useValue: storageService },
        { provide: SyncServiceAbstraction, useValue: syncService },
        { provide: TokenServiceAbstraction, useValue: tokenService },
        { provide: TotpServiceAbstraction, useValue: totpService },
        { provide: VaultTimeoutServiceAbstraction, useValue: vaultTimeoutService },
    ],
})
export class ServicesModule {
}
