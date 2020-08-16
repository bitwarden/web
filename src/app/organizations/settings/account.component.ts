import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
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
import { TaxInfoComponent } from '../../settings/tax-info.component';
import { ApiKeyComponent } from './api-key.component';
import { DeleteOrganizationComponent } from './delete-organization.component';
import { RotateApiKeyComponent } from './rotate-api-key.component';

@Component({
    selector: 'app-org-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent {
    @ViewChild('deleteOrganizationTemplate', {
        read: ViewContainerRef,
        static: true,
    })
    deleteModalRef: ViewContainerRef;
    @ViewChild('purgeOrganizationTemplate', {
        read: ViewContainerRef,
        static: true,
    })
    purgeModalRef: ViewContainerRef;
    @ViewChild('apiKeyTemplate', { read: ViewContainerRef, static: true })
    apiKeyModalRef: ViewContainerRef;
    @ViewChild('rotateApiKeyTemplate', { read: ViewContainerRef, static: true })
    rotateApiKeyModalRef: ViewContainerRef;
    @ViewChild(TaxInfoComponent) taxInfo: TaxInfoComponent;

    loading = true;
    canUseApi = false;
    org: OrganizationResponse;
    formPromise: Promise<any>;
    taxFormPromise: Promise<any>;

    private organizationId: string;
    private modal: ModalComponent = null;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private route: ActivatedRoute,
        private syncService: SyncService
    ) {}

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            try {
                this.org = await this.apiService.getOrganization(this.organizationId);
                this.canUseApi = this.org.useApi;
            } catch {}
        });
        this.loading = false;
    }

    async submit() {
        try {
            const request = new OrganizationUpdateRequest();
            request.name = this.org.name;
            request.businessName = this.org.businessName;
            request.billingEmail = this.org.billingEmail;
            request.identifier = this.org.identifier;
            this.formPromise = this.apiService
                .putOrganization(this.organizationId, request)
                .then(() => {
                    return this.syncService.fullSync(true);
                });
            await this.formPromise;
            this.analytics.eventTrack.next({
                action: 'Updated Organization Settings',
            });
            this.toasterService.popAsync(
                'success',
                null,
                this.i18nService.t('organizationUpdated')
            );
        } catch {}
    }

    async submitTaxInfo() {
        this.taxFormPromise = this.taxInfo.submitTaxInfo();
        await this.taxFormPromise;
        this.analytics.eventTrack.next({
            action: 'Updated Organization Tax Info',
        });
        this.toasterService.popAsync('success', null, this.i18nService.t('taxInfoUpdated'));
    }

    deleteOrganization() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.deleteModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<DeleteOrganizationComponent>(
            DeleteOrganizationComponent,
            this.deleteModalRef
        );
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
        const childComponent = this.modal.show<PurgeVaultComponent>(
            PurgeVaultComponent,
            this.purgeModalRef
        );
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
        const childComponent = this.modal.show<ApiKeyComponent>(
            ApiKeyComponent,
            this.apiKeyModalRef
        );
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
        const childComponent = this.modal.show<RotateApiKeyComponent>(
            RotateApiKeyComponent,
            this.rotateApiKeyModalRef
        );
        childComponent.organizationId = this.organizationId;

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }
}
