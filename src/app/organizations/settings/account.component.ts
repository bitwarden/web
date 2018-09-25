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
import { DeleteOrganizationComponent } from './delete-organization.component';

@Component({
    selector: 'app-org-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent {
    @ViewChild('deleteOrganizationTemplate', { read: ViewContainerRef }) deleteModalRef: ViewContainerRef;
    @ViewChild('purgeOrganizationTemplate', { read: ViewContainerRef }) purgeModalRef: ViewContainerRef;

    loading = true;
    org: OrganizationResponse;
    formPromise: Promise<any>;

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
}
