import { Component } from '@angular/core';
import { ApiKeyResponse } from 'jslib-common/models/response/apiKeyResponse';
import { OrganizationApiKeyRequest } from 'jslib-common/models/request/organizationApiKeyRequest';
import { UserVerificationService } from 'jslib-common/abstractions/userVerification.service';
import { Verification } from 'jslib-common/types/verification';
import { ApiService } from 'jslib-common/abstractions/api.service';
import { OrganizationApiKeyType } from 'jslib-common/enums/organizationApiKeyType';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

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
  clientSecret: string;
  
  constructor(
    private userVerificationService: UserVerificationService,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService
  ) {}

  copy() {
    this.platformUtilsService.copyToClipboard(this.clientSecret);
  }

  async submit() {
    this.formPromise = this.userVerificationService
      .buildRequest(this.masterPassword, OrganizationApiKeyRequest)
      .then((request) => {
        request.type = OrganizationApiKeyType.BillingSync;
        return this.apiService.postOrganizationApiKey(this.organizationId, request)
      });
    const response = await this.formPromise;
    this.clientSecret = response.apiKey;
  }
}
