import { Component, OnInit } from "@angular/core";

import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";
import { Utils } from "jslib-common/misc/utils";
import { SecretVerificationRequest } from "jslib-common/models/request/secretVerificationRequest";
import { ApiKeyResponse } from "jslib-common/models/response/apiKeyResponse";
import { Verification } from "jslib-common/types/verification";

@Component({
  selector: "app-api-key",
  templateUrl: "api-key.component.html",
})
export class ApiKeyComponent implements OnInit {
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
  clientKey: string;
  clientLocalKeyHash: string;

  constructor(
    private cryptoService: CryptoService,
    private userVerificationService: UserVerificationService,
    private logService: LogService
  ) {}

  async ngOnInit(): Promise<void> {
    this.clientKey = Utils.fromBufferToB64((await this.cryptoService.getKey()).key);
    this.clientLocalKeyHash = await this.cryptoService.getKeyHash();
  }

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

  get combinedApiKey() {
    return Utils.fromUtf8ToB64(
      JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        encClientEncInfo: JSON.stringify({
          clientEncKey: this.clientKey,
          clientLocalKeyHash: this.clientLocalKeyHash,
        }),
      })
    );
  }
}
