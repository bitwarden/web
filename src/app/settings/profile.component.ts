import { Component, OnInit } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { KeyConnectorService } from "jslib-common/abstractions/keyConnector.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { UpdateProfileRequest } from "jslib-common/models/request/updateProfileRequest";
import { ProfileResponse } from "jslib-common/models/response/profileResponse";

@Component({
  selector: "app-profile",
  templateUrl: "profile.component.html",
})
export class ProfileComponent implements OnInit {
  loading = true;
  profile: ProfileResponse;
  fingerprint: string;
  hidePasswordHint = false;

  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private logService: LogService,
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService
  ) {}

  async ngOnInit() {
    this.profile = await this.apiService.getProfile();
    this.loading = false;
    const fingerprint = await this.cryptoService.getFingerprint(
      await this.stateService.getUserId()
    );
    if (fingerprint != null) {
      this.fingerprint = fingerprint.join("-");
    }
    this.hidePasswordHint = await this.keyConnectorService.getUsesKeyConnector();
  }

  async submit() {
    try {
      const request = new UpdateProfileRequest(this.profile.name, this.profile.masterPasswordHint);
      this.formPromise = this.apiService.putProfile(request);
      await this.formPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("accountUpdated"));
    } catch (e) {
      this.logService.error(e);
    }
  }
}
