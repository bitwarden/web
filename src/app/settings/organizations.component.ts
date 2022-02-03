import { Component, Input, OnInit } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { PolicyType } from "jslib-common/enums/policyType";
import { Utils } from "jslib-common/misc/utils";
import { Organization } from "jslib-common/models/domain/organization";
import { Policy } from "jslib-common/models/domain/policy";
import { OrganizationUserResetPasswordEnrollmentRequest } from "jslib-common/models/request/organizationUserResetPasswordEnrollmentRequest";

@Component({
  selector: "app-organizations",
  templateUrl: "organizations.component.html",
})
export class OrganizationsComponent implements OnInit {
  @Input() vault = false;

  organizations: Organization[];
  policies: Policy[];
  loaded = false;
  actionPromise: Promise<any>;

  constructor(
    private organizationService: OrganizationService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private apiService: ApiService,
    private syncService: SyncService,
    private cryptoService: CryptoService,
    private policyService: PolicyService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    if (!this.vault) {
      await this.syncService.fullSync(true);
      await this.load();
    }
  }

  async load() {
    const orgs = await this.organizationService.getAll();
    orgs.sort(Utils.getSortFunction(this.i18nService, "name"));
    this.organizations = orgs;
    this.policies = await this.policyService.getAll(PolicyType.ResetPassword);
    this.loaded = true;
  }

  allowEnrollmentChanges(org: Organization): boolean {
    if (org.usePolicies && org.useResetPassword && org.hasPublicAndPrivateKeys) {
      const policy = this.policies.find((p) => p.organizationId === org.id);
      if (policy != null && policy.enabled) {
        return org.resetPasswordEnrolled && policy.data.autoEnrollEnabled ? false : true;
      }
    }

    return false;
  }

  showEnrolledStatus(org: Organization): boolean {
    return (
      org.useResetPassword &&
      org.resetPasswordEnrolled &&
      this.policies.some((p) => p.organizationId === org.id && p.enabled)
    );
  }

  async unlinkSso(org: Organization) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("unlinkSsoConfirmation"),
      org.name,
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.actionPromise = this.apiService.deleteSsoUser(org.id).then(() => {
        return this.syncService.fullSync(true);
      });
      await this.actionPromise;
      this.platformUtilsService.showToast("success", null, "Unlinked SSO");
      await this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async leave(org: Organization) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("leaveOrganizationConfirmation"),
      org.name,
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.actionPromise = this.apiService.postLeaveOrganization(org.id).then(() => {
        return this.syncService.fullSync(true);
      });
      await this.actionPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("leftOrganization"));
      await this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async toggleResetPasswordEnrollment(org: Organization) {
    // Set variables
    let keyString: string = null;
    let toastStringRef = "withdrawPasswordResetSuccess";

    // Enrolling
    if (!org.resetPasswordEnrolled) {
      // Alert user about enrollment
      const confirmed = await this.platformUtilsService.showDialog(
        this.i18nService.t("resetPasswordEnrollmentWarning"),
        null,
        this.i18nService.t("yes"),
        this.i18nService.t("no"),
        "warning"
      );
      if (!confirmed) {
        return;
      }

      // Retrieve Public Key
      this.actionPromise = this.apiService
        .getOrganizationKeys(org.id)
        .then(async (response) => {
          if (response == null) {
            throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
          }

          const publicKey = Utils.fromB64ToArray(response.publicKey);

          // RSA Encrypt user's encKey.key with organization public key
          const encKey = await this.cryptoService.getEncKey();
          const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);
          keyString = encryptedKey.encryptedString;
          toastStringRef = "enrollPasswordResetSuccess";

          // Create request and execute enrollment
          const request = new OrganizationUserResetPasswordEnrollmentRequest();
          request.resetPasswordKey = keyString;
          return this.apiService.putOrganizationUserResetPasswordEnrollment(
            org.id,
            org.userId,
            request
          );
        })
        .then(() => {
          return this.syncService.fullSync(true);
        });
    } else {
      // Withdrawal
      const request = new OrganizationUserResetPasswordEnrollmentRequest();
      request.resetPasswordKey = keyString;
      this.actionPromise = this.apiService
        .putOrganizationUserResetPasswordEnrollment(org.id, org.userId, request)
        .then(() => {
          return this.syncService.fullSync(true);
        });
    }

    try {
      await this.actionPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t(toastStringRef));
      await this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
