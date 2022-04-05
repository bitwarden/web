import { Component, EventEmitter, Output } from "@angular/core";

import { LogService } from "jslib-common/abstractions/log.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";
import { SecretVerificationRequest } from "jslib-common/models/request/secretVerificationRequest";
import { Verification } from "jslib-common/types/verification";

@Component({
  selector: "master-password-enrollment",
  templateUrl: "master-password-enrollment.component.html",
})
export class MasterPasswordEnrollmentComponent {
  masterPassword: Verification;
  formPromise: Promise<void | SecretVerificationRequest>;
  passwordEnrollmentTitle: string;
  passwordEnrollmentDescription: string;

  @Output()
  requestBuilt = new EventEmitter<SecretVerificationRequest>();

  constructor(
    private userVerificationService: UserVerificationService,
    private logService: LogService
  ) {}

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.requestBuilt.emit(request));

      return await this.formPromise;
    } catch (e) {
      this.logService.error(e);
    }
  }
}
