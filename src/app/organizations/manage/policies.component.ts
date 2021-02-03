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

import { PolicyType } from 'jslib/enums/policyType';

import { EnvironmentService } from 'jslib/abstractions';
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
    @ViewChild('editTemplate', { read: ViewContainerRef, static: true }) editModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    policies: any[];

    // Remove when removing deprecation warning
    enterpriseTokenPromise: Promise<any>;
    userCanAccessBusinessPortal = false;

    private enterpriseUrl: string;

    private modal: ModalComponent = null;
    private orgPolicies: PolicyResponse[];
    private policiesEnabledMap: Map<PolicyType, boolean> = new Map<PolicyType, boolean>();

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private platformUtilsService: PlatformUtilsService, private userService: UserService,
        private router: Router, private environmentService: EnvironmentService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            const organization = await this.userService.getOrganization(this.organizationId);
            if (organization == null || !organization.usePolicies) {
                this.router.navigate(['/organizations', this.organizationId]);
                return;
            }
            this.userCanAccessBusinessPortal = organization.canAccessBusinessPortal;
            this.policies = [
                {
                    name: this.i18nService.t('twoStepLogin'),
                    description: this.i18nService.t('twoStepLoginPolicyDesc'),
                    type: PolicyType.TwoFactorAuthentication,
                    enabled: false,
                    display: true,
                },
                {
                    name: this.i18nService.t('masterPass'),
                    description: this.i18nService.t('masterPassPolicyDesc'),
                    type: PolicyType.MasterPassword,
                    enabled: false,
                    display: true,
                },
                {
                    name: this.i18nService.t('passwordGenerator'),
                    description: this.i18nService.t('passwordGeneratorPolicyDesc'),
                    type: PolicyType.PasswordGenerator,
                    enabled: false,
                    display: true,
                },
                {
                    name: this.i18nService.t('singleOrg'),
                    description: this.i18nService.t('singleOrgDesc'),
                    type: PolicyType.SingleOrg,
                    enabled: false,
                    display: true,
                },
                {
                    name: this.i18nService.t('requireSso'),
                    description: this.i18nService.t('requireSsoPolicyDesc'),
                    type: PolicyType.RequireSso,
                    enabled: false,
                    display: organization.useSso,
                },
                {
                    name: this.i18nService.t('personalOwnership'),
                    description: this.i18nService.t('personalOwnershipPolicyDesc'),
                    type: PolicyType.PersonalOwnership,
                    enabled: false,
                    display: true,
                },
            ];
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
        this.enterpriseUrl = 'https://portal.bitwarden.com';
        if (this.environmentService.enterpriseUrl != null) {
            this.enterpriseUrl = this.environmentService.enterpriseUrl;
        } else if (this.environmentService.baseUrl != null) {
            this.enterpriseUrl = this.environmentService.baseUrl + '/portal';
        }
    }

    async load() {
        const response = await this.apiService.getPolicies(this.organizationId);
        this.orgPolicies = response.data != null && response.data.length > 0 ? response.data : [];
        this.orgPolicies.forEach(op => {
            this.policiesEnabledMap.set(op.type, op.enabled);
        });
        this.policies.forEach(p => {
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
            PolicyEditComponent, this.editModalRef);

        childComponent.name = p.name;
        childComponent.description = p.description;
        childComponent.type = p.type;
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
