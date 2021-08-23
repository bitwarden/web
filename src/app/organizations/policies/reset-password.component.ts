import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { BasePolicy } from 'jslib-common/abstractions/policy.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { Organization } from 'jslib-common/models/domain/organization';

import { BasePolicyComponent } from '../manage/policies.component';

export class ResetPasswordPolicy extends BasePolicy {
    name = 'resetPasswordPolicy';
    description = 'resetPasswordPolicyDescription';
    type = PolicyType.ResetPassword;
    component = ResetPasswordPolicyComponent;

    display(organization: Organization) {
        return organization.useResetPassword;
    }
}

@Component({
    selector: 'policy-reset-password',
    templateUrl: 'reset-password.component.html',
})
export class ResetPasswordPolicyComponent extends BasePolicyComponent {

    data = this.fb.group({
        autoEnroll: false,
    });

    defaultTypes: { name: string; value: string; }[];

    constructor(private fb: FormBuilder) {
        super();
    }
}
