import { Component, OnInit, Type, ViewChild, ViewContainerRef } from "@angular/core";

import { ModalRef } from "jslib-angular/components/modal/modal.ref";
import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { PolicyType } from "jslib-common/enums/policyType";
import { TwoFactorProviderType } from "jslib-common/enums/twoFactorProviderType";
import { DeviceVerificationRequest } from "jslib-common/models/request/DeviceVerificationRequest";
import { TwoFactorProviders } from "jslib-common/services/twoFactor.service";

import { TwoFactorAuthenticatorComponent } from "./two-factor-authenticator.component";
import { TwoFactorDuoComponent } from "./two-factor-duo.component";
import { TwoFactorEmailComponent } from "./two-factor-email.component";
import { TwoFactorRecoveryComponent } from "./two-factor-recovery.component";
import { TwoFactorWebAuthnComponent } from "./two-factor-webauthn.component";
import { TwoFactorYubiKeyComponent } from "./two-factor-yubikey.component";

@Component({
  selector: "app-two-factor-setup",
  templateUrl: "two-factor-setup.component.html",
})
export class TwoFactorSetupComponent implements OnInit {
  @ViewChild("recoveryTemplate", { read: ViewContainerRef, static: true })
  recoveryModalRef: ViewContainerRef;
  @ViewChild("authenticatorTemplate", { read: ViewContainerRef, static: true })
  authenticatorModalRef: ViewContainerRef;
  @ViewChild("yubikeyTemplate", { read: ViewContainerRef, static: true })
  yubikeyModalRef: ViewContainerRef;
  @ViewChild("duoTemplate", { read: ViewContainerRef, static: true }) duoModalRef: ViewContainerRef;
  @ViewChild("emailTemplate", { read: ViewContainerRef, static: true })
  emailModalRef: ViewContainerRef;
  @ViewChild("webAuthnTemplate", { read: ViewContainerRef, static: true })
  webAuthnModalRef: ViewContainerRef;

  organizationId: string;
  providers: any[] = [];
  canAccessPremium: boolean;
  showPolicyWarning = false;
  loading = true;
  enableDeviceVerification: boolean;
  isDeviceVerificationSectionEnabled: boolean;
  modal: ModalRef;
  formPromise: Promise<any>;

  constructor(
    protected apiService: ApiService,
    protected modalService: ModalService,
    protected messagingService: MessagingService,
    protected policyService: PolicyService,
    private stateService: StateService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    this.canAccessPremium = await this.stateService.getCanAccessPremium();
    try {
      const deviceVerificationSettings = await this.apiService.getDeviceVerificationSettings();
      this.isDeviceVerificationSectionEnabled =
        deviceVerificationSettings.isDeviceVerificationSectionEnabled;
      this.enableDeviceVerification = deviceVerificationSettings.unknownDeviceVerificationEnabled;
    } catch (e) {
      this.logService.error(e);
    }

    for (const key in TwoFactorProviders) {
      // eslint-disable-next-line
      if (!TwoFactorProviders.hasOwnProperty(key)) {
        continue;
      }

      const p = (TwoFactorProviders as any)[key];
      if (this.filterProvider(p.type)) {
        continue;
      }

      this.providers.push({
        type: p.type,
        name: p.name,
        description: p.description,
        enabled: false,
        premium: p.premium,
        sort: p.sort,
      });
    }

    this.providers.sort((a: any, b: any) => a.sort - b.sort);
    await this.load();
  }

  async load() {
    this.loading = true;
    const providerList = await this.getTwoFactorProviders();
    providerList.data.forEach((p) => {
      this.providers.forEach((p2) => {
        if (p.type === p2.type) {
          p2.enabled = p.enabled;
        }
      });
    });
    this.evaluatePolicies();
    this.loading = false;
  }

  async manage(type: TwoFactorProviderType) {
    switch (type) {
      case TwoFactorProviderType.Authenticator: {
        const authComp = await this.openModal(
          this.authenticatorModalRef,
          TwoFactorAuthenticatorComponent
        );
        authComp.onUpdated.subscribe((enabled: boolean) => {
          this.updateStatus(enabled, TwoFactorProviderType.Authenticator);
        });
        break;
      }
      case TwoFactorProviderType.Yubikey: {
        const yubiComp = await this.openModal(this.yubikeyModalRef, TwoFactorYubiKeyComponent);
        yubiComp.onUpdated.subscribe((enabled: boolean) => {
          this.updateStatus(enabled, TwoFactorProviderType.Yubikey);
        });
        break;
      }
      case TwoFactorProviderType.Duo: {
        const duoComp = await this.openModal(this.duoModalRef, TwoFactorDuoComponent);
        duoComp.onUpdated.subscribe((enabled: boolean) => {
          this.updateStatus(enabled, TwoFactorProviderType.Duo);
        });
        break;
      }
      case TwoFactorProviderType.Email: {
        const emailComp = await this.openModal(this.emailModalRef, TwoFactorEmailComponent);
        emailComp.onUpdated.subscribe((enabled: boolean) => {
          this.updateStatus(enabled, TwoFactorProviderType.Email);
        });
        break;
      }
      case TwoFactorProviderType.WebAuthn: {
        const webAuthnComp = await this.openModal(
          this.webAuthnModalRef,
          TwoFactorWebAuthnComponent
        );
        webAuthnComp.onUpdated.subscribe((enabled: boolean) => {
          this.updateStatus(enabled, TwoFactorProviderType.WebAuthn);
        });
        break;
      }
      default:
        break;
    }
  }

  recoveryCode() {
    this.openModal(this.recoveryModalRef, TwoFactorRecoveryComponent);
  }

  async premiumRequired() {
    if (!this.canAccessPremium) {
      this.messagingService.send("premiumRequired");
      return;
    }
  }

  protected getTwoFactorProviders() {
    return this.apiService.getTwoFactorProviders();
  }

  protected filterProvider(type: TwoFactorProviderType) {
    return type === TwoFactorProviderType.OrganizationDuo;
  }

  protected async openModal<T>(ref: ViewContainerRef, type: Type<T>): Promise<T> {
    const [modal, childComponent] = await this.modalService.openViewRef(type, ref);
    this.modal = modal;

    return childComponent;
  }

  protected updateStatus(enabled: boolean, type: TwoFactorProviderType) {
    if (!enabled && this.modal != null) {
      this.modal.close();
    }
    this.providers.forEach((p) => {
      if (p.type === type) {
        p.enabled = enabled;
      }
    });
    this.evaluatePolicies();
  }

  private async evaluatePolicies() {
    if (this.organizationId == null && this.providers.filter((p) => p.enabled).length === 1) {
      this.showPolicyWarning = await this.policyService.policyAppliesToUser(
        PolicyType.TwoFactorAuthentication
      );
    } else {
      this.showPolicyWarning = false;
    }
  }

  async submit() {
    try {
      if (this.enableDeviceVerification) {
        const email = await this.stateService.getEmail();
        const confirmed = await this.platformUtilsService.showDialog(
          this.i18nService.t(
            "areYouSureYouWantToEnableDeviceVerificationTheVerificationCodeEmailsWillArriveAtX",
            email
          ),
          this.i18nService.t("deviceVerification"),
          this.i18nService.t("yes"),
          this.i18nService.t("no"),
          "warning"
        );
        if (!confirmed) {
          return;
        }
      }

      this.formPromise = this.apiService.putDeviceVerificationSettings(
        new DeviceVerificationRequest(this.enableDeviceVerification)
      );
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("updatedDeviceVerification")
      );
    } catch (e) {
      this.logService.error(e);
    }
  }
}
