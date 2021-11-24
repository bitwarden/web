import {
    APP_INITIALIZER,
    Injector,
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
import { ConstantsService } from 'jslib-common/services/constants.service';
import { ContainerService } from 'jslib-common/services/container.service';
import { CryptoService } from 'jslib-common/services/crypto.service';
import { EnvironmentService } from 'jslib-common/services/environment.service';
import { EventService as EventLoggingService } from 'jslib-common/services/event.service';
import { ExportService } from 'jslib-common/services/export.service';
import { FileUploadService } from 'jslib-common/services/fileUpload.service';
import { FolderService } from 'jslib-common/services/folder.service';
import { ImportService } from 'jslib-common/services/import.service';
import { KeyConnectorService } from 'jslib-common/services/keyConnector.service';
import { NotificationsService } from 'jslib-common/services/notifications.service';
import { PasswordGenerationService } from 'jslib-common/services/passwordGeneration.service';
import { PolicyService } from 'jslib-common/services/policy.service';
import { SearchService } from 'jslib-common/services/search.service';
import { SendService } from 'jslib-common/services/send.service';
import { SettingsService } from 'jslib-common/services/settings.service';
import { StateService } from 'jslib-common/services/state.service';
import { SyncService } from 'jslib-common/services/sync.service';
import { TokenService } from 'jslib-common/services/token.service';
import { TotpService } from 'jslib-common/services/totp.service';
import { UserService } from 'jslib-common/services/user.service';
import { UserVerificationService } from 'jslib-common/services/userVerification.service';
import { VaultTimeoutService } from 'jslib-common/services/vaultTimeout.service';
import { WebCryptoFunctionService } from 'jslib-common/services/webCryptoFunction.service';

import { ApiService as ApiServiceAbstraction } from 'jslib-common/abstractions/api.service';
import { AppIdService as AppIdServiceAbstraction } from 'jslib-common/abstractions/appId.service';
import { AuditService as AuditServiceAbstraction } from 'jslib-common/abstractions/audit.service';
import { AuthService as AuthServiceAbstraction } from 'jslib-common/abstractions/auth.service';
import { BroadcasterService as BroadcasterServiceAbstraction } from 'jslib-common/abstractions/broadcaster.service';
import { CipherService as CipherServiceAbstraction } from 'jslib-common/abstractions/cipher.service';
import { CollectionService as CollectionServiceAbstraction } from 'jslib-common/abstractions/collection.service';
import { CryptoService as CryptoServiceAbstraction } from 'jslib-common/abstractions/crypto.service';
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService as EnvironmentServiceAbstraction, Urls } from 'jslib-common/abstractions/environment.service';
import { EventService as EventLoggingServiceAbstraction } from 'jslib-common/abstractions/event.service';
import { ExportService as ExportServiceAbstraction } from 'jslib-common/abstractions/export.service';
import { FileUploadService as FileUploadServiceAbstraction }  from 'jslib-common/abstractions/fileUpload.service';
import { FolderService as FolderServiceAbstraction } from 'jslib-common/abstractions/folder.service';
import { I18nService as I18nServiceAbstraction } from 'jslib-common/abstractions/i18n.service';
import { ImportService as ImportServiceAbstraction } from 'jslib-common/abstractions/import.service';
import { KeyConnectorService as KeyConnectorServiceAbstraction } from 'jslib-common/abstractions/keyConnector.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { MessagingService as MessagingServiceAbstraction } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService as NotificationsServiceAbstraction } from 'jslib-common/abstractions/notifications.service';
import {
    PasswordGenerationService as PasswordGenerationServiceAbstraction,
} from 'jslib-common/abstractions/passwordGeneration.service';
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService as PolicyServiceAbstraction } from 'jslib-common/abstractions/policy.service';
import { SearchService as SearchServiceAbstraction } from 'jslib-common/abstractions/search.service';
import { SendService as SendServiceAbstraction } from 'jslib-common/abstractions/send.service';
import { SettingsService as SettingsServiceAbstraction } from 'jslib-common/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib-common/abstractions/state.service';
import { StorageService as StorageServiceAbstraction } from 'jslib-common/abstractions/storage.service';
import { SyncService as SyncServiceAbstraction } from 'jslib-common/abstractions/sync.service';
import { TokenService as TokenServiceAbstraction } from 'jslib-common/abstractions/token.service';
import { TotpService as TotpServiceAbstraction } from 'jslib-common/abstractions/totp.service';
import { UserService as UserServiceAbstraction } from 'jslib-common/abstractions/user.service';
import { UserVerificationService as UserVerificationServiceAbstraction } from 'jslib-common/abstractions/userVerification.service';
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from 'jslib-common/abstractions/vaultTimeout.service';

