import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    Directive,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { BasePolicy } from 'jslib-common/abstractions/policy.service';

import { PolicyType } from 'jslib-common/enums/policyType';

import { PolicyRequest } from 'jslib-common/models/request/policyRequest';

import { PolicyResponse } from 'jslib-common/models/response/policyResponse';

@Directive()
export abstract class BasePolicyComponent implements OnInit {
    @Input() policyResponse: PolicyResponse;
    @Input() policy: BasePolicy;

    enabled = new FormControl(false);
    data: FormGroup = null;

    ngOnInit(): void {
        this.enabled.setValue(this.policyResponse.enabled);

        if (this.data != null) {
            this.data.patchValue(this.policyResponse.data ?? {});
        }
    }

    buildRequest(policiesEnabledMap: Map<PolicyType, boolean>) {
        const request = new PolicyRequest();
        request.enabled = this.enabled.value;
        request.type = this.policy.type;

        if (this.data != null) {
            request.data = this.data.value;
        }

        return Promise.resolve(request);
    }
}

@Component({
    selector: 'app-policy-edit',
    templateUrl: 'policy-edit.component.html',
})
export class PolicyEditComponent {
    @Input() policy: BasePolicy;
    @Input() organizationId: string;
    @Input() policiesEnabledMap: Map<PolicyType, boolean> = new Map<PolicyType, boolean>();
    @Output() onSavedPolicy = new EventEmitter();

    @ViewChild('policyForm', { read: ViewContainerRef, static: true }) policyFormRef: ViewContainerRef;

    policyType = PolicyType;
    loading = true;
    enabled = false;
    formPromise: Promise<any>;
    defaultTypes: any[];
    policyComponent: BasePolicyComponent;

    private policyResponse: PolicyResponse;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private componentFactoryResolver: ComponentFactoryResolver,
        private cdr: ChangeDetectorRef) {
    }

    async ngAfterViewInit() {
        await this.load();
        this.loading = false;

        const factory = this.componentFactoryResolver.resolveComponentFactory(this.policy.component);
        this.policyComponent = this.policyFormRef.createComponent(factory).instance as BasePolicyComponent;
        this.policyComponent.policy = this.policy;
        this.policyComponent.policyResponse = this.policyResponse;

        this.cdr.detectChanges();
    }

    async load() {
        try {
            this.policyResponse = await this.apiService.getPolicy(this.organizationId, this.policy.type);
        } catch (e) {
            if (e.statusCode === 404) {
                this.policyResponse = new PolicyResponse({Enabled: false});
            } else {
                throw e;
            }
        }
    }

    async submit() {
        let request: PolicyRequest;
        try {
            request = await this.policyComponent.buildRequest(this.policiesEnabledMap);
        } catch (e) {
            this.toasterService.pop('error', null, e);
            return;
        }

        try {
            this.formPromise = this.apiService.putPolicy(this.organizationId, this.policy.type, request);
            await this.formPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('editedPolicyId', this.i18nService.t(this.policy.name)));
            this.onSavedPolicy.emit();
        } catch {}
    }
}
