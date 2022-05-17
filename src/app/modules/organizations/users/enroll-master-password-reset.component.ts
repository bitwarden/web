import { Component } from "@angular/core";

import { ModalConfig } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";
import { OrganizationUserResetPasswordEnrollmentRequest } from "jslib-common/models/request/organizationUserResetPasswordEnrollmentRequest";
import { ApiKeyResponse } from "jslib-common/models/response/apiKeyResponse";
import { Verification } from "jslib-common/types/verification";

@Component({
  selector: "app-enroll-master-password-reset",
  templateUrl: "enroll-master-password-reset.component.html",
})
export class EnrollMasterPasswordReset {
  organizationId: string;
  userId: string;

  masterPassword: Verification;
  formPromise: Promise<ApiKeyResponse>;

  constructor(
    private userVerificationService: UserVerificationService,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private config: ModalConfig
  ) {
    this.organizationId = config.data.organizationId;
    this.userId = config.data.userId;
  }

  async submit() {
    this.formPromise = this.userVerificationService
      .buildRequest(this.masterPassword, OrganizationUserResetPasswordEnrollmentRequest)
      .then((request) => {
        return this.apiService.putOrganizationUserResetPasswordEnrollment(
          this.organizationId,
          this.userId,
          request
        );
      });
    await this.formPromise;
  }
}
