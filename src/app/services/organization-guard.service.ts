import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
} from '@angular/router';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

@Injectable()
export class OrganizationGuardService implements CanActivate {
    constructor(private userService: UserService, private router: Router,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService) { }

    async canActivate(route: ActivatedRouteSnapshot) {
        const org = await this.userService.getOrganization(route.params.organizationId);
        if (org == null) {
            this.router.navigate(['/']);
            return false;
        }
        if (!org.isOwner && !org.enabled) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('organizationIsDisabled'));
            this.router.navigate(['/']);
            return false;
        }

        return true;
    }
}
