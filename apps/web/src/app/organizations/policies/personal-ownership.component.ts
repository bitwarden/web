import { Component } from "@angular/core";

import { PolicyType } from "jslib-common/enums/policyType";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class PersonalOwnershipPolicy extends BasePolicy {
  name = "personalOwnership";
  description = "personalOwnershipPolicyDesc";
  type = PolicyType.PersonalOwnership;
  component = PersonalOwnershipPolicyComponent;
}

@Component({
  selector: "policy-personal-ownership",
  templateUrl: "personal-ownership.component.html",
})
export class PersonalOwnershipPolicyComponent extends BasePolicyComponent {}
