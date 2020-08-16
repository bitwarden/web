import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';

import { OrganizationUserType } from 'jslib/enums/organizationUserType';

@Injectable()
export class OrganizationTypeGuardService implements CanActivate {
    constructor(private userService: UserService, private router: Router) {}

    async canActivate(route: ActivatedRouteSnapshot) {
        const org = await this.userService.getOrganization(route.parent.params.organizationId);
        const allowedTypes =
            route.data == null ? null : (route.data.allowedTypes as OrganizationUserType[]);
        if (allowedTypes == null || allowedTypes.indexOf(org.type) === -1) {
            this.router.navigate(['/organizations', org.id]);
            return false;
        }

        return true;
    }
}
