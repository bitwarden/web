import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { SearchService } from 'jslib-common/abstractions/search.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import {
    ProviderOrganizationOrganizationDetailsResponse
} from 'jslib-common/models/response/provider/providerOrganizationResponse';

@Component({
    templateUrl: 'clients.component.html',
})
export class ClientsComponent implements OnInit {

    providerId: any;
    searchText: string;
    loading = true;

    clients: ProviderOrganizationOrganizationDetailsResponse[];
    pagedClients: ProviderOrganizationOrganizationDetailsResponse[];

    protected didScroll = false;
    protected pageSize = 100;
    private pagedClientsCount = 0;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private apiService: ApiService, private searchService: SearchService) { }

    async ngOnInit() {
        this.route.parent.params.subscribe(async params => {
            this.providerId = params.providerId;
            const provider = await this.userService.getProvider(this.providerId);

            /*
            if (!organization.canManageUsers) {
                this.router.navigate(['../collections'], { relativeTo: this.route });
                return;
            }

            this.accessEvents = organization.useEvents;
            this.accessGroups = organization.useGroups;
            */

            await this.load();
        });
    }

    async load() {
        const response = await this.apiService.getProviderClients(this.providerId);
        this.clients = response.data != null && response.data.length > 0 ? response.data : [];
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
}
