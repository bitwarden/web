import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Permissions } from "jslib-common/enums/permissions";

@Injectable()
export class OrganizationTypeGuardService implements CanActivate {
  constructor(private organizationService: OrganizationService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const org = await this.organizationService.get(route.params.organizationId);
    const permissions = route.data == null ? null : (route.data.permissions as Permissions[]);

    if (
      (permissions.indexOf(Permissions.AccessEventLogs) !== -1 && org.canAccessEventLogs) ||
      (permissions.indexOf(Permissions.AccessImportExport) !== -1 && org.canAccessImportExport) ||
      (permissions.indexOf(Permissions.AccessReports) !== -1 && org.canAccessReports) ||
      (permissions.indexOf(Permissions.CreateNewCollections) !== -1 &&
        org.canCreateNewCollections) ||
      (permissions.indexOf(Permissions.EditAnyCollection) !== -1 && org.canEditAnyCollection) ||
      (permissions.indexOf(Permissions.DeleteAnyCollection) !== -1 && org.canDeleteAnyCollection) ||
      (permissions.indexOf(Permissions.EditAssignedCollections) !== -1 &&
        org.canEditAssignedCollections) ||
      (permissions.indexOf(Permissions.DeleteAssignedCollections) !== -1 &&
        org.canDeleteAssignedCollections) ||
      (permissions.indexOf(Permissions.ManageGroups) !== -1 && org.canManageGroups) ||
      (permissions.indexOf(Permissions.ManageOrganization) !== -1 && org.isOwner) ||
      (permissions.indexOf(Permissions.ManagePolicies) !== -1 && org.canManagePolicies) ||
      (permissions.indexOf(Permissions.ManageUsers) !== -1 && org.canManageUsers) ||
      (permissions.indexOf(Permissions.ManageUsersPassword) !== -1 && org.canManageUsersPassword) ||
      (permissions.indexOf(Permissions.ManageSso) !== -1 && org.canManageSso)
    ) {
      return true;
    }

    this.router.navigate(["/organizations", org.id]);
    return false;
  }
}