import { ModalService } from './modal.service';

import { ThemeType } from 'jslib-common/enums/themeType';

export function initFactory(window: Window, storageService: StorageServiceAbstraction,
    environmentService: EnvironmentServiceAbstraction, notificationsService: NotificationsServiceAbstraction,
    vaultTimeoutService: VaultTimeoutService, i18nService: I18nService, eventLoggingService: EventLoggingService,
    authService: AuthService, stateService: StateServiceAbstraction,
    platformUtilsService: PlatformUtilsServiceAbstraction, cryptoService: CryptoServiceAbstraction): Function {
    return async () => {
        await (storageService as HtmlStorageService).init();

        const urls = process.env.URLS as Urls;
        urls.base ??= window.location.origin;
        environmentService.setUrls(urls, false);

        setTimeout(() => notificationsService.init(), 3000);

        vaultTimeoutService.init(true);
        const locale = await storageService.get<string>(ConstantsService.localeKey);
        await i18nService.init(locale);
        eventLoggingService.init(true);
        authService.init();
        const htmlEl = window.document.documentElement;
        htmlEl.classList.add('locale_' + i18nService.translationLocale);

        // Initial theme is set in index.html which must be updated if there are any changes to theming logic
        platformUtilsService.onDefaultSystemThemeChange(async sysTheme => {
            const bwTheme = await storageService.get<ThemeType>(ConstantsService.themeKey);
            if (bwTheme === ThemeType.System) {
                htmlEl.classList.remove('theme_' + ThemeType.Light, 'theme_' + ThemeType.Dark);
                htmlEl.classList.add('theme_' + sysTheme);
            }
        });

        stateService.save(ConstantsService.disableFaviconKey,
            await storageService.get<boolean>(ConstantsService.disableFaviconKey));
        stateService.save('enableGravatars', await storageService.get<boolean>('enableGravatars'));

        const containerService = new ContainerService(cryptoService);
        containerService.attachToWindow(window);
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
        LockGuardService,
        PolicyListService,
        { provide: 'WINDOW', useValue: window },
        {
            provide: AppIdServiceAbstraction,
            useClass: AppIdService,
            deps: [StorageServiceAbstraction],
        },
        { provide: ModalServiceAbstraction, useClass: ModalService },
        {
            provide: AuditServiceAbstraction,
            useClass: AuditService,
            deps: [CryptoFunctionServiceAbstraction, ApiServiceAbstraction],
        },
        {
            provide: AuthServiceAbstraction,
            useClass: AuthService,
            deps: [
                CryptoServiceAbstraction,
                ApiServiceAbstraction,
                UserServiceAbstraction,
                TokenServiceAbstraction,
                AppIdServiceAbstraction,
                I18nServiceAbstraction,
                PlatformUtilsServiceAbstraction,
                MessagingServiceAbstraction,
                VaultTimeoutServiceAbstraction,
                LogService,
                CryptoFunctionServiceAbstraction,
                EnvironmentServiceAbstraction,
                KeyConnectorServiceAbstraction,
            ],
        },
        {
            provide: CipherServiceAbstraction,
            useFactory: (cryptoService: CryptoServiceAbstraction, userService: UserServiceAbstraction,
                settingsService: SettingsServiceAbstraction, apiService: ApiServiceAbstraction,
                fileUploadService: FileUploadServiceAbstraction, storageService: StorageServiceAbstraction,
                i18nService: I18nServiceAbstraction, injector: Injector, logService: LogService) =>
                new CipherService(cryptoService, userService, settingsService, apiService, fileUploadService,
                    storageService, i18nService, () => injector.get(SearchServiceAbstraction), logService),
            deps: [
                CryptoServiceAbstraction,
                UserServiceAbstraction,
                SettingsServiceAbstraction,
                ApiServiceAbstraction,
                FileUploadServiceAbstraction,
                StorageServiceAbstraction,
                I18nServiceAbstraction,
                Injector, // TODO: Get rid of this circular dependency!
                LogService,
            ],
        },
        {
            provide: FolderServiceAbstraction,
            useClass: FolderService,
            deps: [
                CryptoServiceAbstraction,
                UserServiceAbstraction,
                ApiServiceAbstraction,
                StorageServiceAbstraction,
                I18nServiceAbstraction,
                CipherServiceAbstraction,
            ],
        },
        { provide: LogService, useFactory: () => new ConsoleLogService(false) },
        {
            provide: CollectionServiceAbstraction,
            useClass: CollectionService,
            deps: [
                CryptoServiceAbstraction,
                UserServiceAbstraction,
                StorageServiceAbstraction,
                I18nServiceAbstraction,
            ],
        },
        {
            provide: EnvironmentServiceAbstraction,
            useClass: EnvironmentService,
            deps: [StorageServiceAbstraction],
        },
        {
            provide: TotpServiceAbstraction,
            useClass: TotpService,
            deps: [
                StorageServiceAbstraction,
                CryptoFunctionServiceAbstraction,
                LogService,
            ],
        },
        { provide: TokenServiceAbstraction, useClass: TokenService, deps: [StorageServiceAbstraction] },
        {
            provide: I18nServiceAbstraction,
            useFactory: (window: Window) => new I18nService(window.navigator.language, 'locales'),
            deps: [ 'WINDOW' ],
        },
        {
            provide: CryptoServiceAbstraction,
            useFactory: (storageService: StorageServiceAbstraction, secureStorageService: StorageServiceAbstraction,
                cryptoFunctionService: CryptoFunctionServiceAbstraction,
                platformUtilsService: PlatformUtilsServiceAbstraction, logService: LogService) => {
                const storageImplementation = platformUtilsService.isDev() ? storageService : secureStorageService;
                return new CryptoService(storageService, storageImplementation, cryptoFunctionService,
                    platformUtilsService, logService);
            },
            deps: [
                StorageServiceAbstraction,
                'SECURE_STORAGE',
                CryptoFunctionServiceAbstraction,
                PlatformUtilsServiceAbstraction,
                LogService,
            ],
        },
        {
            provide: PlatformUtilsServiceAbstraction,
            useFactory: (i18nService: I18nServiceAbstraction, messagingService: MessagingServiceAbstraction,
                logService: LogService, injector: Injector) => new WebPlatformUtilsService(i18nService,
                    messagingService, logService, () => injector.get(StorageServiceAbstraction)),
            deps: [
                I18nServiceAbstraction,
                MessagingServiceAbstraction,
                LogService,
                Injector, // TODO: Get rid of circular dependency!
            ],
        },
        {
            provide: PasswordGenerationServiceAbstraction,
            useClass: PasswordGenerationService,
            deps: [
                CryptoServiceAbstraction,
                StorageServiceAbstraction,
                PolicyServiceAbstraction,
            ],
        },
        {
            provide: ApiServiceAbstraction,
            useFactory: (tokenService: TokenServiceAbstraction, platformUtilsService: PlatformUtilsServiceAbstraction,
                environmentService: EnvironmentServiceAbstraction, messagingService: MessagingServiceAbstraction) =>
                new ApiService(tokenService, platformUtilsService, environmentService,
                    async (expired: boolean) => messagingService.send('logout', { expired: expired })),
            deps: [
                TokenServiceAbstraction,
                PlatformUtilsServiceAbstraction,
                EnvironmentServiceAbstraction,
                MessagingServiceAbstraction,
            ],
        },
        {
            provide: FileUploadServiceAbstraction,
            useClass: FileUploadService,
            deps: [
                LogService,
                ApiServiceAbstraction,
            ],
        },
        {
            provide: SyncServiceAbstraction,
            useFactory: (userService: UserServiceAbstraction, apiService: ApiServiceAbstraction,
                settingsService: SettingsServiceAbstraction, folderService: FolderServiceAbstraction,
                cipherService: CipherServiceAbstraction, cryptoService: CryptoServiceAbstraction,
                collectionService: CollectionServiceAbstraction, storageService: StorageServiceAbstraction,
                messagingService: MessagingServiceAbstraction, policyService: PolicyServiceAbstraction,
                sendService: SendServiceAbstraction, logService: LogService, tokenService: TokenService,
                keyConnectorService: KeyConnectorServiceAbstraction) => new SyncService(userService, apiService,
                    settingsService, folderService, cipherService, cryptoService, collectionService, storageService,
                    messagingService, policyService, sendService, logService, tokenService, keyConnectorService,
                    async (expired: boolean) => messagingService.send('logout', { expired: expired })),
            deps: [
                UserServiceAbstraction,
                ApiServiceAbstraction,
                SettingsServiceAbstraction,
                FolderServiceAbstraction,
                CipherServiceAbstraction,
                CryptoServiceAbstraction,
                CollectionServiceAbstraction,
                StorageServiceAbstraction,
                MessagingServiceAbstraction,
                PolicyServiceAbstraction,
                SendServiceAbstraction,
                LogService,
                TokenServiceAbstraction,
                KeyConnectorServiceAbstraction,
            ],
        },
        {
            provide: UserServiceAbstraction,
            useClass: UserService,
            deps: [TokenServiceAbstraction, StorageServiceAbstraction],
        },
        { provide: MessagingServiceAbstraction, useClass: BroadcasterMessagingService },
        { provide: BroadcasterServiceAbstraction, useClass: BroadcasterService },
        {
            provide: SettingsServiceAbstraction,
            useClass: SettingsService,
            deps: [UserServiceAbstraction, StorageServiceAbstraction],
        },
        {
            provide: VaultTimeoutServiceAbstraction,
            useFactory: (cipherService: CipherServiceAbstraction, folderService: FolderServiceAbstraction,
                collectionService: CollectionServiceAbstraction, cryptoService: CryptoServiceAbstraction,
                platformUtilsService: PlatformUtilsServiceAbstraction, storageService: StorageServiceAbstraction,
                messagingService: MessagingServiceAbstraction, searchService: SearchServiceAbstraction,
                userService: UserServiceAbstraction, tokenService: TokenServiceAbstraction,
                policyService: PolicyServiceAbstraction, keyConnectorService: KeyConnectorServiceAbstraction) =>
                new VaultTimeoutService(cipherService, folderService, collectionService, cryptoService,
                    platformUtilsService, storageService, messagingService, searchService, userService, tokenService,
                    policyService, keyConnectorService, null,
                    async () => messagingService.send('logout', { expired: false })),
            deps: [
                CipherServiceAbstraction,
                FolderServiceAbstraction,
                CollectionServiceAbstraction,
                CryptoServiceAbstraction,
                PlatformUtilsServiceAbstraction,
                StorageServiceAbstraction,
                MessagingServiceAbstraction,
                SearchServiceAbstraction,
                UserServiceAbstraction,
                TokenServiceAbstraction,
                PolicyServiceAbstraction,
            ],
        },
        { provide: StorageServiceAbstraction, useClass: HtmlStorageService },
        { provide: 'SECURE_STORAGE', useClass: MemoryStorageService },
        { provide: StateServiceAbstraction, useClass: StateService },
        {
            provide: ExportServiceAbstraction,
            useClass: ExportService,
            deps: [
                FolderServiceAbstraction,
                CipherServiceAbstraction,
                ApiServiceAbstraction,
                CryptoServiceAbstraction,
            ],
        },
        {
            provide: SearchServiceAbstraction,
            useClass: SearchService,
            deps: [
                CipherServiceAbstraction,
                LogService,
                I18nServiceAbstraction,
            ],
        },
        {
            provide: ImportServiceAbstraction,
            useClass: ImportService,
            deps: [
                CipherServiceAbstraction,
                FolderServiceAbstraction,
                ApiServiceAbstraction,
                I18nServiceAbstraction,
                CollectionServiceAbstraction,
                PlatformUtilsServiceAbstraction,
                CryptoServiceAbstraction,
            ],
        },
        {
            provide: NotificationsServiceAbstraction,
            useFactory: (userService: UserServiceAbstraction, syncService: SyncServiceAbstraction,
                appIdService: AppIdServiceAbstraction, apiService: ApiServiceAbstraction,
                vaultTimeoutService: VaultTimeoutServiceAbstraction, environmentService: EnvironmentServiceAbstraction,
                messagingService: MessagingServiceAbstraction, logService: LogService) =>
                new NotificationsService(userService, syncService, appIdService, apiService, vaultTimeoutService,
                environmentService, async () => messagingService.send('logout', { expired: true }), logService),
            deps: [
                UserServiceAbstraction,
                SyncServiceAbstraction,
                AppIdServiceAbstraction,
                ApiServiceAbstraction,
                VaultTimeoutServiceAbstraction,
                EnvironmentServiceAbstraction,
                MessagingServiceAbstraction,
                LogService,
            ],
        },
        {
            provide: CryptoFunctionServiceAbstraction,
            useClass: WebCryptoFunctionService,
            deps: ['WINDOW', PlatformUtilsServiceAbstraction],
        },
        {
            provide: EventLoggingServiceAbstraction,
            useClass: EventLoggingService,
            deps: [
                StorageServiceAbstraction,
                ApiServiceAbstraction,
                UserServiceAbstraction,
                CipherServiceAbstraction,
                LogService,
            ],
        },
        {
            provide: PolicyServiceAbstraction,
            useClass: PolicyService,
            deps: [
                UserServiceAbstraction,
                StorageServiceAbstraction,
                ApiServiceAbstraction,
            ],
        },
        {
            provide: SendServiceAbstraction,
            useClass: SendService,
            deps: [
                CryptoServiceAbstraction,
                UserServiceAbstraction,
                ApiServiceAbstraction,
                FileUploadServiceAbstraction,
                StorageServiceAbstraction,
                I18nServiceAbstraction,
                CryptoFunctionServiceAbstraction,
            ],
        },
        {
            provide: KeyConnectorServiceAbstraction,
            useClass: KeyConnectorService,
            deps: [
                StorageServiceAbstraction,
                UserServiceAbstraction,
                CryptoServiceAbstraction,
                ApiServiceAbstraction,
                TokenServiceAbstraction,
                LogService,
            ],
        },
        {
            provide: UserVerificationServiceAbstraction,
            useClass: UserVerificationService,
            deps: [
                CryptoServiceAbstraction,
                I18nServiceAbstraction,
                ApiServiceAbstraction,
            ],
        },
        { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [
                'WINDOW',
                StorageServiceAbstraction,
                EnvironmentServiceAbstraction,
                NotificationsServiceAbstraction,
                VaultTimeoutServiceAbstraction,
                I18nServiceAbstraction,
                EventLoggingServiceAbstraction,
                AuthServiceAbstraction,
                StateServiceAbstraction,
                PlatformUtilsServiceAbstraction,
                CryptoServiceAbstraction,
            ],
            multi: true,
        },
        {
            provide: LOCALE_ID,
            useFactory: (i18nService: I18nServiceAbstraction) => i18nService.translationLocale,
            deps: [I18nServiceAbstraction],
        },
    ],
})
export class ServicesModule {
}
