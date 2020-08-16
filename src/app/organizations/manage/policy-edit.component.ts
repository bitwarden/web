import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { PolicyType } from 'jslib/enums/policyType';

import { PolicyRequest } from 'jslib/models/request/policyRequest';

import { PolicyResponse } from 'jslib/models/response/policyResponse';

@Component({
    selector: 'app-policy-edit',
    templateUrl: 'policy-edit.component.html',
})
export class PolicyEditComponent implements OnInit {
    @Input() name: string;
    @Input() description: string;
    @Input() type: PolicyType;
    @Input() organizationId: string;
    @Output() onSavedPolicy = new EventEmitter();

    policyType = PolicyType;
    loading = true;
    enabled = false;
    formPromise: Promise<any>;
    passwordScores: any[];
    defaultTypes: any[];

    // Master password

    masterPassMinComplexity?: number = null;
    masterPassMinLength?: number;
    masterPassRequireUpper?: number;
    masterPassRequireLower?: number;
    masterPassRequireNumbers?: number;
    masterPassRequireSpecial?: number;

    // Password generator

    passGenDefaultType?: string;
    passGenMinLength?: number;
    passGenUseUpper?: boolean;
    passGenUseLower?: boolean;
    passGenUseNumbers?: boolean;
    passGenUseSpecial?: boolean;
    passGenMinNumbers?: number;
    passGenMinSpecial?: number;
    passGenMinNumberWords?: number;
    passGenCapitalize?: boolean;
    passGenIncludeNumber?: boolean;

    private policy: PolicyResponse;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService
    ) {
        this.passwordScores = [
            { name: '-- ' + i18nService.t('select') + ' --', value: null },
            { name: i18nService.t('weak') + ' (0)', value: 0 },
            { name: i18nService.t('weak') + ' (1)', value: 1 },
            { name: i18nService.t('weak') + ' (2)', value: 2 },
            { name: i18nService.t('good') + ' (3)', value: 3 },
            { name: i18nService.t('strong') + ' (4)', value: 4 },
        ];
        this.defaultTypes = [
            { name: i18nService.t('userPreference'), value: null },
            { name: i18nService.t('password'), value: 'password' },
            { name: i18nService.t('passphrase'), value: 'passphrase' },
        ];
    }

    async ngOnInit() {
        await this.load();
        this.loading = false;
    }

    async load() {
        try {
            this.policy = await this.apiService.getPolicy(this.organizationId, this.type);

            if (this.policy != null) {
                this.enabled = this.policy.enabled;
                if (this.policy.data != null) {
                    switch (this.type) {
                        case PolicyType.PasswordGenerator:
                            this.passGenDefaultType = this.policy.data.defaultType;
                            this.passGenMinLength = this.policy.data.minLength;
                            this.passGenUseUpper = this.policy.data.useUpper;
                            this.passGenUseLower = this.policy.data.useLower;
                            this.passGenUseNumbers = this.policy.data.useNumbers;
                            this.passGenUseSpecial = this.policy.data.useSpecial;
                            this.passGenMinNumbers = this.policy.data.minNumbers;
                            this.passGenMinSpecial = this.policy.data.minSpecial;
                            this.passGenMinNumberWords = this.policy.data.minNumberWords;
                            this.passGenCapitalize = this.policy.data.capitalize;
                            this.passGenIncludeNumber = this.policy.data.includeNumber;
                            break;
                        case PolicyType.MasterPassword:
                            this.masterPassMinComplexity = this.policy.data.minComplexity;
                            this.masterPassMinLength = this.policy.data.minLength;
                            this.masterPassRequireUpper = this.policy.data.requireUpper;
                            this.masterPassRequireLower = this.policy.data.requireLower;
                            this.masterPassRequireNumbers = this.policy.data.requireNumbers;
                            this.masterPassRequireSpecial = this.policy.data.requireSpecial;
                            break;
                        default:
                            break;
                    }
                }
            }
        } catch (e) {
            if (e.statusCode === 404) {
                this.enabled = false;
            } else {
                throw e;
            }
        }
    }

    async submit() {
        const request = new PolicyRequest();
        request.enabled = this.enabled;
        request.type = this.type;
        request.data = null;
        switch (this.type) {
            case PolicyType.PasswordGenerator:
                request.data = {
                    defaultType: this.passGenDefaultType,
                    minLength: this.passGenMinLength || null,
                    useUpper: this.passGenUseUpper,
                    useLower: this.passGenUseLower,
                    useNumbers: this.passGenUseNumbers,
                    useSpecial: this.passGenUseSpecial,
                    minNumbers: this.passGenMinNumbers || null,
                    minSpecial: this.passGenMinSpecial || null,
                    minNumberWords: this.passGenMinNumberWords || null,
                    capitalize: this.passGenCapitalize,
                    includeNumber: this.passGenIncludeNumber,
                };
                break;
            case PolicyType.MasterPassword:
                request.data = {
                    minComplexity: this.masterPassMinComplexity || null,
                    minLength: this.masterPassMinLength || null,
                    requireUpper: this.masterPassRequireUpper,
                    requireLower: this.masterPassRequireLower,
                    requireNumbers: this.masterPassRequireNumbers,
                    requireSpecial: this.masterPassRequireSpecial,
                };
                break;
            default:
                break;
        }
        try {
            this.formPromise = this.apiService.putPolicy(this.organizationId, this.type, request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Edited Policy' });
            this.toasterService.popAsync(
                'success',
                null,
                this.i18nService.t('editedPolicyId', this.name)
            );
            this.onSavedPolicy.emit();
        } catch {}
    }
}
