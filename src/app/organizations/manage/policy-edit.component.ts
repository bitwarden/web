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

    loading = true;
    enabled = false;
    formPromise: Promise<any>;

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
            this.enabled = this.policy.enabled;
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
        try {
            this.formPromise = this.apiService.putPolicy(this.organizationId, this.type, request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Edited Policy' });
            this.toasterService.popAsync('success', null, this.i18nService.t('editedPolicyId', this.name));
            this.onSavedPolicy.emit();
        } catch { }
    }
}
