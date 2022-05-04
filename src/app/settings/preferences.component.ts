import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { VaultTimeoutService } from "jslib-common/abstractions/vaultTimeout.service";
import { ThemeType } from "jslib-common/enums/themeType";
import { Utils } from "jslib-common/misc/utils";

@Component({
  selector: "app-preferences",
  templateUrl: "preferences.component.html",
})
export class PreferencesComponent implements OnInit {
  vaultTimeoutAction = "lock";
  disableIcons: boolean;
  enableGravatars: boolean;
  enableFullWidth: boolean;
  theme: ThemeType;
  locale: string;
  vaultTimeouts: { name: string; value: number }[];
  localeOptions: any[];
  themeOptions: any[];

  vaultTimeout: FormControl = new FormControl(null);

  private startingLocale: string;
  private startingTheme: ThemeType;

  constructor(
    private stateService: StateService,
    private i18nService: I18nService,
    private vaultTimeoutService: VaultTimeoutService,
    private platformUtilsService: PlatformUtilsService,
    private messagingService: MessagingService
  ) {
    this.vaultTimeouts = [
      { name: i18nService.t("oneMinute"), value: 1 },
      { name: i18nService.t("fiveMinutes"), value: 5 },
      { name: i18nService.t("fifteenMinutes"), value: 15 },
      { name: i18nService.t("thirtyMinutes"), value: 30 },
      { name: i18nService.t("oneHour"), value: 60 },
      { name: i18nService.t("fourHours"), value: 240 },
      { name: i18nService.t("onRefresh"), value: -1 },
    ];
    if (this.platformUtilsService.isDev()) {
      this.vaultTimeouts.push({ name: i18nService.t("never"), value: null });
    }

    const localeOptions: any[] = [];
    i18nService.supportedTranslationLocales.forEach((locale) => {
      let name = locale;
      if (i18nService.localeNames.has(locale)) {
        name += " - " + i18nService.localeNames.get(locale);
      }
      localeOptions.push({ name: name, value: locale });
    });
    localeOptions.sort(Utils.getSortFunction(i18nService, "name"));
    localeOptions.splice(0, 0, { name: i18nService.t("default"), value: null });
    this.localeOptions = localeOptions;
    this.themeOptions = [
      { name: i18nService.t("themeLight"), value: ThemeType.Light },
      { name: i18nService.t("themeDark"), value: ThemeType.Dark },
      { name: i18nService.t("themeSystem"), value: ThemeType.System },
    ];
  }

  async ngOnInit() {
    this.vaultTimeout.setValue(await this.vaultTimeoutService.getVaultTimeout());
    this.vaultTimeoutAction = await this.stateService.getVaultTimeoutAction();
    this.disableIcons = await this.stateService.getDisableFavicon();
    this.enableGravatars = await this.stateService.getEnableGravitars();
    this.enableFullWidth = await this.stateService.getEnableFullWidth();

    this.locale = (await this.stateService.getLocale()) ?? null;
    this.startingLocale = this.locale;

    this.theme = await this.stateService.getTheme();
    this.startingTheme = this.theme;
  }

  async submit() {
    if (!this.vaultTimeout.valid) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("vaultTimeoutToLarge"));
      return;
    }

    await this.vaultTimeoutService.setVaultTimeoutOptions(
      this.vaultTimeout.value,
      this.vaultTimeoutAction
    );
    await this.stateService.setDisableFavicon(this.disableIcons);
    await this.stateService.setEnableGravitars(this.enableGravatars);
    await this.stateService.setEnableFullWidth(this.enableFullWidth);
    this.messagingService.send("setFullWidth");
    if (this.theme !== this.startingTheme) {
      await this.stateService.setTheme(this.theme);
      this.startingTheme = this.theme;
      const effectiveTheme = await this.platformUtilsService.getEffectiveTheme();
      const htmlEl = window.document.documentElement;
      htmlEl.classList.remove("theme_" + ThemeType.Light, "theme_" + ThemeType.Dark);
      htmlEl.classList.add("theme_" + effectiveTheme);
    }
    await this.stateService.setLocale(this.locale);
    if (this.locale !== this.startingLocale) {
      window.location.reload();
    } else {
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("preferencesUpdated")
      );
    }
  }

  async vaultTimeoutActionChanged(newValue: string) {
    if (newValue === "logOut") {
      const confirmed = await this.platformUtilsService.showDialog(
        this.i18nService.t("vaultTimeoutLogOutConfirmation"),
        this.i18nService.t("vaultTimeoutLogOutConfirmationTitle"),
        this.i18nService.t("yes"),
        this.i18nService.t("cancel"),
        "warning"
      );
      if (!confirmed) {
        this.vaultTimeoutAction = "lock";
        return;
      }
    }
    this.vaultTimeoutAction = newValue;
  }
}
