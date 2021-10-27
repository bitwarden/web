import {
    Component,
    OnInit,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'jslib-common/abstractions/user.service';

@Component({
    selector: 'app-manage-router',
    templateUrl: './manage-router.component.html',
})
export class ManageRouterComponent implements OnInit {

    constructor(private route: ActivatedRoute, private router: Router, 
        private userService: UserService) {}

    ngOnInit() {
        this.route.params.subscribe(async params => {
            console.log('Routing...');
            const org = await this.userService.getOrganization(params.organizationId);
            switch (true) {
                case org.canManageUsers:
                    this.routeTo('people');
                    break;
                case org.canViewAssignedCollections || org.canViewAllCollections:
                    this.routeTo('collections');
                    break;
                case org.canManageGroups:
                    this.routeTo('groups');
                    break;
                case org.canManagePolicies:
                    this.routeTo('policies');
                    break;
                case org.canAccessEventLogs:
                    this.routeTo('events');
                    break;
            }
        });
    }

    routeTo(page: string) {
        this.router.navigate([page], { relativeTo: this.route });
    }
}