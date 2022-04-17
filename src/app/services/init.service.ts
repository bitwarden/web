import { Inject, Injectable } from "@angular/core";

import { WINDOW } from "jslib-angular/services/jslib-services.module";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { EnvironmentService, Urls } from "jslib-common/abstractions/environment.service";
import { EventService as EventLoggingService } from "jslib-common/abstractions/event.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { NotificationsService } from "jslib-common/abstractions/notifications.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { TwoFactorService } from "jslib-common/abstractions/twoFactor.service";
import { VaultTimeoutService } from "jslib-common/abstractions/vaultTimeout.service";
import { ThemeType } from "jslib-common/enums/themeType";
import { ContainerService } from "jslib-common/services/container.service";
import { EventService as EventLoggingServiceImplementation } from "jslib-common/services/event.service";
import { VaultTimeoutService as VaultTimeoutServiceImplementation } from "jslib-common/services/vaultTimeout.service";

import { I18nService as I18nServiceImplementation } from "../../services/i18n.service";


@Injectable()
export class InitService {
  constructor(
    @Inject(WINDOW) private win: Window,
    private environmentService: EnvironmentService,
    private notificationsService: NotificationsService,
    private vaultTimeoutService: VaultTimeoutService,
    private i18nService: I18nService,
    private eventLoggingService: EventLoggingService,
    private twoFactorService: TwoFactorService,
    private stateService: StateService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService
  ) {}

  init() {
    return async () => {
      await this.stateService.init();

      const urls = process.env.URLS as Urls;
      urls.base ??= this.win.location.origin;
      this.environmentService.setUrls(urls);

      setTimeout(() => this.notificationsService.init(), 3000);

      (this.vaultTimeoutService as VaultTimeoutServiceImplementation).init(true);
      const locale = await this.stateService.getLocale();
      await (this.i18nService as I18nServiceImplementation).init(locale);
      (this.eventLoggingService as EventLoggingServiceImplementation).init(true);
      this.twoFactorService.init();
      const htmlEl = this.win.document.documentElement;
      htmlEl.classList.add("locale_" + this.i18nService.translationLocale);

      // Initial theme is set in index.html which must be updated if there are any changes to theming logic
      this.platformUtilsService.onDefaultSystemThemeChange(async (sysTheme) => {
        const bwTheme = await this.stateService.getTheme();
        if (bwTheme === ThemeType.System) {
          htmlEl.classList.remove("theme_" + ThemeType.Light, "theme_" + ThemeType.Dark);
          htmlEl.classList.add("theme_" + sysTheme);
        }
      });

      const containerService = new ContainerService(this.cryptoService);
      containerService.attachToWindow(this.win);
    };
  }
}
