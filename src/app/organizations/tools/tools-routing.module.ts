import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Permissions } from "jslib-common/enums/permissions";

import { PermissionsGuard } from "../guards/permissions.guard";
import { NavigationPermissionsService } from "../services/navigation-permissions.service";

import { ExportComponent } from "./export.component";
import { ExposedPasswordsReportComponent } from "./exposed-passwords-report.component";
import { ImportComponent } from "./import.component";
import { InactiveTwoFactorReportComponent } from "./inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent } from "./reused-passwords-report.component";
import { ToolsComponent } from "./tools.component";
import { UnsecuredWebsitesReportComponent } from "./unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./weak-passwords-report.component";

const routes: Routes = [
  {
    path: "",
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToolsRoutingModule {}
