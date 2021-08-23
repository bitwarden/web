import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { BasePolicy } from 'jslib-common/abstractions/policy.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { BasePolicyComponent } from '../manage/policy-edit.component';

export class PasswordGeneratorPolicy extends BasePolicy {
    name = 'passwordGenerator';
    description = 'passwordGeneratorPolicyDesc';
    type = PolicyType.PasswordGenerator;
    component = PasswordGeneratorPolicyComponent;
}

@Component({
    selector: 'policy-password-generator',
    templateUrl: 'password-generator.component.html',
})
export class PasswordGeneratorPolicyComponent extends BasePolicyComponent {

    data = this.fb.group({
        defaultType: [null],
        minLength: [null],
        useUpper: [null],
        useLower: [null],
        useNumbers: [null],
        useSpecial: [null],
        minNumbers: [null],
        minSpecial: [null],
        minNumberWords: [null],
        capitalize: [null],
        includeNumber: [null],
    });

    defaultTypes: { name: string; value: string; }[];

    constructor(private fb: FormBuilder, i18nService: I18nService) {
        super();

        this.defaultTypes = [
            { name: i18nService.t('userPreference'), value: null },
            { name: i18nService.t('password'), value: 'password' },
            { name: i18nService.t('passphrase'), value: 'passphrase' },
        ];
    }
}
