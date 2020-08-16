import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PolicyType } from 'jslib/enums/policyType';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PolicyResponse } from 'jslib/models/response/policyResponse';

import { ModalComponent } from '../../modal.component';

import { PolicyEditComponent } from './policy-edit.component';

@Component({
    selector: 'app-org-policies',
    templateUrl: 'policies.component.html',
})
export class PoliciesComponent implements OnInit {
    @ViewChild('editTemplate', { read: ViewContainerRef, static: true })
    editModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    policies: any[];

    private modal: ModalComponent = null;
    private orgPolicies: PolicyResponse[];
    private policiesEnabledMap: Map<PolicyType, boolean> = new Map<PolicyType, boolean>();

    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        private i18nService: I18nService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private platformUtilsService: PlatformUtilsService,
        private userService: UserService,
        private router: Router
    ) {
        this.policies = [
            {
                name: i18nService.t('twoStepLogin'),
                description: i18nService.t('twoStepLoginPolicyDesc'),
                type: PolicyType.TwoFactorAuthentication,
                enabled: false,
            },
            {
                name: i18nService.t('masterPass'),
                description: i18nService.t('masterPassPolicyDesc'),
                type: PolicyType.MasterPassword,
                enabled: false,
            },
            {
                name: i18nService.t('passwordGenerator'),
                description: i18nService.t('passwordGeneratorPolicyDesc'),
                type: PolicyType.PasswordGenerator,
                enabled: false,
            },
        ];
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            const organization = await this.userService.getOrganization(this.organizationId);
            if (organization == null || !organization.usePolicies) {
                this.router.navigate(['/organizations', this.organizationId]);
                return;
            }
            await this.load();
        });
    }

    async load() {
        const response = await this.apiService.getPolicies(this.organizationId);
        this.orgPolicies = response.data != null && response.data.length > 0 ? response.data : [];
        this.orgPolicies.forEach((op) => {
            this.policiesEnabledMap.set(op.type, op.enabled);
        });
        this.policies.forEach((p) => {
            p.enabled = this.policiesEnabledMap.has(p.type) && this.policiesEnabledMap.get(p.type);
        });
        this.loading = false;
    }

    edit(p: any) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.editModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<PolicyEditComponent>(
            PolicyEditComponent,
            this.editModalRef
        );

        childComponent.name = p.name;
        childComponent.description = p.description;
        childComponent.type = p.type;
        childComponent.organizationId = this.organizationId;
        childComponent.onSavedPolicy.subscribe(() => {
            this.modal.close();
            this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }
}
