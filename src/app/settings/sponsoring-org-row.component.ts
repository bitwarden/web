import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Organization } from "jslib-common/models/domain/organization";

@Component({
  selector: "[sponsoring-org-row]",
  templateUrl: "sponsoring-org-row.component.html",
})
export class SponsoringOrgRowComponent {
  @Input() sponsoringOrg: Organization = null;

  @Output() sponsorshipRemoved = new EventEmitter();

  revokeSponsorshipPromise: Promise<any>;
  resendEmailPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private logService: LogService,
    private platformUtilsService: PlatformUtilsService
  ) {}

  async revokeSponsorship() {
    try {
      this.revokeSponsorshipPromise = this.doRevokeSponsorship();
      await this.revokeSponsorshipPromise;
    } catch (e) {
      this.logService.error(e);
    }

    this.revokeSponsorshipPromise = null;
  }

  async resendEmail() {
    this.resendEmailPromise = this.apiService.postResendSponsorshipOffer(this.sponsoringOrg.id);
    await this.resendEmailPromise;
    this.platformUtilsService.showToast("success", null, this.i18nService.t("emailSent"));
    this.resendEmailPromise = null;
  }

  private async doRevokeSponsorship() {
    const isConfirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("revokeSponsorshipConfirmation"),
      `${this.i18nService.t("remove")} ${this.sponsoringOrg.familySponsorshipFriendlyName}?`,
      this.i18nService.t("remove"),
      this.i18nService.t("cancel"),
      "warning"
    );

    if (!isConfirmed) {
      return;
    }

    await this.apiService.deleteRevokeSponsorship(this.sponsoringOrg.id);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("reclaimedFreePlan"));
    this.sponsorshipRemoved.emit();
  }
}
