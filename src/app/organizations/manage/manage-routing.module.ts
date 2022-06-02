import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Permissions } from "jslib-common/enums/permissions";

import { PermissionsGuard } from "../guards/permissions.guard";
import { PoliciesComponent } from "../policies/policies.component";
import { NavigationPermissionsService } from "../services/navigation-permissions.service";

import { CollectionsComponent } from "./collections.component";
import { EventsComponent } from "./events.component";
import { GroupsComponent } from "./groups.component";
import { ManageComponent } from "./manage.component";
import { PeopleComponent } from "./people.component";

const routes: Routes = [
  {
    path: "",
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageRoutingModule {}
