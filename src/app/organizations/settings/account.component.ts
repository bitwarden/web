import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { OrganizationUpdateRequest } from 'jslib/models/request/organizationUpdateRequest';
import { OrganizationResponse } from 'jslib/models/response/organizationResponse';

import { ModalComponent } from '../../modal.component';
import { PurgeVaultComponent } from '../../settings/purge-vault.component';
import { ApiKeyComponent } from './api-key.component';
import { DeleteOrganizationComponent } from './delete-organization.component';
import { RotateApiKeyComponent } from './rotate-api-key.component';
import { OrganizationTaxInfoUpdateRequest } from 'jslib/models/request/organizationTaxInfoUpdateRequest';

@Component({
    selector: 'app-org-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent {
    @ViewChild('deleteOrganizationTemplate', { read: ViewContainerRef }) deleteModalRef: ViewContainerRef;
    @ViewChild('purgeOrganizationTemplate', { read: ViewContainerRef }) purgeModalRef: ViewContainerRef;
    @ViewChild('apiKeyTemplate', { read: ViewContainerRef }) apiKeyModalRef: ViewContainerRef;
    @ViewChild('rotateApiKeyTemplate', { read: ViewContainerRef }) rotateApiKeyModalRef: ViewContainerRef;

    loading = true;
    canUseApi = false;
    org: OrganizationResponse;
    formPromise: Promise<any>;
    taxInfo: any = {
        taxId: null,
        line1: null,
        line2: null,
        city: null,
        state: null,
        postalCode: null,
        country: 'US',
        includeTaxId: false,
    };

    private organizationId: string;
    private modal: ModalComponent = null;

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private route: ActivatedRoute, private syncService: SyncService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            try {
                this.org = await this.apiService.getOrganization(this.organizationId);
                this.canUseApi = this.org.useApi;
                const taxInfo = await this.apiService.getOrganizationTaxInfo(this.organizationId);
                if (taxInfo) {
                    this.taxInfo.taxId = taxInfo.taxId;
                    this.taxInfo.state = taxInfo.state;
                    this.taxInfo.line1 = taxInfo.line1;
                    this.taxInfo.line2 = taxInfo.line2;
                    this.taxInfo.city = taxInfo.city;
                    this.taxInfo.state = taxInfo.state;
                    this.taxInfo.postalCode = taxInfo.postalCode;
                    this.taxInfo.country = taxInfo.country;
                    this.taxInfo.includeTaxId = taxInfo.country !== 'US' && (
                        !!taxInfo.taxId
                        || !!taxInfo.line1
                        || !!taxInfo.line2
                        || !!taxInfo.city
                        || !!taxInfo.state);
                }
            } catch { }
        });
        this.loading = false;
    }

    async submit() {
        try {
            const request = new OrganizationUpdateRequest();
            request.name = this.org.name;
            request.businessName = this.org.businessName;
            request.billingEmail = this.org.billingEmail;
            this.formPromise = this.apiService.putOrganization(this.organizationId, request).then(() => {
                return this.syncService.fullSync(true);
            });
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Updated Organization Settings' });
            this.toasterService.popAsync('success', null, this.i18nService.t('organizationUpdated'));
        } catch { }
    }

    async submitTaxInfo() {
        const request = new OrganizationTaxInfoUpdateRequest();
        request.taxId = this.taxInfo.taxId;
        request.state = this.taxInfo.state;
        request.line1 = this.taxInfo.line1;
        request.line2 = this.taxInfo.line2;
        request.city = this.taxInfo.city;
        request.state = this.taxInfo.state;
        request.postalCode = this.taxInfo.postalCode;
        request.country = this.taxInfo.country;
        this.formPromise = this.apiService.putOrganizationTaxInfo(this.organizationId, request);
        await this.formPromise;
        this.analytics.eventTrack.next({ action: 'Updated Organization Tax Info' });
        this.toasterService.popAsync('success', null, this.i18nService.t('taxInfoUpdated'));
    }

    deleteOrganization() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.deleteModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<DeleteOrganizationComponent>(
            DeleteOrganizationComponent, this.deleteModalRef);
        childComponent.organizationId = this.organizationId;

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    purgeVault() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.purgeModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<PurgeVaultComponent>(PurgeVaultComponent, this.purgeModalRef);
        childComponent.organizationId = this.organizationId;

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    viewApiKey() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.apiKeyModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<ApiKeyComponent>(ApiKeyComponent, this.apiKeyModalRef);
        childComponent.organizationId = this.organizationId;

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    rotateApiKey() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.rotateApiKeyModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<RotateApiKeyComponent>(RotateApiKeyComponent, this.rotateApiKeyModalRef);
        childComponent.organizationId = this.organizationId;

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    changeCountry() {
        if (this.taxInfo.country === 'US') {
            this.taxInfo.includeTaxId = false;
            this.taxInfo.taxId = null;
            this.taxInfo.line1 = null;
            this.taxInfo.line2 = null;
            this.taxInfo.city = null;
            this.taxInfo.state = null;
        }
    }
}
