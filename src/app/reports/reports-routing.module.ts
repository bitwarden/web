import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "jslib-angular/guards/auth.guard";

import { BreachReportComponent } from "./breach-report.component";
import { ExposedPasswordsReportComponent } from "./exposed-passwords-report.component";
import { InactiveTwoFactorReportComponent } from "./inactive-two-factor-report.component";
import { ReportListComponent } from "./report-list.component";
import { ReportsComponent } from "./reports.component";
import { ReusedPasswordsReportComponent } from "./reused-passwords-report.component";
import { UnsecuredWebsitesReportComponent } from "./unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./weak-passwords-report.component";

const routes: Routes = [
  {
    path: "",
    component: ReportsComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", pathMatch: "full", component: ReportListComponent, data: { homepage: true } },
      {
        path: "breach-report",
        component: BreachReportComponent,
        data: { titleId: "dataBreachReport" },
      },
      {
        path: "reused-passwords-report",
        component: ReusedPasswordsReportComponent,
        data: { titleId: "reusedPasswordsReport" },
      },
      {
        path: "unsecured-websites-report",
        component: UnsecuredWebsitesReportComponent,
        data: { titleId: "unsecuredWebsitesReport" },
      },
      {
        path: "weak-passwords-report",
        component: WeakPasswordsReportComponent,
        data: { titleId: "weakPasswordsReport" },
      },
      {
        path: "exposed-passwords-report",
        component: ExposedPasswordsReportComponent,
        data: { titleId: "exposedPasswordsReport" },
      },
      {
        path: "inactive-two-factor-report",
        component: InactiveTwoFactorReportComponent,
        data: { titleId: "inactive2faReport" },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
