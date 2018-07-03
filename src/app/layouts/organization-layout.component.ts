import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';

@Component({
    selector: 'app-organization-layout',
    templateUrl: 'organization-layout.component.html',
})
export class OrganizationLayoutComponent implements OnInit {
    organization: Organization;

    private organizationId: string;

    constructor(private route: ActivatedRoute, private userService: UserService) { }

    ngOnInit() {
        this.route.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            await this.load();
        });
    }

    async load() {
        this.organization = await this.userService.getOrganization(this.organizationId);
    }
}
