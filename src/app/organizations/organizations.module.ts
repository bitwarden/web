import { NgModule } from "@angular/core";

import { PipesModule } from "../modules/pipes/pipes.module";
import { SharedModule } from "../modules/shared.module";
import { VaultFilterModule } from "../modules/vault-filter/vault-filter.module";
import { OrganizationBadgeModule } from "../modules/vault/modules/organization-badge/organization-badge.module";


import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { OrganizationSwitcherComponent } from "./layouts/organization-switcher.component";
import { BulkConfirmComponent } from "./manage/bulk/bulk-confirm.component";
import { BulkRemoveComponent } from "./manage/bulk/bulk-remove.component";
import { BulkStatusComponent } from "./manage/bulk/bulk-status.component";
import { CollectionAddEditComponent } from "./manage/collection-add-edit.component";
import { CollectionsComponent as ManageCollectionsComponent } from "./manage/collections.component";
import { EntityEventsComponent } from "./manage/entity-events.component";
import { EntityUsersComponent } from "./manage/entity-users.component";
import { EventsComponent } from "./manage/events.component";
import { GroupAddEditComponent } from "./manage/group-add-edit.component";
import { GroupsComponent } from "./manage/groups.component";
import { ManageComponent } from "./manage/manage.component";
import { PeopleComponent } from "./manage/people.component";
import { PoliciesComponent } from "./manage/policies.component";
import { PolicyEditComponent } from "./manage/policy-edit.component";
import { ResetPasswordComponent } from "./manage/reset-password.component";
import { UserAddEditComponent } from "./manage/user-add-edit.component";
import { UserConfirmComponent } from "./manage/user-confirm.component";
import { UserGroupsComponent } from "./manage/user-groups.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";
import { DisableSendPolicyComponent } from "./policies/disable-send.component";
import { MasterPasswordPolicyComponent } from "./policies/master-password.component";
import { PasswordGeneratorPolicyComponent } from "./policies/password-generator.component";
import { PersonalOwnershipPolicyComponent } from "./policies/personal-ownership.component";
import { RequireSsoPolicyComponent } from "./policies/require-sso.component";
import { ResetPasswordPolicyComponent } from "./policies/reset-password.component";
import { SendOptionsPolicyComponent } from "./policies/send-options.component";
import { SingleOrgPolicyComponent } from "./policies/single-org.component";
import { TwoFactorAuthenticationPolicyComponent } from "./policies/two-factor-authentication.component";
import { AccountComponent as OrgAccountComponent } from "./settings/account.component";
import { AdjustSubscription } from "./settings/adjust-subscription.component";
import { BillingSyncApiKeyComponent } from "./settings/billing-sync-api-key.component";
import { ChangePlanComponent } from "./settings/change-plan.component";
import { DeleteOrganizationComponent } from "./settings/delete-organization.component";
import { DownloadLicenseComponent } from "./settings/download-license.component";
import { ImageSubscriptionHiddenComponent } from "./settings/image-subscription-hidden.component";
import { OrganizationBillingComponent } from "./settings/organization-billing.component";
import { OrganizationSubscriptionComponent } from "./settings/organization-subscription.component";
import { SettingsComponent } from "./settings/settings.component";
import { TwoFactorSetupComponent } from "./settings/two-factor-setup.component";
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
    OrganizationsRoutingModule,
    SharedModule,
    VaultFilterModule,
    OrganizationBadgeModule,
    PipesModule,
  ],
  declarations: [
    AcceptFamilySponsorshipComponent,
    AdjustSubscription,
    BillingSyncApiKeyComponent,
    BulkConfirmComponent,
    BulkRemoveComponent,
    BulkStatusComponent,
    ChangePlanComponent,
    CollectionAddEditComponent,
    DeleteOrganizationComponent,
    DisableSendPolicyComponent,
    DownloadLicenseComponent,
    EntityEventsComponent,
    EntityUsersComponent,
    EventsComponent,
    ExportComponent,
    ExposedPasswordsReportComponent,
    FamiliesForEnterpriseSetupComponent,
    GroupAddEditComponent,
    GroupsComponent,
    ImageSubscriptionHiddenComponent,
    ImportComponent,
    InactiveTwoFactorReportComponent,
    ManageCollectionsComponent,
    ManageComponent,
    MasterPasswordPolicyComponent,
    OrgAccountComponent,
    OrganizationBillingComponent,
    OrganizationLayoutComponent,
    OrganizationSubscriptionComponent,
    OrganizationSwitcherComponent,
    PasswordGeneratorPolicyComponent,
    PeopleComponent,
    PersonalOwnershipPolicyComponent,
    PoliciesComponent,
    PolicyEditComponent,
    RequireSsoPolicyComponent,
    ResetPasswordComponent,
    ResetPasswordPolicyComponent,
    ReusedPasswordsReportComponent,
    SendOptionsPolicyComponent,
    SettingsComponent,
    SingleOrgPolicyComponent,
    ToolsComponent,
    TwoFactorAuthenticationPolicyComponent,
    TwoFactorSetupComponent,
    UnsecuredWebsitesReportComponent,
    UserAddEditComponent,
    UserConfirmComponent,
    UserGroupsComponent,
    WeakPasswordsReportComponent,
  ],
})
export class OrganizationsModule {}
