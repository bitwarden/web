import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

@Component({
    selector: 'app-org-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent {
    access2fa = false;
    selfHosted: boolean;

    constructor(
        private route: ActivatedRoute,
        private userService: UserService,
        private platformUtilsService: PlatformUtilsService
    ) {}

    ngOnInit() {
        this.route.parent.params.subscribe(async (params) => {
            this.selfHosted = await this.platformUtilsService.isSelfHost();
            const organization = await this.userService.getOrganization(params.organizationId);
            this.access2fa = organization.use2fa;
        });
    }
}
