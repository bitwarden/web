import { APP_INITIALIZER, NgModule } from "@angular/core";
import { ToastrModule } from "ngx-toastr";

import { JslibServicesModule } from "jslib-angular/services/jslib-services.module";
import { ModalService as ModalServiceAbstraction } from "jslib-angular/services/modal.service";
import { ApiService as ApiServiceAbstraction } from "jslib-common/abstractions/api.service";
import { CipherService as CipherServiceAbstraction } from "jslib-common/abstractions/cipher.service";
import { CollectionService as CollectionServiceAbstraction } from "jslib-common/abstractions/collection.service";
import { CryptoService as CryptoServiceAbstraction } from "jslib-common/abstractions/crypto.service";
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "jslib-common/abstractions/cryptoFunction.service";
import {
  EnvironmentService as EnvironmentServiceAbstraction,
  Urls,
} from "jslib-common/abstractions/environment.service";
import { EventService as EventLoggingServiceAbstraction } from "jslib-common/abstractions/event.service";
import { FolderService as FolderServiceAbstraction } from "jslib-common/abstractions/folder.service";
import { I18nService as I18nServiceAbstraction } from "jslib-common/abstractions/i18n.service";
import { ImportService as ImportServiceAbstraction } from "jslib-common/abstractions/import.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService as MessagingServiceAbstraction } from "jslib-common/abstractions/messaging.service";
import { NotificationsService as NotificationsServiceAbstraction } from "jslib-common/abstractions/notifications.service";
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "jslib-common/abstractions/platformUtils.service";
import { StateService as BaseStateServiceAbstraction } from "jslib-common/abstractions/state.service";
import { StateMigrationService as StateMigrationServiceAbstraction } from "jslib-common/abstractions/stateMigration.service";
import { StorageService as StorageServiceAbstraction } from "jslib-common/abstractions/storage.service";
import { TwoFactorService as TwoFactorServiceAbstraction } from "jslib-common/abstractions/twoFactor.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "jslib-common/abstractions/vaultTimeout.service";
import { ThemeType } from "jslib-common/enums/themeType";
import { StateFactory } from "jslib-common/factories/stateFactory";
import { ContainerService } from "jslib-common/services/container.service";
import { CryptoService } from "jslib-common/services/crypto.service";
import { EventService as EventLoggingService } from "jslib-common/services/event.service";
import { ImportService } from "jslib-common/services/import.service";
import { VaultTimeoutService } from "jslib-common/services/vaultTimeout.service";

import { StateService as StateServiceAbstraction } from "../../abstractions/state.service";
import { Account } from "../../models/account";
import { GlobalState } from "../../models/globalState";
import { BroadcasterMessagingService } from "../../services/broadcasterMessaging.service";
import { HtmlStorageService } from "../../services/htmlStorage.service";
import { I18nService } from "../../services/i18n.service";
import { MemoryStorageService } from "../../services/memoryStorage.service";
import { PasswordRepromptService } from "../../services/passwordReprompt.service";
import { StateService } from "../../services/state.service";
import { StateMigrationService } from "../../services/stateMigration.service";
import { WebPlatformUtilsService } from "../../services/webPlatformUtils.service";

import { EventService } from "./event.service";
import { ModalService } from "./modal.service";
import { OrganizationGuardService } from "./organization-guard.service";
import { OrganizationTypeGuardService } from "./organization-type-guard.service";
import { PolicyListService } from "./policy-list.service";
import { RouterService } from "./router.service";

