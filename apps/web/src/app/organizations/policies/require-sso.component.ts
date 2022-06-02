import { Component } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PolicyType } from "jslib-common/enums/policyType";
import { Organization } from "jslib-common/models/domain/organization";
import { PolicyRequest } from "jslib-common/models/request/policyRequest";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class RequireSsoPolicy extends BasePolicy {
  name = "requireSso";
  description = "requireSsoPolicyDesc";
  type = PolicyType.RequireSso;
  component = RequireSsoPolicyComponent;

  display(organization: Organization) {
    return organization.useSso;
  }
}

@Component({
  selector: "policy-require-sso",
  templateUrl: "require-sso.component.html",
})
export class RequireSsoPolicyComponent extends BasePolicyComponent {
  constructor(private i18nService: I18nService) {
    super();
  }

  buildRequest(policiesEnabledMap: Map<PolicyType, boolean>): Promise<PolicyRequest> {
    const singleOrgEnabled = policiesEnabledMap.get(PolicyType.SingleOrg) ?? false;
    if (this.enabled.value && !singleOrgEnabled) {
      throw new Error(this.i18nService.t("requireSsoPolicyReqError"));
    }

    return super.buildRequest(policiesEnabledMap);
  }
}
