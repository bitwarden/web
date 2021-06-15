import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ProviderOrganizationOrganizationDetailsResponse } from 'jslib-common/models/response/provider/providerOrganizationResponse';

@Component({
    templateUrl: 'clients.component.html',
})
export class ClientsComponent implements OnInit {

    providerId: any;
    searchText: string;
    loading = false;

    clients: ProviderOrganizationOrganizationDetailsResponse[];

    constructor(private route: ActivatedRoute, private userService: UserService,
        private platformUtilsService: PlatformUtilsService, private apiService: ApiService) { }
    
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
}
