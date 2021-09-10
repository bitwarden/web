import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { I18nService } from 'jslib-common/abstractions/i18n.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { PolicyRequest } from 'jslib-common/models/request/policyRequest';

import { BasePolicy, BasePolicyComponent } from 'src/app/organizations/policies/base-policy.component';

export class DisablePersonalVaultExportPolicy extends BasePolicy {
    name = 'disablePersonalVaultExport';
    description = 'disablePersonalVaultExportDesc';
    type = PolicyType.DisablePersonalVaultExport;
    component = DisablePersonalVaultExportPolicyComponent;
}

@Component({
    selector: 'policy-disable-personal-vault-export',
    templateUrl: 'disable-personal-vault-export.component.html',
})
export class DisablePersonalVaultExportPolicyComponent extends BasePolicyComponent {
}
