import { Component, OnInit } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { TwoFactorProviderType } from "jslib-common/enums/twoFactorProviderType";
import { EmailRequest } from "jslib-common/models/request/emailRequest";
import { EmailTokenRequest } from "jslib-common/models/request/emailTokenRequest";

@Component({
  selector: "app-change-email",
  templateUrl: "change-email.component.html",
})
export class ChangeEmailComponent implements OnInit {
  masterPassword: string;
  newEmail: string;
  token: string;
  tokenSent = false;
  showTwoFactorEmailWarning = false;

  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private messagingService: MessagingService,
    private logService: LogService,
    private stateService: StateService
  ) {}

  async ngOnInit() {
    const twoFactorProviders = await this.apiService.getTwoFactorProviders();
    this.showTwoFactorEmailWarning = twoFactorProviders.data.some(
      (p) => p.type === TwoFactorProviderType.Email && p.enabled
    );
  }

  async submit() {
    const hasEncKey = await this.cryptoService.hasEncKey();
    if (!hasEncKey) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("updateKey"));
      return;
    }

    this.newEmail = this.newEmail.trim().toLowerCase();
    if (!this.tokenSent) {
      const request = new EmailTokenRequest();
      request.newEmail = this.newEmail;
      request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);
      try {
        this.formPromise = this.apiService.postEmailToken(request);
        await this.formPromise;
        this.tokenSent = true;
      } catch (e) {
        this.logService.error(e);
      }
    } else {
      const request = new EmailRequest();
      request.token = this.token;
      request.newEmail = this.newEmail;
      request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);
      const kdf = await this.stateService.getKdfType();
      const kdfIterations = await this.stateService.getKdfIterations();
      const newKey = await this.cryptoService.makeKey(
        this.masterPassword,
        this.newEmail,
        kdf,
        kdfIterations
      );
      request.newMasterPasswordHash = await this.cryptoService.hashPassword(
        this.masterPassword,
        newKey
      );
      const newEncKey = await this.cryptoService.remakeEncKey(newKey);
      request.key = newEncKey[1].encryptedString;
      try {
        this.formPromise = this.apiService.postEmail(request);
        await this.formPromise;
        this.reset();
        this.platformUtilsService.showToast(
          "success",
          this.i18nService.t("emailChanged"),
          this.i18nService.t("logBackIn")
        );
        this.messagingService.send("logout");
      } catch (e) {
        this.logService.error(e);
      }
    }
  }

  reset() {
    this.token = this.newEmail = this.masterPassword = null;
    this.tokenSent = false;
  }
}
