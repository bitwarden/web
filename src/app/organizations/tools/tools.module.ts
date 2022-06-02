import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "../../modules/shared.module";

import { ExportComponent } from "./export.component";
import { ExposedPasswordsReportComponent } from "./exposed-passwords-report.component";
import { ImportComponent } from "./import.component";
import { InactiveTwoFactorReportComponent } from "./inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent } from "./reused-passwords-report.component";
import { ToolsRoutingModule } from "./tools-routing.module";
import { ToolsComponent } from "./tools.component";
import { UnsecuredWebsitesReportComponent } from "./unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./weak-passwords-report.component";

@NgModule({
  imports: [CommonModule, SharedModule, ToolsRoutingModule],
  declarations: [
    ExportComponent,
    ExposedPasswordsReportComponent,
    ImportComponent,
    InactiveTwoFactorReportComponent,
    ReusedPasswordsReportComponent,
    ToolsComponent,
    UnsecuredWebsitesReportComponent,
    WeakPasswordsReportComponent,
  ],
})
export class ToolsModule {}
