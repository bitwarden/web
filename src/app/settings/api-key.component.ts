import { Component } from "@angular/core";

import { LogService } from "jslib-common/abstractions/log.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";
import { SecretVerificationRequest } from "jslib-common/models/request/secretVerificationRequest";
import { ApiKeyResponse } from "jslib-common/models/response/apiKeyResponse";
import { Verification } from "jslib-common/types/verification";

@Component({
  selector: "app-api-key",
  templateUrl: "api-key.component.html",
})
export class ApiKeyComponent {
  keyType: string;
  isRotation: boolean;
  postKey: (entityId: string, request: SecretVerificationRequest) => Promise<ApiKeyResponse>;
  entityId: string;
  scope: string;
  grantType: string;
  apiKeyTitle: string;
  apiKeyWarning: string;
  apiKeyDescription: string;

  masterPassword: Verification;
  formPromise: Promise<ApiKeyResponse>;
  clientId: string;
  clientSecret: string;

  constructor(
    private userVerificationService: UserVerificationService,
    private logService: LogService
  ) {}

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.postKey(this.entityId, request));
      const response = await this.formPromise;
      this.clientSecret = response.apiKey;
      this.clientId = `${this.keyType}.${this.entityId}`;
    } catch (e) {
      this.logService.error(e);
    }
  }
}
