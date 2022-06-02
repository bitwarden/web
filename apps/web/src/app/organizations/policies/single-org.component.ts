import { Component } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PolicyType } from "jslib-common/enums/policyType";
import { PolicyRequest } from "jslib-common/models/request/policyRequest";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class SingleOrgPolicy extends BasePolicy {
  name = "singleOrg";
  description = "singleOrgDesc";
  type = PolicyType.SingleOrg;
  component = SingleOrgPolicyComponent;
}

@Component({
  selector: "policy-single-org",
  templateUrl: "single-org.component.html",
})
export class SingleOrgPolicyComponent extends BasePolicyComponent {
  constructor(private i18nService: I18nService) {
    super();
  }

  buildRequest(policiesEnabledMap: Map<PolicyType, boolean>): Promise<PolicyRequest> {
    if (!this.enabled.value) {
      if (policiesEnabledMap.get(PolicyType.RequireSso) ?? false) {
        throw new Error(
          this.i18nService.t("disableRequiredError", this.i18nService.t("requireSso"))
        );
      }

      if (policiesEnabledMap.get(PolicyType.MaximumVaultTimeout) ?? false) {
        throw new Error(
          this.i18nService.t("disableRequiredError", this.i18nService.t("maximumVaultTimeoutLabel"))
        );
      }
    }

    return super.buildRequest(policiesEnabledMap);
  }
}
