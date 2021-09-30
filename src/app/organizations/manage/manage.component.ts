import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from 'jslib-common/abstractions/user.service';

import { Organization } from 'jslib-common/models/domain/organization';

@Component({
    selector: 'app-org-manage',
    templateUrl: 'manage.component.html',
})
export class ManageComponent implements OnInit {
    organization: Organization;
    accessPolicies: boolean = false;
    accessGroups: boolean = false;
    accessEvents: boolean = false;
    accessSso: boolean = false;

    constructor(private route: ActivatedRoute, private userService: UserService) {}

    ngOnInit() {
        this.route.parent.params.subscribe(async params => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            this.accessPolicies = this.organization.usePolicies;
            this.accessSso = this.organization.useSso;
            this.accessEvents = this.organization.useEvents;
            this.accessGroups = this.organization.useGroups;
        });
    }
}
