import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { Utils } from "jslib-common/misc/utils";
import { Policy } from "jslib-common/models/domain/policy";
import { OrganizationUserAcceptRequest } from "jslib-common/models/request/organizationUserAcceptRequest";
import { OrganizationUserResetPasswordEnrollmentRequest } from "jslib-common/models/request/organizationUserResetPasswordEnrollmentRequest";

import { BaseAcceptComponent } from "../common/base.accept.component";

@Component({
  selector: "app-accept-organization",
  templateUrl: "accept-organization.component.html",
})
export class AcceptOrganizationComponent extends BaseAcceptComponent {
  orgName: string;

  protected requiredParameters: string[] = ["organizationId", "organizationUserId", "token"];

  constructor(
    router: Router,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    route: ActivatedRoute,
    private apiService: ApiService,
    stateService: StateService,
    private cryptoService: CryptoService,
    private policyService: PolicyService,
    private logService: LogService
  ) {
    super(router, platformUtilsService, i18nService, route, stateService);
  }

  async authedHandler(qParams: any): Promise<void> {
    const request = new OrganizationUserAcceptRequest();
    request.token = qParams.token;
    if (await this.performResetPasswordAutoEnroll(qParams)) {
      this.actionPromise = this.apiService
        .postOrganizationUserAccept(qParams.organizationId, qParams.organizationUserId, request)
        .then(() => {
          // Retrieve Public Key
          return this.apiService.getOrganizationKeys(qParams.organizationId);
        })
        .then(async (response) => {
          if (response == null) {
            throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
          }

          const publicKey = Utils.fromB64ToArray(response.publicKey);

          // RSA Encrypt user's encKey.key with organization public key
          const encKey = await this.cryptoService.getEncKey();
          const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);

          // Create request and execute enrollment
          const resetRequest = new OrganizationUserResetPasswordEnrollmentRequest();
          resetRequest.resetPasswordKey = encryptedKey.encryptedString;

          return this.apiService.putOrganizationUserResetPasswordEnrollment(
            qParams.organizationId,
            await this.stateService.getUserId(),
            resetRequest
          );
        });
    } else {
      this.actionPromise = this.apiService.postOrganizationUserAccept(
        qParams.organizationId,
        qParams.organizationUserId,
        request
      );
    }

    await this.actionPromise;
    this.platformUtilService.showToast(
      "success",
      this.i18nService.t("inviteAccepted"),
      this.i18nService.t("inviteAcceptedDesc"),
      { timeout: 10000 }
    );

    await this.stateService.setOrganizationInvitation(null);
    this.router.navigate(["/vault"]);
  }

  async unauthedHandler(qParams: any): Promise<void> {
    this.orgName = qParams.organizationName;
    if (this.orgName != null) {
      // Fix URL encoding of space issue with Angular
      this.orgName = this.orgName.replace(/\+/g, " ");
    }
    await this.stateService.setOrganizationInvitation(qParams);
  }

  private async performResetPasswordAutoEnroll(qParams: any): Promise<boolean> {
    let policyList: Policy[] = null;
    try {
      const policies = await this.apiService.getPoliciesByToken(
        qParams.organizationId,
        qParams.token,
        qParams.email,
        qParams.organizationUserId
      );
      policyList = this.policyService.mapPoliciesFromToken(policies);
    } catch (e) {
      this.logService.error(e);
    }

    if (policyList != null) {
      const result = this.policyService.getResetPasswordPolicyOptions(
        policyList,
        qParams.organizationId
      );
      // Return true if policy enabled and auto-enroll enabled
      return result[1] && result[0].autoEnrollEnabled;
    }

    return false;
  }
}
