import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { OrganizationKeysRequest } from 'jslib-common/models/request/organizationKeysRequest';
import { OrganizationUpdateRequest } from 'jslib-common/models/request/organizationUpdateRequest';

import { OrganizationResponse } from 'jslib-common/models/response/organizationResponse';

import { ModalComponent } from '../../modal.component';

import { ApiKeyComponent } from '../../settings/api-key.component';
import { PurgeVaultComponent } from '../../settings/purge-vault.component';
import { TaxInfoComponent } from '../../settings/tax-info.component';

import { Organization } from 'jslib-common/models/domain/organization';
import { Provider } from 'jslib-common/models/domain/provider';
import { DeleteOrganizationComponent } from './delete-organization.component';

@Component({
    selector: 'app-org-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent {
    @ViewChild('deleteOrganizationTemplate', { read: ViewContainerRef, static: true }) deleteModalRef: ViewContainerRef;
    @ViewChild('purgeOrganizationTemplate', { read: ViewContainerRef, static: true }) purgeModalRef: ViewContainerRef;
    @ViewChild('apiKeyTemplate', { read: ViewContainerRef, static: true }) apiKeyModalRef: ViewContainerRef;
    @ViewChild('rotateApiKeyTemplate', { read: ViewContainerRef, static: true }) rotateApiKeyModalRef: ViewContainerRef;
    @ViewChild(TaxInfoComponent) taxInfo: TaxInfoComponent;

    selfHosted = false;
    loading = true;
    canUseApi = false;
    org: OrganizationResponse;
    userOrg: Organization;
    formPromise: Promise<any>;
    taxFormPromise: Promise<any>;

    canJoinProvider = false;
    providers: Provider[];
    provider: string = null;

    private organizationId: string;
    private modal: ModalComponent = null;

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private route: ActivatedRoute,
        private syncService: SyncService, private platformUtilsService: PlatformUtilsService,
        private cryptoService: CryptoService, private userService: UserService,
        private router: Router) { }

    async ngOnInit() {
        this.selfHosted = this.platformUtilsService.isSelfHost();
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            try {
                this.org = await this.apiService.getOrganization(this.organizationId);
                this.canUseApi = this.org.useApi;
            } catch { }
            this.providers = (await this.userService.getAllProviders()).filter(p => p.canCreateOrganizations);
            this.userOrg = await this.userService.getOrganization(this.organizationId);
            this.canJoinProvider = this.userOrg.providerId == null && this.providers.length > 0;
            this.provider = this.providers[0]?.id;
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

            // Backfill pub/priv key if necessary
            if (!this.org.hasPublicAndPrivateKeys) {
                const orgShareKey = await this.cryptoService.getOrgKey(this.organizationId);
                const orgKeys = await this.cryptoService.makeKeyPair(orgShareKey);
                request.keys = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
            }

            this.formPromise = this.apiService.putOrganization(this.organizationId, request).then(() => {
                return this.syncService.fullSync(true);
            });
            await this.formPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('organizationUpdated'));
        } catch { }
    }

    async submitTaxInfo() {
        this.taxFormPromise = this.taxInfo.submitTaxInfo();
        await this.taxFormPromise;
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
        childComponent.keyType = 'organization';
        childComponent.entityId = this.organizationId;
        childComponent.postKey = this.apiService.postOrganizationApiKey.bind(this.apiService);
        childComponent.scope = 'api.organization';
        childComponent.grantType = 'client_credentials';
        childComponent.apiKeyTitle = 'apiKey';
        childComponent.apiKeyWarning = 'apiKeyWarning';
        childComponent.apiKeyDescription = 'apiKeyDesc';

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
        const childComponent = this.modal.show<ApiKeyComponent>(ApiKeyComponent, this.rotateApiKeyModalRef);
        childComponent.keyType = 'organization';
        childComponent.isRotation = true;
        childComponent.entityId = this.organizationId;
        childComponent.postKey = this.apiService.postOrganizationRotateApiKey.bind(this.apiService);
        childComponent.scope = 'api.organization';
        childComponent.grantType = 'client_credentials';
        childComponent.apiKeyTitle = 'apiKey';
        childComponent.apiKeyWarning = 'apiKeyWarning';
        childComponent.apiKeyDescription = 'apiKeyRotateDesc';

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    joinProvider() {
        if (this.providers.every(p => p.id !== this.provider)) {
            // ID not found fail.
        }

        this.router.navigate(['/providers', this.provider, 'add', this.organizationId]);
    }
}
