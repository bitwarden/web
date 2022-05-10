import { NgModule } from "@angular/core";

import { PipesModule } from "../modules/pipes/pipes.module";
import { SharedModule } from "../modules/shared.module";
import { VaultFilterModule } from "../modules/vault-filter/vault-filter.module";
import { OrganizationBadgeModule } from "../modules/vault/modules/organization-badge/organization-badge.module";
import { OrganizationLayoutComponent } from "../organizations/layouts/organization-layout.component";
import { BulkConfirmComponent as OrgBulkConfirmComponent } from "../organizations/manage/bulk/bulk-confirm.component";
import { BulkRemoveComponent as OrgBulkRemoveComponent } from "../organizations/manage/bulk/bulk-remove.component";
import { BulkStatusComponent as OrgBulkStatusComponent } from "../organizations/manage/bulk/bulk-status.component";
import { CollectionAddEditComponent as OrgCollectionAddEditComponent } from "../organizations/manage/collection-add-edit.component";
import { CollectionsComponent as OrgManageCollectionsComponent } from "../organizations/manage/collections.component";
import { EntityEventsComponent as OrgEntityEventsComponent } from "../organizations/manage/entity-events.component";
import { EntityUsersComponent as OrgEntityUsersComponent } from "../organizations/manage/entity-users.component";
import { EventsComponent as OrgEventsComponent } from "../organizations/manage/events.component";
import { GroupAddEditComponent as OrgGroupAddEditComponent } from "../organizations/manage/group-add-edit.component";
import { GroupsComponent as OrgGroupsComponent } from "../organizations/manage/groups.component";
import { ManageComponent as OrgManageComponent } from "../organizations/manage/manage.component";
import { PeopleComponent as OrgPeopleComponent } from "../organizations/manage/people.component";
import { PoliciesComponent as OrgPoliciesComponent } from "../organizations/manage/policies.component";
import { PolicyEditComponent as OrgPolicyEditComponent } from "../organizations/manage/policy-edit.component";
import { ResetPasswordComponent as OrgResetPasswordComponent } from "../organizations/manage/reset-password.component";
import { UserAddEditComponent as OrgUserAddEditComponent } from "../organizations/manage/user-add-edit.component";
import { UserConfirmComponent as OrgUserConfirmComponent } from "../organizations/manage/user-confirm.component";
import { UserGroupsComponent as OrgUserGroupsComponent } from "../organizations/manage/user-groups.component";
import { DisableSendPolicyComponent } from "../organizations/policies/disable-send.component";
import { MasterPasswordPolicyComponent } from "../organizations/policies/master-password.component";
import { PasswordGeneratorPolicyComponent } from "../organizations/policies/password-generator.component";
import { PersonalOwnershipPolicyComponent } from "../organizations/policies/personal-ownership.component";
import { RequireSsoPolicyComponent } from "../organizations/policies/require-sso.component";
import { ResetPasswordPolicyComponent } from "../organizations/policies/reset-password.component";
import { SendOptionsPolicyComponent } from "../organizations/policies/send-options.component";
import { SingleOrgPolicyComponent } from "../organizations/policies/single-org.component";
import { TwoFactorAuthenticationPolicyComponent } from "../organizations/policies/two-factor-authentication.component";
import { AccountComponent as OrgAccountComponent } from "../organizations/settings/account.component";
import { AdjustSubscription } from "../organizations/settings/adjust-subscription.component";
import { BillingSyncApiKeyComponent } from "../organizations/settings/billing-sync-api-key.component";
import { ChangePlanComponent } from "../organizations/settings/change-plan.component";
import { DeleteOrganizationComponent } from "../organizations/settings/delete-organization.component";
import { DownloadLicenseComponent } from "../organizations/settings/download-license.component";
import { ImageSubscriptionHiddenComponent as OrgSubscriptionHiddenComponent } from "../organizations/settings/image-subscription-hidden.component";
import { OrganizationBillingComponent } from "../organizations/settings/organization-billing.component";
import { OrganizationSubscriptionComponent } from "../organizations/settings/organization-subscription.component";
import { SettingsComponent as OrgSettingComponent } from "../organizations/settings/settings.component";
import { TwoFactorSetupComponent as OrgTwoFactorSetupComponent } from "../organizations/settings/two-factor-setup.component";
import { AcceptFamilySponsorshipComponent } from "../organizations/sponsorships/accept-family-sponsorship.component";
import { FamiliesForEnterpriseSetupComponent } from "../organizations/sponsorships/families-for-enterprise-setup.component";
import { ExportComponent as OrgExportComponent } from "../organizations/tools/export.component";
import { ExposedPasswordsReportComponent as OrgExposedPasswordsReportComponent } from "../organizations/tools/exposed-passwords-report.component";
import { ImportComponent as OrgImportComponent } from "../organizations/tools/import.component";
import { InactiveTwoFactorReportComponent as OrgInactiveTwoFactorReportComponent } from "../organizations/tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent as OrgReusedPasswordsReportComponent } from "../organizations/tools/reused-passwords-report.component";
import { ToolsComponent as OrgToolsComponent } from "../organizations/tools/tools.component";
import { UnsecuredWebsitesReportComponent as OrgUnsecuredWebsitesReportComponent } from "../organizations/tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent as OrgWeakPasswordsReportComponent } from "../organizations/tools/weak-passwords-report.component";
import { AddEditComponent as OrgAddEditComponent } from "../organizations/vault/add-edit.component";
import { AttachmentsComponent as OrgAttachmentsComponent } from "../organizations/vault/attachments.component";
import { CiphersComponent as OrgCiphersComponent } from "../organizations/vault/ciphers.component";
import { CollectionsComponent as OrgCollectionsComponent } from "../organizations/vault/collections.component";

