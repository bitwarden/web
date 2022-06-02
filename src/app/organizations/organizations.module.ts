import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { LayoutsModule } from "../layouts/layouts.module";
import { SharedModule } from "../modules/shared.module";

import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { OrganizationSwitcherComponent } from "./layouts/organization-switcher.component";
import { BulkConfirmComponent } from "./manage/bulk/bulk-confirm.component";
import { BulkRemoveComponent } from "./manage/bulk/bulk-remove.component";
import { BulkStatusComponent } from "./manage/bulk/bulk-status.component";
import { CollectionAddEditComponent } from "./manage/collection-add-edit.component";
import { CollectionsComponent as ManageCollectionsComponent } from "./manage/collections.component";
import { EntityEventsComponent } from "./manage/entity-events.component";
import { EventsComponent } from "./manage/events.component";
import { GroupAddEditComponent } from "./manage/group-add-edit.component";
import { GroupsComponent } from "./manage/groups.component";
import { ManageComponent } from "./manage/manage.component";
import { PeopleComponent } from "./manage/people.component";
import { PolicyEditComponent } from "./manage/policy-edit.component";
import { ResetPasswordComponent } from "./manage/reset-password.component";
import { UserAddEditComponent } from "./manage/user-add-edit.component";
import { UserConfirmComponent } from "./manage/user-confirm.component";
import { UserGroupsComponent } from "./manage/user-groups.component";
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
  ],
  declarations: [
    AcceptFamilySponsorshipComponent,
    BulkConfirmComponent,
    BulkRemoveComponent,
    BulkStatusComponent,
    CollectionAddEditComponent,
    EntityEventsComponent,
    EventsComponent,
    ExportComponent,
    ExposedPasswordsReportComponent,
    FamiliesForEnterpriseSetupComponent,
    GroupAddEditComponent,
    GroupsComponent,
    ImportComponent,
    InactiveTwoFactorReportComponent,
    ManageCollectionsComponent,
    ManageComponent,
    OrganizationLayoutComponent,
    OrganizationSwitcherComponent,
    PeopleComponent,
    PolicyEditComponent,
    ResetPasswordComponent,
    ReusedPasswordsReportComponent,
    ToolsComponent,
    UnsecuredWebsitesReportComponent,
    UserAddEditComponent,
    UserConfirmComponent,
    UserGroupsComponent,
    WeakPasswordsReportComponent,
  ],
})
export class OrganizationsModule {}
