import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { BasePolicy } from 'jslib-common/abstractions/policy.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { BasePolicyComponent } from '../manage/policies.component';

export class SendOptionsPolicy extends BasePolicy {
    name = 'sendOptions';
    description = 'sendOptionsPolicyDesc';
    type = PolicyType.SendOptions;
    component = SendOptionsPolicyComponent;
}

@Component({
    selector: 'policy-send-options',
    templateUrl: 'send-options.component.html',
})
export class SendOptionsPolicyComponent extends BasePolicyComponent {

    data = this.fb.group({
        disableHideEmail: false,
    });

    constructor(private fb: FormBuilder) {
        super();
    }
}