@NgModule({
  imports: [SharedModule, VaultFilterModule, OrganizationBadgeModule, PipesModule],
  declarations: [
    AcceptFamilySponsorshipComponent,
    AdjustSubscription,
    BillingSyncApiKeyComponent,
    ChangePlanComponent,
    DeleteOrganizationComponent,
    DisableSendPolicyComponent,
    DownloadLicenseComponent,
    FamiliesForEnterpriseSetupComponent,
    MasterPasswordPolicyComponent,
    OrgAccountComponent,
    OrgAddEditComponent,
    OrganizationBillingComponent,
    OrganizationLayoutComponent,
    OrganizationSubscriptionComponent,
    OrgAttachmentsComponent,
    OrgBulkConfirmComponent,
    OrgBulkRemoveComponent,
    OrgBulkStatusComponent,
    OrgCiphersComponent,
    OrgCollectionAddEditComponent,
    OrgCollectionsComponent,
    OrgEntityEventsComponent,
    OrgEntityUsersComponent,
    OrgEventsComponent,
    OrgExportComponent,
    OrgExposedPasswordsReportComponent,
    OrgGroupAddEditComponent,
    OrgGroupsComponent,
    OrgImportComponent,
    OrgInactiveTwoFactorReportComponent,
    OrgManageCollectionsComponent,
    OrgManageComponent,
    OrgPeopleComponent,
    OrgPoliciesComponent,
    OrgPolicyEditComponent,
    OrgResetPasswordComponent,
    OrgReusedPasswordsReportComponent,
    OrgSettingComponent,
    OrgToolsComponent,
    OrgTwoFactorSetupComponent,
    OrgSubscriptionHiddenComponent,
    OrgUnsecuredWebsitesReportComponent,
    OrgUserAddEditComponent,
    OrgUserConfirmComponent,
    OrgUserGroupsComponent,
    OrgWeakPasswordsReportComponent,
    PasswordGeneratorPolicyComponent,
    PersonalOwnershipPolicyComponent,
    RequireSsoPolicyComponent,
    ResetPasswordPolicyComponent,
    SendOptionsPolicyComponent,
    SingleOrgPolicyComponent,
    TwoFactorAuthenticationPolicyComponent,
  ],
  exports: [
    AdjustSubscription,
    ChangePlanComponent,
    DeleteOrganizationComponent,
    DisableSendPolicyComponent,
    DownloadLicenseComponent,
    FamiliesForEnterpriseSetupComponent,
    MasterPasswordPolicyComponent,
    OrgAccountComponent,
    OrgAddEditComponent,
    OrganizationBillingComponent,
    OrganizationLayoutComponent,
    OrganizationSubscriptionComponent,
    OrgAttachmentsComponent,
    OrgBulkConfirmComponent,
    OrgBulkRemoveComponent,
    OrgBulkStatusComponent,
    OrgCiphersComponent,
    OrgCollectionAddEditComponent,
    OrgCollectionsComponent,
    OrgEntityEventsComponent,
    OrgEntityUsersComponent,
    OrgEventsComponent,
    OrgExportComponent,
    OrgExposedPasswordsReportComponent,
    OrgGroupAddEditComponent,
    OrgGroupsComponent,
    OrgImportComponent,
    OrgInactiveTwoFactorReportComponent,
    OrgManageCollectionsComponent,
    OrgManageComponent,
    OrgPeopleComponent,
    OrgPoliciesComponent,
    OrgPolicyEditComponent,
    OrgResetPasswordComponent,
    OrgReusedPasswordsReportComponent,
    OrgSettingComponent,
    OrgToolsComponent,
    OrgTwoFactorSetupComponent,
    OrgUnsecuredWebsitesReportComponent,
    OrgUserAddEditComponent,
    OrgUserConfirmComponent,
    OrgUserGroupsComponent,
    OrgWeakPasswordsReportComponent,
    PasswordGeneratorPolicyComponent,
    PersonalOwnershipPolicyComponent,
    RequireSsoPolicyComponent,
    ResetPasswordPolicyComponent,
    SendOptionsPolicyComponent,
    SingleOrgPolicyComponent,
    TwoFactorAuthenticationPolicyComponent,
  ],
})
export class OrganizationModule {}
