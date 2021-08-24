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

import { PolicyType } from 'jslib-common/enums/policyType';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { PolicyResponse } from 'jslib-common/models/response/policyResponse';

import { ModalComponent } from '../../modal.component';

import { Organization } from 'jslib-common/models/domain/organization';

import { PolicyEditComponent } from './policy-edit.component';

import { PolicyListService } from 'src/app/services/policy-list.service';
import { BasePolicy } from '../policies/base-policy.component';

@Component({
    selector: 'app-org-policies',
    templateUrl: 'policies.component.html',
})
export class PoliciesComponent implements OnInit {
    @ViewChild('editTemplate', { read: ViewContainerRef, static: true }) editModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    policies: BasePolicy[];
    organization: Organization;

    // Remove when removing deprecation warning
    enterpriseTokenPromise: Promise<any>;

    private enterpriseUrl: string;

    private modal: ModalComponent = null;
    private orgPolicies: PolicyResponse[];
    private policiesEnabledMap: Map<PolicyType, boolean> = new Map<PolicyType, boolean>();

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private platformUtilsService: PlatformUtilsService, private userService: UserService,
        private policyListService: PolicyListService, private router: Router,
        private environmentService: EnvironmentService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            this.organization = await this.userService.getOrganization(this.organizationId);
            if (this.organization == null || !this.organization.usePolicies) {
                this.router.navigate(['/organizations', this.organizationId]);
                return;
            }

            this.policies = this.policyListService.getPolicies();

            await this.load();

            // Handle policies component launch from Event message
            const queryParamsSub = this.route.queryParams.subscribe(async qParams => {
                if (qParams.policyId != null) {
                    const policyIdFromEvents: string = qParams.policyId;
                    for (const orgPolicy of this.orgPolicies) {
                        if (orgPolicy.id === policyIdFromEvents) {
                            for (let i = 0; i < this.policies.length; i++) {
                                if (this.policies[i].type === orgPolicy.type) {
                                    this.edit(this.policies[i]);
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }

                if (queryParamsSub != null) {
                    queryParamsSub.unsubscribe();
                }
            });
        });

        // Remove when removing deprecation warning
        this.enterpriseUrl = this.environmentService.getEnterpriseUrl();
    }

    async load() {
        const response = await this.apiService.getPolicies(this.organizationId);
        this.orgPolicies = response.data != null && response.data.length > 0 ? response.data : [];
        this.orgPolicies.forEach(op => {
            this.policiesEnabledMap.set(op.type, op.enabled);
        });

        this.loading = false;
    }

    edit(p: BasePolicy) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.editModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<PolicyEditComponent>(
            PolicyEditComponent, this.editModalRef);

        childComponent.policy = p;
        childComponent.organizationId = this.organizationId;
        childComponent.policiesEnabledMap = this.policiesEnabledMap;
        childComponent.onSavedPolicy.subscribe(() => {
            this.modal.close();
            this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }


    // Remove when removing deprecation warning
    async goToEnterprisePortal() {
        if (this.enterpriseTokenPromise != null) {
            return;
        }
        try {
            this.enterpriseTokenPromise = this.apiService.getEnterprisePortalSignInToken();
            const token = await this.enterpriseTokenPromise;
            if (token != null) {
                const userId = await this.userService.getUserId();
                this.platformUtilsService.launchUri(this.enterpriseUrl + '/login?userId=' + userId +
                    '&token=' + (window as any).encodeURIComponent(token) + '&organizationId=' + this.organizationId);
            }
        } catch { }
        this.enterpriseTokenPromise = null;
    }
}
