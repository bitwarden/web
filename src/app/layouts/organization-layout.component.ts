import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';

const BroadcasterSubscriptionId = 'OrganizationLayoutComponent';

@Component({
    selector: 'app-organization-layout',
    templateUrl: 'organization-layout.component.html',
})
export class OrganizationLayoutComponent implements OnInit, OnDestroy {
    organization: Organization;

    private organizationId: string;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private broadcasterService: BroadcasterService, private ngZone: NgZone) { }

    ngOnInit() {
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
