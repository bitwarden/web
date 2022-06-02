import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { LayoutsModule } from "../layouts/layouts.module";
import { SharedModule } from "../modules/shared.module";

import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { OrganizationSwitcherComponent } from "./layouts/organization-switcher.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";
import { SettingsModule } from "./settings/settings.module";
import { AcceptFamilySponsorshipComponent } from "./sponsorships/accept-family-sponsorship.component";
import { FamiliesForEnterpriseSetupComponent } from "./sponsorships/families-for-enterprise-setup.component";

@NgModule({
  imports: [CommonModule, OrganizationsRoutingModule, SharedModule, LayoutsModule, SettingsModule],
  declarations: [
    AcceptFamilySponsorshipComponent,
    FamiliesForEnterpriseSetupComponent,
    OrganizationLayoutComponent,
    OrganizationSwitcherComponent,
  ],
})
export class OrganizationsModule {}
