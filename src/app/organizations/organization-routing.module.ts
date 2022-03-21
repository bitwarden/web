import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuardService } from "jslib-angular/services/auth-guard.service";
import { Permissions } from "jslib-common/enums/permissions";

import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { CollectionsComponent } from "./manage/collections.component";
import { EventsComponent } from "./manage/events.component";
import { GroupsComponent } from "./manage/groups.component";
import { ManageComponent } from "./manage/manage.component";
import { PeopleComponent } from "./manage/people.component";
import { PoliciesComponent } from "./manage/policies.component";
import { PermissionsGuardService } from "./services/permissions-guard.service";
import { PermissionsService } from "./services/permissions.service";
import { RedirectToAdminGuardService } from "./services/redirect-to-admin-guard.service";
import { AccountComponent } from "./settings/account.component";
import { OrganizationBillingComponent } from "./settings/organization-billing.component";
import { OrganizationSubscriptionComponent } from "./settings/organization-subscription.component";
import { SettingsComponent } from "./settings/settings.component";
import { TwoFactorSetupComponent } from "./settings/two-factor-setup.component";
import { ExportComponent } from "./tools/export.component";
import { ExposedPasswordsReportComponent } from "./tools/exposed-passwords-report.component";
import { ImportComponent } from "./tools/import.component";
import { InactiveTwoFactorReportComponent } from "./tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent } from "./tools/reused-passwords-report.component";
import { ToolsComponent } from "./tools/tools.component";
import { UnsecuredWebsitesReportComponent } from "./tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./tools/weak-passwords-report.component";
import { VaultComponent } from "./vault/vault.component";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuardService, RedirectToAdminGuardService],
    pathMatch: "full",
  },
  {
    path: ":organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuardService, PermissionsGuardService],
    data: {
      permissions: PermissionsService.getPermissions("admin"),
    },
    children: [
      { path: "", pathMatch: "full", redirectTo: "vault" },
      { path: "vault", component: VaultComponent, data: { titleId: "vault" } },
      {
        path: "tools",
        component: ToolsComponent,
        canActivate: [PermissionsGuardService],
        data: { permissions: PermissionsService.getPermissions("tools") },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "import",
          },
          {
            path: "import",
            component: ImportComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "importData",
              permissions: [Permissions.AccessImportExport],
            },
          },
          {
            path: "export",
            component: ExportComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "exportVault",
              permissions: [Permissions.AccessImportExport],
            },
          },
          {
            path: "exposed-passwords-report",
            component: ExposedPasswordsReportComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "exposedPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "inactive-two-factor-report",
            component: InactiveTwoFactorReportComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "inactive2faReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "reused-passwords-report",
            component: ReusedPasswordsReportComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "reusedPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "unsecured-websites-report",
            component: UnsecuredWebsitesReportComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "unsecuredWebsitesReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "weak-passwords-report",
            component: WeakPasswordsReportComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "weakPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
        ],
      },
      {
        path: "manage",
        component: ManageComponent,
        canActivate: [PermissionsGuardService],
        data: {
          permissions: PermissionsService.getPermissions("manage"),
        },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "people",
          },
          {
            path: "collections",
            component: CollectionsComponent,
            canActivate: [PermissionsGuardService],
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
            component: EventsComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "eventLogs",
              permissions: [Permissions.AccessEventLogs],
            },
          },
          {
            path: "groups",
            component: GroupsComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "groups",
              permissions: [Permissions.ManageGroups],
            },
          },
          {
            path: "people",
            component: PeopleComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "people",
              permissions: [Permissions.ManageUsers, Permissions.ManageUsersPassword],
            },
          },
          {
            path: "policies",
            component: PoliciesComponent,
            canActivate: [PermissionsGuardService],
            data: {
              titleId: "policies",
              permissions: [Permissions.ManagePolicies],
            },
          },
        ],
      },
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [PermissionsGuardService],
        data: { permissions: PermissionsService.getPermissions("settings") },
        children: [
          { path: "", pathMatch: "full", redirectTo: "account" },
          { path: "account", component: AccountComponent, data: { titleId: "myOrganization" } },
          {
            path: "two-factor",
            component: TwoFactorSetupComponent,
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
