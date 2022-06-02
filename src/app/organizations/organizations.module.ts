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
import { ToolsModule } from "./tools/tools.module";

@NgModule({
  imports: [
    CommonModule,
    OrganizationsRoutingModule,
    SharedModule,
    LayoutsModule,
    PoliciesModule,
    SettingsModule,
    ManageModule,
    ToolsModule,
  ],
  declarations: [
    AcceptFamilySponsorshipComponent,
    FamiliesForEnterpriseSetupComponent,
    OrganizationLayoutComponent,
    OrganizationSwitcherComponent,
  ],
})
export class OrganizationsModule {}
