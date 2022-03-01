import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { ChangePasswordComponent } from "jslib-angular/components/change-password.component";
import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { KdfType } from "jslib-common/enums/kdfType";
import { PolicyData } from "jslib-common/models/data/policyData";
import { Policy } from "jslib-common/models/domain/policy";
import { SymmetricCryptoKey } from "jslib-common/models/domain/symmetricCryptoKey";
import { EmergencyAccessPasswordRequest } from "jslib-common/models/request/emergencyAccessPasswordRequest";
import { PolicyResponse } from "jslib-common/models/response/policyResponse";

@Component({
  selector: "emergency-access-takeover",
  templateUrl: "emergency-access-takeover.component.html",
})
export class EmergencyAccessTakeoverComponent extends ChangePasswordComponent implements OnInit {
  @Output() onDone = new EventEmitter();
  @Input() emergencyAccessId: string;
  @Input() name: string;
  @Input() email: string;
  @Input() kdf: KdfType;
  @Input() kdfIterations: number;

  formPromise: Promise<any>;

  constructor(
    i18nService: I18nService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    stateService: StateService,
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    policyService: PolicyService,
    private apiService: ApiService,
    private logService: LogService
  ) {
    super(
      i18nService,
      cryptoService,
      messagingService,
      passwordGenerationService,
      platformUtilsService,
      policyService,
      stateService
    );
  }

  async ngOnInit() {
    const response = await this.apiService.getEmergencyGrantorPolicies(this.emergencyAccessId);
    if (response.data != null && response.data.length > 0) {
      const policies = response.data.map(
        (policyResponse: PolicyResponse) => new Policy(new PolicyData(policyResponse))
      );
      this.enforcedPolicyOptions = await this.policyService.getMasterPasswordPolicyOptions(
        policies
      );
    }
  }

  async submit() {
    if (!(await this.strongPassword())) {
      return;
    }

    const takeoverResponse = await this.apiService.postEmergencyAccessTakeover(
      this.emergencyAccessId
    );

    const oldKeyBuffer = await this.cryptoService.rsaDecrypt(takeoverResponse.keyEncrypted);
    const oldEncKey = new SymmetricCryptoKey(oldKeyBuffer);

    if (oldEncKey == null) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("unexpectedError")
      );
      return;
    }

    const key = await this.cryptoService.makeKey(
      this.masterPassword,
      this.email,
      takeoverResponse.kdf,
      takeoverResponse.kdfIterations
    );
    const masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, key);

    const encKey = await this.cryptoService.remakeEncKey(key, oldEncKey);

    const request = new EmergencyAccessPasswordRequest();
    request.newMasterPasswordHash = masterPasswordHash;
    request.key = encKey[1].encryptedString;

    this.apiService.postEmergencyAccessPassword(this.emergencyAccessId, request);

    try {
      this.onDone.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
