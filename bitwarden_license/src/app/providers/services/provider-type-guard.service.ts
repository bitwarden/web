import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
} from '@angular/router';

import { UserService } from 'jslib-common/abstractions/user.service';

import { Permissions } from 'jslib-common/enums/permissions';

@Injectable()
export class ProviderTypeGuardService implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    async canActivate(route: ActivatedRouteSnapshot) {
        const provider = await this.userService.getProvider(route.params.providerId);
        const permissions = route.data == null ? null : route.data.permissions as Permissions[];

        if (
            // (permissions.indexOf(Permissions.AccessBusinessPortal) !== -1 && provider.canAccessBusinessPortal) ||
            (permissions.indexOf(Permissions.AccessEventLogs) !== -1 && provider.canAccessEventLogs) ||
            // (permissions.indexOf(Permissions.AccessImportExport) !== -1 && provider.canAccessImportExport) ||
            // (permissions.indexOf(Permissions.AccessReports) !== -1 && provider.canAccessReports) ||
            // (permissions.indexOf(Permissions.ManageAllCollections) !== -1 && provider.canManageAllCollections) ||
            // (permissions.indexOf(Permissions.ManageAssignedCollections) !== -1 && provider.canManageAssignedCollections) ||
            // (permissions.indexOf(Permissions.ManageGroups) !== -1 && provider.canManageGroups) ||
            // (permissions.indexOf(Permissions.ManageOrganization) !== -1 && provider.isOwner) ||
            // (permissions.indexOf(Permissions.ManagePolicies) !== -1 && provider.canManagePolicies) ||
            (permissions.indexOf(Permissions.ManageUsers) !== -1 && provider.canManageUsers)
            // (permissions.indexOf(Permissions.ManageUsersPassword) !== -1 && provider.canManageUsersPassword)
        ) {
            return true;
        }

        this.router.navigate(['/providers', provider.id]);
        return false;
    }
}
