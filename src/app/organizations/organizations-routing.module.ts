import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "jslib-angular/guards/auth.guard";

import { PermissionsGuard } from "./guards/permissions.guard";
import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { NavigationPermissionsService } from "./services/navigation-permissions.service";

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
        loadChildren: async () => (await import("./tools/tools.module")).ToolsModule,
      },
      {
        path: "manage",
        loadChildren: async () => (await import("./manage/manage.module")).ManageModule,
      },
      {
        path: "settings",
        loadChildren: async () => (await import("./settings/settings.module")).SettingsModule,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
