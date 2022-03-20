import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuardService } from "jslib-angular/services/auth-guard.service";
import { Permissions } from "jslib-common/enums/permissions";

import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { CollectionsComponent as OrgManageCollectionsComponent } from "./manage/collections.component";
import { EventsComponent as OrgEventsComponent } from "./manage/events.component";
import { GroupsComponent as OrgGroupsComponent } from "./manage/groups.component";
import { ManageComponent as OrgManageComponent } from "./manage/manage.component";
import { PeopleComponent as OrgPeopleComponent } from "./manage/people.component";
import { PoliciesComponent as OrgPoliciesComponent } from "./manage/policies.component";
import { OrganizationPermissionsGuardService } from "./services/organization-permissions-guard.service";
import { OrganizationRedirectGuardService } from "./services/organization-redirect-guard.service";
import { AccountComponent as OrgAccountComponent } from "./settings/account.component";
import { OrganizationBillingComponent } from "./settings/organization-billing.component";
import { OrganizationSubscriptionComponent } from "./settings/organization-subscription.component";
import { SettingsComponent as OrgSettingsComponent } from "./settings/settings.component";
import { TwoFactorSetupComponent as OrgTwoFactorSetupComponent } from "./settings/two-factor-setup.component";
import { ExportComponent as OrgExportComponent } from "./tools/export.component";
import { ExposedPasswordsReportComponent as OrgExposedPasswordsReportComponent } from "./tools/exposed-passwords-report.component";
import { ImportComponent as OrgImportComponent } from "./tools/import.component";
import { InactiveTwoFactorReportComponent as OrgInactiveTwoFactorReportComponent } from "./tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent as OrgReusedPasswordsReportComponent } from "./tools/reused-passwords-report.component";
import { ToolsComponent as OrgToolsComponent } from "./tools/tools.component";
import { UnsecuredWebsitesReportComponent as OrgUnsecuredWebsitesReportComponent } from "./tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent as OrgWeakPasswordsReportComponent } from "./tools/weak-passwords-report.component";
import { VaultComponent } from "./vault/vault.component";

export const organizationRoutePermissions = {
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
  all: () =>
    [].concat(
      organizationRoutePermissions.manage,
      organizationRoutePermissions.tools,
      organizationRoutePermissions.settings
    ),
};

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuardService, OrganizationRedirectGuardService],
    data: {
      permissions: organizationRoutePermissions.all(),
    },
    pathMatch: "full",
  },
  {
    path: ":organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuardService, OrganizationPermissionsGuardService],
    data: {
      permissions: organizationRoutePermissions.all(),
    },
    children: [
      { path: "", pathMatch: "full", redirectTo: "vault" },
      { path: "vault", component: VaultComponent, data: { titleId: "vault" } },
      {
        path: "tools",
        component: OrgToolsComponent,
        canActivate: [OrganizationPermissionsGuardService],
        data: { permissions: organizationRoutePermissions.tools },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "import",
          },
          {
            path: "import",
            component: OrgImportComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "importData",
              permissions: [Permissions.AccessImportExport],
            },
          },
          {
            path: "export",
            component: OrgExportComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "exportVault",
              permissions: [Permissions.AccessImportExport],
            },
          },
          {
            path: "exposed-passwords-report",
            component: OrgExposedPasswordsReportComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "exposedPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "inactive-two-factor-report",
            component: OrgInactiveTwoFactorReportComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "inactive2faReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "reused-passwords-report",
            component: OrgReusedPasswordsReportComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "reusedPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "unsecured-websites-report",
            component: OrgUnsecuredWebsitesReportComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "unsecuredWebsitesReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "weak-passwords-report",
            component: OrgWeakPasswordsReportComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "weakPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
        ],
      },
      {
        path: "manage",
        component: OrgManageComponent,
        canActivate: [OrganizationPermissionsGuardService],
        data: {
          permissions: organizationRoutePermissions.manage,
        },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "people",
          },
          {
            path: "collections",
            component: OrgManageCollectionsComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "collections",
              permissions: [
                Permissions.CreateNewCollections,
                Permissions.EditAnyCollection,
                Permissions.DeleteAnyCollection,
                Permissions.EditAssignedCollections,
                Permissions.DeleteAssignedCollections,
              ],
            },
          },
          {
            path: "events",
            component: OrgEventsComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "eventLogs",
              permissions: [Permissions.AccessEventLogs],
            },
          },
          {
            path: "groups",
            component: OrgGroupsComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "groups",
              permissions: [Permissions.ManageGroups],
            },
          },
          {
            path: "people",
            component: OrgPeopleComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "people",
              permissions: [Permissions.ManageUsers, Permissions.ManageUsersPassword],
            },
          },
          {
            path: "policies",
            component: OrgPoliciesComponent,
            canActivate: [OrganizationPermissionsGuardService],
            data: {
              titleId: "policies",
              permissions: [Permissions.ManagePolicies],
            },
          },
        ],
      },
      {
        path: "settings",
        component: OrgSettingsComponent,
        canActivate: [OrganizationPermissionsGuardService],
        data: { permissions: organizationRoutePermissions.settings },
        children: [
          { path: "", pathMatch: "full", redirectTo: "account" },
          { path: "account", component: OrgAccountComponent, data: { titleId: "myOrganization" } },
          {
            path: "two-factor",
            component: OrgTwoFactorSetupComponent,
            data: { titleId: "twoStepLogin" },
          },
          {
            path: "billing",
            component: OrganizationBillingComponent,
            data: { titleId: "billing" },
          },
          {
            path: "subscription",
            component: OrganizationSubscriptionComponent,
            data: { titleId: "subscription" },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
