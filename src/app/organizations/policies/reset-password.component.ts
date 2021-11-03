import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserService } from 'jslib-common/abstractions/user.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { Organization } from 'jslib-common/models/domain/organization';

import { BasePolicy, BasePolicyComponent } from './base-policy.component';

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
        autoEnrollEnabled: false,
    });

    defaultTypes: { name: string; value: string; }[];
    showKeyConnectorInfo: boolean = false;

    constructor(private fb: FormBuilder, private userService: UserService) {
        super();
    }

    async ngOnInit() {
        super.ngOnInit();
        const organization = await this.userService.getOrganization(this.policyResponse.organizationId);
        this.showKeyConnectorInfo = organization.usesCryptoAgent;
    }
}
