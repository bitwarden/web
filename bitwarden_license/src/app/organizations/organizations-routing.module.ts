import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "jslib-angular/guards/auth.guard";
import { Permissions } from "jslib-common/enums/permissions";

import { OrganizationLayoutComponent } from "src/app/organizations/layouts/organization-layout.component";
import { ManageComponent } from "src/app/organizations/manage/manage.component";
import { PermissionsGuardService } from "src/app/organizations/services/permissions-guard.service";

import { SsoComponent } from "./manage/sso.component";

const routes: Routes = [
  {
    path: "organizations/:organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuard, PermissionsGuardService],
    children: [
      {
        path: "manage",
        component: ManageComponent,
        canActivate: [PermissionsGuardService],
        data: {
          permissions: [
            Permissions.CreateNewCollections,
            Permissions.EditAnyCollection,
            Permissions.DeleteAnyCollection,
            Permissions.EditAssignedCollections,
            Permissions.DeleteAssignedCollections,
            Permissions.AccessEventLogs,
            Permissions.ManageGroups,
            Permissions.ManageUsers,
            Permissions.ManagePolicies,
            Permissions.ManageSso,
          ],
        },
        children: [
          {
            path: "sso",
            component: SsoComponent,
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
