import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";
import { Verification } from "jslib-common/types/verification";

@Component({
  selector: "app-purge-vault",
  templateUrl: "purge-vault.component.html",
})
export class PurgeVaultComponent {
  @Input() organizationId?: string = null;

  masterPassword: Verification;
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private userVerificationService: UserVerificationService,
    private router: Router,
    private logService: LogService
  ) {}

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.apiService.postPurgeCiphers(request, this.organizationId));
      await this.formPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("vaultPurged"));
      if (this.organizationId != null) {
        this.router.navigate(["organizations", this.organizationId, "vault"]);
      } else {
        this.router.navigate(["vault"]);
      }
    } catch (e) {
      this.logService.error(e);
    }
  }
}
