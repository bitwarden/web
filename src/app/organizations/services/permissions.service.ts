import { Injectable } from "@angular/core";

import { Permissions } from "jslib-common/enums/permissions";
import { Organization } from "jslib-common/models/domain/organization";

const permissions = {
  manage: [
    Permissions.CreateNewCollections,
    Permissions.EditAnyCollection,
    Permissions.DeleteAnyCollection,
    Permissions.EditAssignedCollections,
    Permissions.DeleteAssignedCollections,
    Permissions.AccessEventLogs,
    Permissions.ManageGroups,
    Permissions.ManageUsers,
    Permissions.ManagePolicies,
  ],
  tools: [Permissions.AccessImportExport, Permissions.AccessReports],
  settings: [Permissions.ManageOrganization],
};

export class PermissionsService {
  static getPermissions(route: keyof typeof permissions | "admin") {
    if (route === "admin") {
      return Object.values(permissions).reduce((previous, current) => previous.concat(current), []);
    }

    return permissions[route];
  }

  static canAccessAdmin(organization: Organization): boolean {
    return (
      this.canAccessTools(organization) ||
      this.canAccessSettings(organization) ||
      this.canAccessManage(organization)
    );
  }

  static canAccessTools(organization: Organization): boolean {
    return organization.hasAnyPermission(PermissionsService.getPermissions("tools"));
  }

  static canAccessSettings(organization: Organization): boolean {
    return organization.hasAnyPermission(PermissionsService.getPermissions("settings"));
  }

  static canAccessManage(organization: Organization): boolean {
    return organization.hasAnyPermission(PermissionsService.getPermissions("manage"));
  }
}
