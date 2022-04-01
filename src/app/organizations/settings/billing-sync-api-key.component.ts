import { Component } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";
import { OrganizationApiKeyType } from "jslib-common/enums/organizationApiKeyType";
import { OrganizationApiKeyRequest } from "jslib-common/models/request/organizationApiKeyRequest";
import { ApiKeyResponse } from "jslib-common/models/response/apiKeyResponse";
import { Verification } from "jslib-common/types/verification";

@Component({
  selector: "app-billing-sync-api-key",
  templateUrl: "billing-sync-api-key.component.html",
})
export class BillingSyncApiKeyComponent {
  organizationId: string;
  hasBillingToken: boolean;

  showRotateScreen: boolean;
  masterPassword: Verification;
  formPromise: Promise<ApiKeyResponse>;
  clientSecret?: string;
  keyRevisionDate?: Date;
  lastSyncDate?: Date = null;

  constructor(
    private userVerificationService: UserVerificationService,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  copy() {
    this.platformUtilsService.copyToClipboard(this.clientSecret);
  }

  async submit() {
    if (this.showRotateScreen) {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword, OrganizationApiKeyRequest)
        .then((request) => {
          request.type = OrganizationApiKeyType.BillingSync;
          return this.apiService.postOrganizationRotateApiKey(this.organizationId, request);
        });
      const response = await this.formPromise;
      await this.load(response);
      this.showRotateScreen = false;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("billingSyncApiKeyRotated")
      );
    } else {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword, OrganizationApiKeyRequest)
        .then((request) => {
          request.type = OrganizationApiKeyType.BillingSync;
          return this.apiService.postOrganizationApiKey(this.organizationId, request);
        });
      const response = await this.formPromise;
      await this.load(response);
    }
  }

  async load(response: ApiKeyResponse) {
    this.clientSecret = response.apiKey;
    this.keyRevisionDate = response.revisionDate;
    this.hasBillingToken = true;
    const syncStatus = await this.apiService.getSponsorshipSyncStatus(this.organizationId);
    this.lastSyncDate = syncStatus.lastSyncDate;
  }

  cancelRotate() {
    this.showRotateScreen = false;
  }

  rotateToken() {
    this.showRotateScreen = true;
  }

  private dayDiff(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get submitButtonText(): string {
    if (this.showRotateScreen) {
      return this.i18nService.t("rotateToken");
    }

    return this.i18nService.t(this.hasBillingToken ? "continue" : "generateToken");
  }

  get syncText(): string | undefined {
    // Precendence:
    // 1. If last sync date is null, don't show anything
    // 2. If last sync date is greater than key revision date, show last sync on X

    if (this.lastSyncDate !== null) {
      if (this.keyRevisionDate > this.lastSyncDate) {
        return "Awaiting sync with new token";
      }
    }

    return;
  }
}
