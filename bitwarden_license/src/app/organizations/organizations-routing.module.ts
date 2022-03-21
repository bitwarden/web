import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "jslib-angular/guards/auth.guard";
import { Permissions } from "jslib-common/enums/permissions";

import { OrganizationLayoutComponent } from "src/app/layouts/organization-layout.component";
import { ManageComponent } from "src/app/organizations/manage/manage.component";
import { OrganizationGuardService } from "src/app/services/organization-guard.service";
import { OrganizationTypeGuardService } from "src/app/services/organization-type-guard.service";

import { SsoComponent } from "./manage/sso.component";

const routes: Routes = [
  {
    path: "organizations/:organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuard, OrganizationGuardService],
    children: [
      {
        path: "manage",
        component: ManageComponent,
        canActivate: [OrganizationTypeGuardService],
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
