import { Component } from '@angular/core';

import { BasePolicy } from 'jslib-common/abstractions/policy.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { BasePolicyComponent } from '../manage/policy-edit.component';

export class PersonalOwnershipPolicy extends BasePolicy {
    name = 'personalOwnership';
    description = 'personalOwnershipPolicyDesc';
    type = PolicyType.PersonalOwnership;
    component = PersonalOwnershipPolicyComponent;
}

@Component({
    selector: 'policy-personal-ownership',
    templateUrl: 'personal-ownership.component.html',
})
export class PersonalOwnershipPolicyComponent extends BasePolicyComponent {
}
