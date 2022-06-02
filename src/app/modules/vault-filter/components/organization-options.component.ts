import { Component, Input } from "@angular/core";

import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { PolicyType } from "jslib-common/enums/policyType";
import { Organization } from "jslib-common/models/domain/organization";
import { Policy } from "jslib-common/models/domain/policy";

import { EnrollMasterPasswordReset } from "../../organizations/users/enroll-master-password-reset.component";

@Component({
  selector: "app-organization-options",
  templateUrl: "organization-options.component.html",
})
export class OrganizationOptionsComponent {
  actionPromise: Promise<any>;
  policies: Policy[];
  loaded = false;

  @Input() organization: Organization;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private apiService: ApiService,
    private syncService: SyncService,
    private policyService: PolicyService,
    private modalService: ModalService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
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
      this.platformUtilsService.showToast("error", this.i18nService.t("errorOccurred"), e.message);
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
      this.platformUtilsService.showToast("error", this.i18nService.t("errorOccurred"), e.message);
      this.logService.error(e);
    }
  }

  async toggleResetPasswordEnrollment(org: Organization) {
    this.modalService.open(EnrollMasterPasswordReset, {
      allowMultipleModals: true,
      data: {
        organization: org,
      },
    });
  }
}
