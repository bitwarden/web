import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

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

    // Master password

    masterPassMinLength?: number;
    masterPassMinNumbers?: number;
    masterPassMinSpecial?: number;
    masterPassUseLower?: number;
    masterPassUseUpper?: number;
    masterPassMinComplexity?: number;

    // Password generator

    passGenMinLength?: number;
    passGenMinNumbers?: number;
    passGenMinSpecial?: number;
    passGenUseNumbers?: boolean;
    passGenUseSpecial?: boolean;
    passGenUseUpper?: boolean;
    passGenUseLower?: boolean;

    private policy: PolicyResponse;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private collectionService: CollectionService, private platformUtilsService: PlatformUtilsService) { }

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
                            this.passGenMinLength = this.policy.data.minLength;
                            this.passGenMinNumbers = this.policy.data.minNumbers;
                            this.passGenMinSpecial = this.policy.data.minSpecial;
                            this.passGenUseLower = this.policy.data.useLower;
                            this.passGenUseUpper = this.policy.data.useUpper;
                            this.passGenUseSpecial = this.policy.data.useSpecial;
                            this.passGenUseNumbers = this.policy.data.useNumbers;
                            break;
                        case PolicyType.MasterPassword:
                            this.masterPassMinLength = this.policy.data.minLength;
                            this.masterPassMinNumbers = this.policy.data.minNumbers;
                            this.masterPassMinSpecial = this.policy.data.minSpecial;
                            this.masterPassUseLower = this.policy.data.useLower;
                            this.masterPassUseUpper = this.policy.data.useUpper;
                            this.masterPassMinComplexity = this.policy.data.minComplexity;
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
                    minLength: this.passGenMinLength,
                    minNumbers: this.passGenMinNumbers,
                    minSpecial: this.passGenMinSpecial,
                    useNumbers: this.passGenUseNumbers,
                    useSpecial: this.passGenUseSpecial,
                    useLower: this.passGenUseLower,
                    useUpper: this.passGenUseUpper,
                };
                break;
            case PolicyType.MasterPassword:
                request.data = {
                    minLength: this.masterPassMinLength,
                    minNumbers: this.masterPassMinNumbers,
                    minSpecial: this.masterPassMinSpecial,
                    useLower: this.masterPassUseLower,
                    useUpper: this.masterPassUseUpper,
                    minComplexity: this.masterPassMinComplexity,
                };
                break;
            default:
                break;
        }
        try {
            this.formPromise = this.apiService.putPolicy(this.organizationId, this.type, request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Edited Policy' });
            this.toasterService.popAsync('success', null, this.i18nService.t('editedPolicyId', this.name));
            this.onSavedPolicy.emit();
        } catch { }
    }
}