export function initFactory(
  window: Window,
  environmentService: EnvironmentServiceAbstraction,
  notificationsService: NotificationsServiceAbstraction,
  vaultTimeoutService: VaultTimeoutService,
  i18nService: I18nService,
  eventLoggingService: EventLoggingService,
  twoFactorService: TwoFactorServiceAbstraction,
  stateService: StateServiceAbstraction,
  platformUtilsService: PlatformUtilsServiceAbstraction,
  cryptoService: CryptoServiceAbstraction
): () => void {
  return async () => {
    await stateService.init();

    const urls = process.env.URLS as Urls;
    urls.base ??= window.location.origin;
    environmentService.setUrls(urls);

    setTimeout(() => notificationsService.init(), 3000);

    vaultTimeoutService.init(true);
    const locale = await stateService.getLocale();
    await i18nService.init(locale);
    eventLoggingService.init(true);
    twoFactorService.init();
    const htmlEl = window.document.documentElement;
    htmlEl.classList.add("locale_" + i18nService.translationLocale);

    // Initial theme is set in index.html which must be updated if there are any changes to theming logic
    platformUtilsService.onDefaultSystemThemeChange(async (sysTheme) => {
      const bwTheme = await stateService.getTheme();
      if (bwTheme === ThemeType.System) {
        htmlEl.classList.remove("theme_" + ThemeType.Light, "theme_" + ThemeType.Dark);
        htmlEl.classList.add("theme_" + sysTheme);
      }
    });

    const containerService = new ContainerService(cryptoService);
    containerService.attachToWindow(window);
  };
}

@NgModule({
  imports: [ToastrModule, JslibServicesModule],
  declarations: [],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initFactory,
      deps: [
        "WINDOW",
        EnvironmentServiceAbstraction,
        NotificationsServiceAbstraction,
        VaultTimeoutServiceAbstraction,
        I18nServiceAbstraction,
        EventLoggingServiceAbstraction,
        TwoFactorServiceAbstraction,
        StateServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        CryptoServiceAbstraction,
      ],
      multi: true,
    },
    OrganizationGuardService,
    OrganizationTypeGuardService,
    RouterService,
    EventService,
    PolicyListService,
    {
      provide: I18nServiceAbstraction,
      useFactory: (window: Window) => new I18nService(window.navigator.language, "locales"),
      deps: ["WINDOW"],
    },
    { provide: StorageServiceAbstraction, useClass: HtmlStorageService },
    {
      provide: "SECURE_STORAGE",
      // TODO: platformUtilsService.isDev has a helper for this, but using that service here results in a circular dependency.
      // We have a tech debt item in the backlog to break up platformUtilsService, but in the meantime simply checking the environement here is less cumbersome.
      useClass: process.env.NODE_ENV === "development" ? HtmlStorageService : MemoryStorageService,
    },
    {
      provide: PlatformUtilsServiceAbstraction,
      useFactory: (
        i18nService: I18nServiceAbstraction,
        messagingService: MessagingServiceAbstraction,
        logService: LogService,
        stateService: StateServiceAbstraction
      ) => new WebPlatformUtilsService(i18nService, messagingService, logService, stateService),
      deps: [
        I18nServiceAbstraction,
        MessagingServiceAbstraction,
        LogService,
        StateServiceAbstraction,
      ],
    },
    { provide: MessagingServiceAbstraction, useClass: BroadcasterMessagingService },
    { provide: ModalServiceAbstraction, useClass: ModalService },
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
      provide: CryptoServiceAbstraction,
      useClass: CryptoService,
      deps: [
        CryptoFunctionServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        LogService,
        StateServiceAbstraction,
      ],
    },
    {
      provide: StateMigrationServiceAbstraction,
      useFactory: (
        storageService: StorageServiceAbstraction,
        secureStorageService: StorageServiceAbstraction
      ) =>
        new StateMigrationService(
          storageService,
          secureStorageService,
          new StateFactory(GlobalState, Account)
        ),
      deps: [StorageServiceAbstraction, "SECURE_STORAGE"],
    },
    {
      provide: StateServiceAbstraction,
      useFactory: (
        storageService: StorageServiceAbstraction,
        secureStorageService: StorageServiceAbstraction,
        logService: LogService,
        stateMigrationService: StateMigrationServiceAbstraction
      ) =>
        new StateService(
          storageService,
          secureStorageService,
          logService,
          stateMigrationService,
          new StateFactory(GlobalState, Account),
          false
        ),
      deps: [
        StorageServiceAbstraction,
        "SECURE_STORAGE",
        LogService,
        StateMigrationServiceAbstraction,
      ],
    },
    {
      provide: BaseStateServiceAbstraction,
      useExisting: StateServiceAbstraction,
    },
    {
      provide: PasswordRepromptServiceAbstraction,
      useClass: PasswordRepromptService,
    },
  ],
})
export class ServicesModule {}
