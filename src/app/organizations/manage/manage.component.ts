import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';

@Component({
    selector: 'app-org-manage',
    templateUrl: 'manage.component.html',
})
export class ManageComponent implements OnInit {
    accessGroups = false;
    accessEvents = false;

    constructor(private route: ActivatedRoute, private userService: UserService) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async (params) => {
            const organization = await this.userService.getOrganization(params.organizationId);
            this.accessEvents = organization.useEvents;
            this.accessGroups = organization.useGroups;
        });
    }
}
