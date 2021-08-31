import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SearchService } from 'jslib-common/abstractions/search.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { PlanType } from 'jslib-common/enums/planType';
import { ProviderUserType } from 'jslib-common/enums/providerUserType';

import { ValidationService } from 'jslib-angular/services/validation.service';

import {
    ProviderOrganizationOrganizationDetailsResponse
} from 'jslib-common/models/response/provider/providerOrganizationResponse';
import { Organization } from 'jslib-common/models/domain/organization';

import { ModalComponent } from 'src/app/modal.component';

import { ProviderService } from '../services/provider.service';

import { AddOrganizationComponent } from './add-organization.component';

const DisallowedPlanTypes = [PlanType.Free, PlanType.FamiliesAnnually2019, PlanType.FamiliesAnnually];

@Component({
    templateUrl: 'clients.component.html',
})
export class ClientsComponent implements OnInit {

    @ViewChild('add', { read: ViewContainerRef, static: true }) addModalRef: ViewContainerRef;

    providerId: any;
    searchText: string;
    addableOrganizations: Organization[];
    loading = true;
    manageOrganizations = false;
    showAddExisting = false;

    clients: ProviderOrganizationOrganizationDetailsResponse[];
    pagedClients: ProviderOrganizationOrganizationDetailsResponse[];
    modal: ModalComponent;

    protected didScroll = false;
    protected pageSize = 100;
    protected actionPromise: Promise<any>;
    private pagedClientsCount = 0;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private apiService: ApiService, private searchService: SearchService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private toasterService: ToasterService, private validationService: ValidationService,
        private providerService: ProviderService, private componentFactoryResolver: ComponentFactoryResolver,
        private logService: LogService) { }

    async ngOnInit() {
        this.route.parent.params.subscribe(async params => {
            this.providerId = params.providerId;

            await this.load();

            const queryParamsSub = this.route.queryParams.subscribe(async qParams => {
                this.searchText = qParams.search;
                if (queryParamsSub != null) {
                    queryParamsSub.unsubscribe();
                }
            });
        });
    }

    async load() {
        const response = await this.apiService.getProviderClients(this.providerId);
        this.clients = response.data != null && response.data.length > 0 ? response.data : [];
        this.manageOrganizations = (await this.userService.getProvider(this.providerId)).type === ProviderUserType.ProviderAdmin;
        const candidateOrgs = (await this.userService.getAllOrganizations()).filter(o => o.isOwner && o.providerId == null);
        const allowedOrgsIds = await Promise.all(candidateOrgs.map(o => this.apiService.getOrganization(o.id))).then(orgs =>
            orgs.filter(o => !DisallowedPlanTypes.includes(o.planType))
                .map(o => o.id));
        this.addableOrganizations = candidateOrgs.filter(o => allowedOrgsIds.includes(o.id));

        this.showAddExisting = this.addableOrganizations.length != 0;
        this.loading = false;
    }

    isPaging() {
        const searching = this.isSearching();
        if (searching && this.didScroll) {
            this.resetPaging();
        }
        return !searching && this.clients && this.clients.length > this.pageSize;
    }

    isSearching() {
        return this.searchService.isSearchable(this.searchText);
    }

    async resetPaging() {
        this.pagedClients = [];
        this.loadMore();
    }


    loadMore() {
        if (!this.clients || this.clients.length <= this.pageSize) {
            return;
        }
        const pagedLength = this.pagedClients.length;
        let pagedSize = this.pageSize;
        if (pagedLength === 0 && this.pagedClientsCount > this.pageSize) {
            pagedSize = this.pagedClientsCount;
        }
        if (this.clients.length > pagedLength) {
            this.pagedClients = this.pagedClients.concat(this.clients.slice(pagedLength, pagedLength + pagedSize));
        }
        this.pagedClientsCount = this.pagedClients.length;
        this.didScroll = this.pagedClients.length > this.pageSize;
    }

    addExistingOrganization() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.addModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AddOrganizationComponent>(AddOrganizationComponent, this.addModalRef);

        childComponent.providerId = this.providerId;
        childComponent.organizations = this.addableOrganizations;
        childComponent.onAddedOrganization.subscribe(async () => {
            try {
                await this.load();
                this.modal.close();
            } catch (e) {
                this.logService.error(`Handled exception: ${e}`);
            }
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    async remove(organization: ProviderOrganizationOrganizationDetailsResponse) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('detachOrganizationConfirmation'), organization.organizationName,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');

        if (!confirmed) {
            return false;
        }

        this.actionPromise = this.providerService.detachOrganizastion(this.providerId, organization.id);
        try {
            await this.actionPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('detachedOrganization', organization.organizationName));
            await this.load();
        } catch (e) {
            this.validationService.showError(e);
        }
        this.actionPromise = null;
    }
}
