import { Component, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { LoginComponent as BaseLoginComponent } from "jslib-angular/components/login.component";
import { ApiService } from "jslib-common/abstractions/api.service";
import { AuthService } from "jslib-common/abstractions/auth.service";
import { CryptoFunctionService } from "jslib-common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { PolicyData } from "jslib-common/models/data/policyData";
import { MasterPasswordPolicyOptions } from "jslib-common/models/domain/masterPasswordPolicyOptions";
import { Policy } from "jslib-common/models/domain/policy";
import { ListResponse } from "jslib-common/models/response/listResponse";
import { PolicyResponse } from "jslib-common/models/response/policyResponse";

import { StateService } from "../../abstractions/state.service";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
})
export class LoginComponent extends BaseLoginComponent {
  showResetPasswordAutoEnrollWarning = false;
  enforcedPasswordPolicyOptions: MasterPasswordPolicyOptions;
  policies: ListResponse<PolicyResponse>;

  constructor(
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    private route: ActivatedRoute,
    platformUtilsService: PlatformUtilsService,
    environmentService: EnvironmentService,
    passwordGenerationService: PasswordGenerationService,
    cryptoFunctionService: CryptoFunctionService,
    private apiService: ApiService,
    private policyService: PolicyService,
    logService: LogService,
    ngZone: NgZone,
    protected stateService: StateService
  ) {
    super(
      authService,
      router,
      platformUtilsService,
      i18nService,
      stateService,
      environmentService,
      passwordGenerationService,
      cryptoFunctionService,
      logService,
      ngZone
    );
    this.onSuccessfulLoginNavigate = this.goAfterLogIn;
  }

  async ngOnInit() {
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email = qParams.email;
      }
      if (qParams.premium != null) {
        this.stateService.setLoginRedirect({ route: "/settings/premium" });
      } else if (qParams.org != null) {
        this.stateService.setLoginRedirect({
          route: "/settings/create-organization",
          qParams: { plan: qParams.org },
        });
      }

      // Are they coming from an email for sponsoring a families organization
      if (qParams.sponsorshipToken != null) {
        // After logging in redirect them to setup the families sponsorship
        this.stateService.setLoginRedirect({
          route: "/setup/families-for-enterprise",
          qParams: { token: qParams.sponsorshipToken },
        });
      }
      await super.ngOnInit();
      this.rememberEmail = await this.stateService.getRememberEmail();
    });

    const invite = await this.stateService.getOrganizationInvitation();
    if (invite != null) {
      let policyList: Policy[] = null;
      try {
        this.policies = await this.apiService.getPoliciesByToken(
          invite.organizationId,
          invite.token,
          invite.email,
          invite.organizationUserId
        );
        policyList = this.policyService.mapPoliciesFromToken(this.policies);
      } catch (e) {
        this.logService.error(e);
      }

      if (policyList != null) {
        const resetPasswordPolicy = this.policyService.getResetPasswordPolicyOptions(
          policyList,
          invite.organizationId
        );
        // Set to true if policy enabled and auto-enroll enabled
        this.showResetPasswordAutoEnrollWarning =
          resetPasswordPolicy[1] && resetPasswordPolicy[0].autoEnrollEnabled;

        this.enforcedPasswordPolicyOptions =
          await this.policyService.getMasterPasswordPolicyOptions(policyList);
      }
    }
  }

  async goAfterLogIn() {
    // Check master password against policy
    if (this.enforcedPasswordPolicyOptions != null) {
      const strengthResult = this.passwordGenerationService.passwordStrength(
        this.masterPassword,
        this.getPasswordStrengthUserInput()
      );
      const masterPasswordScore = strengthResult == null ? null : strengthResult.score;

      // If invalid, save policies and require update
      if (
        !this.policyService.evaluateMasterPassword(
          masterPasswordScore,
          this.masterPassword,
          this.enforcedPasswordPolicyOptions
        )
      ) {
        const policiesData: { [id: string]: PolicyData } = {};
        this.policies.data.map((p) => (policiesData[p.id] = new PolicyData(p)));
        await this.policyService.replace(policiesData);
        this.router.navigate(["update-password"]);
        return;
      }
    }

    const loginRedirect = await this.stateService.getLoginRedirect();
    if (loginRedirect != null) {
      this.router.navigate([loginRedirect.route], { queryParams: loginRedirect.qParams });
      await this.stateService.setLoginRedirect(null);
    } else {
      this.router.navigate([this.successRoute]);
    }
  }

  async submit() {
    await this.stateService.setRememberEmail(this.rememberEmail);
    if (!this.rememberEmail) {
      await this.stateService.setRememberedEmail(null);
    }
    await super.submit();
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
    return userInput;
  }
}
