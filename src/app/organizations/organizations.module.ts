import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { LayoutsModule } from "../layouts/layouts.module";
import { SharedModule } from "../modules/shared.module";

import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { OrganizationSwitcherComponent } from "./layouts/organization-switcher.component";
import { ManageModule } from "./manage/manage.module";
import { OrganizationsRoutingModule } from "./organizations-routing.module";
import { PoliciesModule } from "./policies/policies.module";
import { SettingsModule } from "./settings/settings.module";
import { AcceptFamilySponsorshipComponent } from "./sponsorships/accept-family-sponsorship.component";
import { FamiliesForEnterpriseSetupComponent } from "./sponsorships/families-for-enterprise-setup.component";
import { ExportComponent } from "./tools/export.component";
import { ExposedPasswordsReportComponent } from "./tools/exposed-passwords-report.component";
import { ImportComponent } from "./tools/import.component";
import { InactiveTwoFactorReportComponent } from "./tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent } from "./tools/reused-passwords-report.component";
import { ToolsComponent } from "./tools/tools.component";
import { UnsecuredWebsitesReportComponent } from "./tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./tools/weak-passwords-report.component";

@NgModule({
  imports: [
    CommonModule,
    OrganizationsRoutingModule,
    SharedModule,
    LayoutsModule,
    PoliciesModule,
    SettingsModule,
    ManageModule,
  ],
  declarations: [
    AcceptFamilySponsorshipComponent,
    ExportComponent,
    ExposedPasswordsReportComponent,
    FamiliesForEnterpriseSetupComponent,
    ImportComponent,
    InactiveTwoFactorReportComponent,
    OrganizationLayoutComponent,
    OrganizationSwitcherComponent,
    ReusedPasswordsReportComponent,
    ToolsComponent,
    UnsecuredWebsitesReportComponent,
    WeakPasswordsReportComponent,
  ],
})
export class OrganizationsModule {}
