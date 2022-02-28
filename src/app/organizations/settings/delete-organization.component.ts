import { Component, EventEmitter, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";
import { Verification } from "jslib-common/types/verification";

@Component({
  selector: "app-delete-organization",
  templateUrl: "delete-organization.component.html",
})
export class DeleteOrganizationComponent {
  organizationId: string;
  descriptionKey = "deleteOrganizationDesc";
  @Output() onSuccess: EventEmitter<any> = new EventEmitter();

  masterPassword: Verification;
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private userVerificationService: UserVerificationService,
    private logService: LogService
  ) {}

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.apiService.deleteOrganization(this.organizationId, request));
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("organizationDeleted"),
        this.i18nService.t("organizationDeletedDesc")
      );
      this.onSuccess.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
