import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
} from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';

import { Permissions } from 'jslib/enums/permissions';

@Injectable()
export class OrganizationTypeGuardService implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    async canActivate(route: ActivatedRouteSnapshot) {
        const org = await this.userService.getOrganization(route.params.organizationId);
        const permissions = route.data == null ? null : route.data.permissions as Permissions[];

        if (
            (permissions.indexOf(Permissions.AccessBusinessPortal) !== -1 && org.canAccessBusinessPortal) ||
            (permissions.indexOf(Permissions.AccessEventLogs) !== -1 && org.canAccessEventLogs) ||
            (permissions.indexOf(Permissions.AccessImportExport) !== -1 && org.canAccessImportExport) ||
            (permissions.indexOf(Permissions.AccessReports) !== -1 && org.canAccessReports) ||
            (permissions.indexOf(Permissions.ManageAllCollections) !== -1 && org.canManageAllCollections) ||
            (permissions.indexOf(Permissions.ManageAssignedCollections) !== -1 && org.canManageAssignedCollections) ||
            (permissions.indexOf(Permissions.ManageGroups) !== -1 && org.canManageGroups) ||
            (permissions.indexOf(Permissions.ManageOrganization) !== -1 && org.isOwner) ||
            (permissions.indexOf(Permissions.ManagePolicies) !== -1 && org.canManagePolicies) ||
            (permissions.indexOf(Permissions.ManageUsers) !== -1 && org.canManageUsers)
        ) {
            return true;
        }

        this.router.navigate(['/organizations', org.id]);
        return false;
    }
}
