import { Component } from '@angular/core';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { BasePolicy } from 'jslib-common/abstractions/policy.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { PolicyRequest } from 'jslib-common/models/request/policyRequest';

import { BasePolicyComponent } from '../manage/policy-edit.component';

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
        const requireSsoEnabled = policiesEnabledMap.get(PolicyType.RequireSso) ?? false;
        if (!this.enabled.value && requireSsoEnabled) {
            throw new Error(this.i18nService.t('disableRequireSsoError'));
        }

        return super.buildRequest(policiesEnabledMap);
    }
}
