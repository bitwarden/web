import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { UserService } from 'jslib/abstractions/user.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';

import { Organization } from 'jslib/models/domain/organization';

const BroadcasterSubscriptionId = 'OrganizationLayoutComponent';

@Component({
    selector: 'app-organization-layout',
    templateUrl: 'organization-layout.component.html',
})
export class OrganizationLayoutComponent implements OnInit, OnDestroy {
    organization: Organization;

    private organizationId: string;
    private enterpriseUrl: string;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private broadcasterService: BroadcasterService, private environmentService: EnvironmentService,
        private ngZone: NgZone) { }

    ngOnInit() {
        this.enterpriseUrl = 'https://enterprise.bitwarden.com';
        if (this.environmentService.enterpriseUrl != null) {
            this.enterpriseUrl = this.environmentService.enterpriseUrl;
        } else if (this.environmentService.baseUrl != null) {
            this.enterpriseUrl = this.environmentService.baseUrl + '/enterprise';
        }

        document.body.classList.remove('layout_frontend');
        this.route.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            await this.load();
        });

        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'updatedOrgLicense':
                        await this.load();
                        break;
                }
            });
        });
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async load() {
        this.organization = await this.userService.getOrganization(this.organizationId);
    }
}
