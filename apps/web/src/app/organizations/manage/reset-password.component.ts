import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { EncString } from "jslib-common/models/domain/encString";
import { MasterPasswordPolicyOptions } from "jslib-common/models/domain/masterPasswordPolicyOptions";
import { SymmetricCryptoKey } from "jslib-common/models/domain/symmetricCryptoKey";
import { OrganizationUserResetPasswordRequest } from "jslib-common/models/request/organizationUserResetPasswordRequest";

@Component({
  selector: "app-reset-password",
  templateUrl: "reset-password.component.html",
})
export class ResetPasswordComponent implements OnInit {
  @Input() name: string;
  @Input() email: string;
  @Input() id: string;
  @Input() organizationId: string;
  @Output() onPasswordReset = new EventEmitter();

  enforcedPolicyOptions: MasterPasswordPolicyOptions;
  newPassword: string = null;
  showPassword = false;
  masterPasswordScore: number;
  formPromise: Promise<any>;
  private newPasswordStrengthTimeout: any;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private passwordGenerationService: PasswordGenerationService,
    private policyService: PolicyService,
    private cryptoService: CryptoService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    // Get Enforced Policy Options
    this.enforcedPolicyOptions = await this.policyService.getMasterPasswordPolicyOptions();
  }

  get loggedOutWarningName() {
    return this.name != null ? this.name : this.i18nService.t("thisUser");
  }

  async generatePassword() {
    const options = (await this.passwordGenerationService.getOptions())[0];
    this.newPassword = await this.passwordGenerationService.generatePassword(options);
    this.updatePasswordStrength();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    document.getElementById("newPassword").focus();
  }

  copy(value: string) {
    if (value == null) {
      return;
    }

    this.platformUtilsService.copyToClipboard(value, { window: window });
    this.platformUtilsService.showToast(
      "info",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("password"))
    );
  }

  async submit() {
    // Validation
    if (this.newPassword == null || this.newPassword === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPassRequired")
      );
      return false;
    }

    if (this.newPassword.length < 8) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPassLength")
      );
      return false;
    }

    if (
      this.enforcedPolicyOptions != null &&
      !this.policyService.evaluateMasterPassword(
        this.masterPasswordScore,
        this.newPassword,
        this.enforcedPolicyOptions
      )
    ) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordPolicyRequirementsNotMet")
      );
      return;
    }

    if (this.masterPasswordScore < 3) {
      const result = await this.platformUtilsService.showDialog(
        this.i18nService.t("weakMasterPasswordDesc"),
        this.i18nService.t("weakMasterPassword"),
        this.i18nService.t("yes"),
        this.i18nService.t("no"),
        "warning"
      );
      if (!result) {
        return false;
      }
    }

    // Get user Information (kdf type, kdf iterations, resetPasswordKey, private key) and change password
    try {
      this.formPromise = this.apiService
        .getOrganizationUserResetPasswordDetails(this.organizationId, this.id)
        .then(async (response) => {
          if (response == null) {
            throw new Error(this.i18nService.t("resetPasswordDetailsError"));
          }

          const kdfType = response.kdf;
          const kdfIterations = response.kdfIterations;
          const resetPasswordKey = response.resetPasswordKey;
          const encryptedPrivateKey = response.encryptedPrivateKey;

          // Decrypt Organization's encrypted Private Key with org key
          const orgSymKey = await this.cryptoService.getOrgKey(this.organizationId);
          const decPrivateKey = await this.cryptoService.decryptToBytes(
            new EncString(encryptedPrivateKey),
            orgSymKey
          );

          // Decrypt User's Reset Password Key to get EncKey
          const decValue = await this.cryptoService.rsaDecrypt(resetPasswordKey, decPrivateKey);
          const userEncKey = new SymmetricCryptoKey(decValue);

          // Create new key and hash new password
          const newKey = await this.cryptoService.makeKey(
            this.newPassword,
            this.email.trim().toLowerCase(),
            kdfType,
            kdfIterations
          );
          const newPasswordHash = await this.cryptoService.hashPassword(this.newPassword, newKey);

          // Create new encKey for the User
          const newEncKey = await this.cryptoService.remakeEncKey(newKey, userEncKey);

          // Create request
          const request = new OrganizationUserResetPasswordRequest();
          request.key = newEncKey[1].encryptedString;
          request.newMasterPasswordHash = newPasswordHash;

          // Change user's password
          return this.apiService.putOrganizationUserResetPassword(
            this.organizationId,
            this.id,
            request
          );
        });

      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("resetPasswordSuccess")
      );
      this.onPasswordReset.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  updatePasswordStrength() {
    if (this.newPasswordStrengthTimeout != null) {
      clearTimeout(this.newPasswordStrengthTimeout);
    }
    this.newPasswordStrengthTimeout = setTimeout(() => {
      const strengthResult = this.passwordGenerationService.passwordStrength(
        this.newPassword,
        this.getPasswordStrengthUserInput()
      );
      this.masterPasswordScore = strengthResult == null ? null : strengthResult.score;
    }, 300);
  }

  private getPasswordStrengthUserInput() {
    let userInput: string[] = [];
    const atPosition = this.email.indexOf("@");
    if (atPosition > -1) {
      userInput = userInput.concat(
        this.email
          .substr(0, atPosition)
          .trim()
          .toLowerCase()
          .split(/[^A-Za-z0-9]/)
      );
    }
    if (this.name != null && this.name !== "") {
      userInput = userInput.concat(this.name.trim().toLowerCase().split(" "));
    }
    return userInput;
  }
}
