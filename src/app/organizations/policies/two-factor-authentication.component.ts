import { Component } from '@angular/core';

import { BasePolicy } from 'jslib-common/abstractions/policy.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { BasePolicyComponent } from '../manage/policies.component';

export class TwoFactorAuthenticationPolicy extends BasePolicy {
    name = 'twoStepLogin';
    description = 'twoStepLoginPolicyDesc';
    type = PolicyType.TwoFactorAuthentication;
    component = TwoFactorAuthenticationPolicyComponent;
}

@Component({
    selector: 'policy-two-factor-authentication',
    templateUrl: 'two-factor-authentication.component.html',
})
export class TwoFactorAuthenticationPolicyComponent extends BasePolicyComponent {
}
