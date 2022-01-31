import { Component } from "@angular/core";

import { PolicyType } from "jslib-common/enums/policyType";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class TwoFactorAuthenticationPolicy extends BasePolicy {
  name = "twoStepLogin";
  description = "twoStepLoginPolicyDesc";
  type = PolicyType.TwoFactorAuthentication;
  component = TwoFactorAuthenticationPolicyComponent;
}

@Component({
  selector: "policy-two-factor-authentication",
  templateUrl: "two-factor-authentication.component.html",
})
export class TwoFactorAuthenticationPolicyComponent extends BasePolicyComponent {}
