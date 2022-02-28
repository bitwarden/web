import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PolicyType } from "jslib-common/enums/policyType";
import { PolicyRequest } from "jslib-common/models/request/policyRequest";

import {
  BasePolicy,
  BasePolicyComponent,
} from "src/app/organizations/policies/base-policy.component";

export class MaximumVaultTimeoutPolicy extends BasePolicy {
  name = "maximumVaultTimeout";
  description = "maximumVaultTimeoutDesc";
  type = PolicyType.MaximumVaultTimeout;
  component = MaximumVaultTimeoutPolicyComponent;
}

@Component({
  selector: "policy-maximum-timeout",
  templateUrl: "maximum-vault-timeout.component.html",
})
export class MaximumVaultTimeoutPolicyComponent extends BasePolicyComponent {
  data = this.formBuilder.group({
    hours: [null],
    minutes: [null],
  });

  constructor(private formBuilder: FormBuilder, private i18nService: I18nService) {
    super();
  }

  loadData() {
    const minutes = this.policyResponse.data?.minutes;

    if (minutes == null) {
      return;
    }

    this.data.patchValue({
      hours: Math.floor(minutes / 60),
      minutes: minutes % 60,
    });
  }

  buildRequestData() {
    if (this.data.value.hours == null && this.data.value.minutes == null) {
      return null;
    }

    return {
      minutes: this.data.value.hours * 60 + this.data.value.minutes,
    };
  }

  buildRequest(policiesEnabledMap: Map<PolicyType, boolean>): Promise<PolicyRequest> {
    const singleOrgEnabled = policiesEnabledMap.get(PolicyType.SingleOrg) ?? false;
    if (this.enabled.value && !singleOrgEnabled) {
      throw new Error(this.i18nService.t("requireSsoPolicyReqError"));
    }

    const data = this.buildRequestData();
    if (data?.minutes == null || data?.minutes <= 0) {
      throw new Error(this.i18nService.t("invalidMaximumVaultTimeout"));
    }

    return super.buildRequest(policiesEnabledMap);
  }
}
