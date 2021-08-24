import { Component } from '@angular/core';

import { I18nService } from 'jslib-common/abstractions/i18n.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { PolicyRequest } from 'jslib-common/models/request/policyRequest';

import { BasePolicy, BasePolicyComponent } from './base-policy.component';

export class SingleOrgPolicy extends BasePolicy {
    name = 'singleOrg';
    description = 'singleOrgDesc';
    type = PolicyType.SingleOrg;
    component = SingleOrgPolicyComponent;
}

@Component({
    selector: 'policy-single-org',
    templateUrl: 'single-org.component.html',
})
export class SingleOrgPolicyComponent extends BasePolicyComponent {

    constructor(private i18nService: I18nService) {
        super();
    }

    buildRequest(policiesEnabledMap: Map<PolicyType, boolean>): Promise<PolicyRequest> {
        const dependentPolicies = [PolicyType.RequireSso, PolicyType.MaximumVaultTimeout];
        const hasEnabledDependentPolicy = dependentPolicies.some(p => policiesEnabledMap.get(p) ?? false);

        if (!this.enabled.value && hasEnabledDependentPolicy) {
            throw new Error(this.i18nService.t('disableRequireSsoError'));
        }

        return super.buildRequest(policiesEnabledMap);
    }
}
