import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PolicyResponse } from 'jslib/models/response/policyResponse';

import { Utils } from 'jslib/misc/utils';

import { ModalComponent } from '../../modal.component';
import { EntityUsersComponent } from './entity-users.component';
import { GroupAddEditComponent } from './group-add-edit.component';

import { PolicyType } from 'jslib/enums/policyType';

@Component({
    selector: 'app-org-policies',
    templateUrl: 'policies.component.html',
})
export class PoliciesComponent implements OnInit {
    @ViewChild('edit', { read: ViewContainerRef }) editModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    policies: any[];

    private modal: ModalComponent = null;
    private orgPolicies: PolicyResponse[];
    private policiesEnabledMap: Map<PolicyType, boolean> = new Map<PolicyType, boolean>();

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private platformUtilsService: PlatformUtilsService, private userService: UserService,
        private router: Router) {
        this.policies = [
            {
                name: 'Two-step Login',
                description: 'vbxcvbxvcbxc',
                type: PolicyType.TwoFactorAuthentication,
                enabled: false,
            },
            {
                name: 'Master Password',
                description: 'vbxcvb',
                type: PolicyType.MasterPassword,
                enabled: false,
            },
            {
                name: 'Password Generator',
                description: 'rye5tbfgdbfghj',
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
}
