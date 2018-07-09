import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
} from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';

@Injectable()
export class OrganizationGuardService implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    async canActivate(route: ActivatedRouteSnapshot) {
        const org = await this.userService.getOrganization(route.params.organizationId);
        if (org == null) {
            this.router.navigate(['/']);
            return false;
        }

        return true;
    }
}
