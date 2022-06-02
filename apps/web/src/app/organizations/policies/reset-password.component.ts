import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PolicyType } from "jslib-common/enums/policyType";
import { Organization } from "jslib-common/models/domain/organization";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class ResetPasswordPolicy extends BasePolicy {
  name = "resetPasswordPolicy";
  description = "resetPasswordPolicyDescription";
  type = PolicyType.ResetPassword;
  component = ResetPasswordPolicyComponent;

  display(organization: Organization) {
    return organization.useResetPassword;
  }
}

@Component({
  selector: "policy-reset-password",
  templateUrl: "reset-password.component.html",
})
export class ResetPasswordPolicyComponent extends BasePolicyComponent {
  data = this.formBuilder.group({
    autoEnrollEnabled: false,
  });

  defaultTypes: { name: string; value: string }[];
  showKeyConnectorInfo = false;

  constructor(private formBuilder: FormBuilder, private organizationService: OrganizationService) {
    super();
  }

  async ngOnInit() {
    super.ngOnInit();
    const organization = await this.organizationService.get(this.policyResponse.organizationId);
    this.showKeyConnectorInfo = organization.keyConnectorEnabled;
  }
}
