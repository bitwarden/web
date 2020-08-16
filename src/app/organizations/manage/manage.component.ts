import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';

@Component({
    selector: 'app-org-manage',
    templateUrl: 'manage.component.html',
})
export class ManageComponent implements OnInit {
    organization: Organization;
    accessPolicies = false;
    accessGroups = false;
    accessEvents = false;

    constructor(private route: ActivatedRoute, private userService: UserService) {}

    ngOnInit() {
        this.route.parent.params.subscribe(async (params) => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            this.accessPolicies = this.organization.usePolicies;
            this.accessEvents = this.organization.useEvents;
            this.accessGroups = this.organization.useGroups;
        });
    }
}
