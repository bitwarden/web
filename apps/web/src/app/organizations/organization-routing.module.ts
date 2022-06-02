import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "jslib-angular/guards/auth.guard";
import { Permissions } from "jslib-common/enums/permissions";

import { PermissionsGuard } from "./guards/permissions.guard";
import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { CollectionsComponent } from "./manage/collections.component";
import { EventsComponent } from "./manage/events.component";
import { GroupsComponent } from "./manage/groups.component";
import { ManageComponent } from "./manage/manage.component";
import { PeopleComponent } from "./manage/people.component";
import { PoliciesComponent } from "./manage/policies.component";
import { NavigationPermissionsService } from "./services/navigation-permissions.service";
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

const routes: Routes = [
  {
    path: ":organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuard, PermissionsGuard],
    data: {
      permissions: NavigationPermissionsService.getPermissions("admin"),
    },
    children: [
      { path: "", pathMatch: "full", redirectTo: "vault" },
      {
        path: "vault",
        loadChildren: async () =>
          (await import("../modules/vault/modules/organization-vault/organization-vault.module"))
            .OrganizationVaultModule,
      },
      {
        path: "tools",
        component: ToolsComponent,
        canActivate: [PermissionsGuard],
        data: { permissions: NavigationPermissionsService.getPermissions("tools") },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "import",
          },
          {
            path: "import",
            component: ImportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "importData",
              permissions: [Permissions.AccessImportExport],
            },
          },
          {
            path: "export",
            component: ExportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "exportVault",
              permissions: [Permissions.AccessImportExport],
            },
          },
          {
            path: "exposed-passwords-report",
            component: ExposedPasswordsReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "exposedPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "inactive-two-factor-report",
            component: InactiveTwoFactorReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "inactive2faReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "reused-passwords-report",
            component: ReusedPasswordsReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "reusedPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "unsecured-websites-report",
            component: UnsecuredWebsitesReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "unsecuredWebsitesReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "weak-passwords-report",
            component: WeakPasswordsReportComponent,
            canActivate: [PermissionsGuard],
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
        canActivate: [PermissionsGuard],
        data: {
          permissions: NavigationPermissionsService.getPermissions("manage"),
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
            canActivate: [PermissionsGuard],
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
            canActivate: [PermissionsGuard],
            data: {
              titleId: "eventLogs",
              permissions: [Permissions.AccessEventLogs],
            },
          },
          {
            path: "groups",
            component: GroupsComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "groups",
              permissions: [Permissions.ManageGroups],
            },
          },
          {
            path: "people",
            component: PeopleComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "people",
              permissions: [Permissions.ManageUsers, Permissions.ManageUsersPassword],
            },
          },
          {
            path: "policies",
            component: PoliciesComponent,
            canActivate: [PermissionsGuard],
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
        canActivate: [PermissionsGuard],
        data: { permissions: NavigationPermissionsService.getPermissions("settings") },
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
            canActivate: [PermissionsGuard],
            data: { titleId: "billing", permissions: [Permissions.ManageBilling] },
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
