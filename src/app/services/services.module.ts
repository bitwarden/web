import { APP_INITIALIZER, Injector, NgModule } from "@angular/core";
import { ToastrModule } from "ngx-toastr";

import { BroadcasterMessagingService } from "../../services/broadcasterMessaging.service";
import { HtmlStorageService } from "../../services/htmlStorage.service";
import { I18nService } from "../../services/i18n.service";
import { MemoryStorageService } from "../../services/memoryStorage.service";
import { WebPlatformUtilsService } from "../../services/webPlatformUtils.service";

import { EventService } from "./event.service";
import { ModalService } from "./modal.service";
import { OrganizationGuardService } from "./organization-guard.service";
import { OrganizationTypeGuardService } from "./organization-type-guard.service";
import { PolicyListService } from "./policy-list.service";
import { RouterService } from "./router.service";

import { JslibServicesModule } from "jslib-angular/services/jslib-services.module";
import { ModalService as ModalServiceAbstraction } from "jslib-angular/services/modal.service";

import { AuthService } from "jslib-common/services/auth.service";
import { ContainerService } from "jslib-common/services/container.service";
import { CryptoService } from "jslib-common/services/crypto.service";
import { EventService as EventLoggingService } from "jslib-common/services/event.service";
import { ImportService } from "jslib-common/services/import.service";
import { VaultTimeoutService } from "jslib-common/services/vaultTimeout.service";

import { ApiService as ApiServiceAbstraction } from "jslib-common/abstractions/api.service";
import { AuthService as AuthServiceAbstraction } from "jslib-common/abstractions/auth.service";
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
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "jslib-common/abstractions/platformUtils.service";
import { StateService as StateServiceAbstraction } from "jslib-common/abstractions/state.service";
import { StateMigrationService } from 'jslib-common/abstractions/stateMigration.service';
import { StorageService as StorageServiceAbstraction } from "jslib-common/abstractions/storage.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "jslib-common/abstractions/vaultTimeout.service";

import { ThemeType } from "jslib-common/enums/themeType";

export function initFactory(
  window: Window,
  storageService: StorageServiceAbstraction,
  environmentService: EnvironmentServiceAbstraction,
  notificationsService: NotificationsServiceAbstraction,
  vaultTimeoutService: VaultTimeoutService,
  i18nService: I18nService,
  eventLoggingService: EventLoggingService,
  authService: AuthService,
  stateService: StateServiceAbstraction,
  platformUtilsService: PlatformUtilsServiceAbstraction,
  cryptoService: CryptoServiceAbstraction
): Function {
  return async () => {
    await (storageService as HtmlStorageService).init();
    await stateService.init();

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
        provide: 'SECURE_STORAGE',
        // TODO: platformUtilsService.isDev has a helper for this, but using that service here results in a circular dependency.
        // We have a tech debt item in the backlog to break up platformUtilsService, but in the meantime simply checking the environement here is less cumbersome.
        useClass: process.env.NODE_ENV === 'development' ?
            HtmlStorageService :
            MemoryStorageService,
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
  ],
})
export class ServicesModule {}
