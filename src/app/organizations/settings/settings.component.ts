import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';

@Component({
    selector: 'app-org-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent {
    access2fa = false;

    constructor(private route: ActivatedRoute, private userService: UserService) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async (params) => {
            const organization = await this.userService.getOrganization(params.organizationId);
            this.access2fa = organization.use2fa;
        });
    }
}
