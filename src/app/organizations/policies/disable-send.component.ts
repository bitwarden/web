import { Component } from '@angular/core';

import { BasePolicy } from 'jslib-common/abstractions/policy.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { BasePolicyComponent } from '../manage/policies.component';

export class DisableSendPolicy extends BasePolicy {
    name = 'disableSend';
    description = 'disableSendPolicyDesc';
    type = PolicyType.DisableSend;
    component = DisableSendPolicyComponent;
}

@Component({
    selector: 'policy-disable-send',
    templateUrl: 'disable-send.component.html',
})
export class DisableSendPolicyComponent extends BasePolicyComponent {
}
