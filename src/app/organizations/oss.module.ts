import { DragDropModule } from "@angular/cdk/drag-drop";
import { DatePipe, registerLocaleData, CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { BadgeModule } from "@bitwarden/components";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ToastrModule } from "ngx-toastr";

import { AvatarComponent } from "jslib-angular/components/avatar.component";
import { CalloutComponent } from "jslib-angular/components/callout.component";
import { ExportScopeCalloutComponent } from "jslib-angular/components/export-scope-callout.component";
import { IconComponent } from "jslib-angular/components/icon.component";
import { VerifyMasterPasswordComponent } from "jslib-angular/components/verify-master-password.component";
import { A11yInvalidDirective } from "jslib-angular/directives/a11y-invalid.directive";
import { A11yTitleDirective } from "jslib-angular/directives/a11y-title.directive";
import { ApiActionDirective } from "jslib-angular/directives/api-action.directive";
import { AutofocusDirective } from "jslib-angular/directives/autofocus.directive";
import { BlurClickDirective } from "jslib-angular/directives/blur-click.directive";
import { BoxRowDirective } from "jslib-angular/directives/box-row.directive";
import { FallbackSrcDirective } from "jslib-angular/directives/fallback-src.directive";
import { InputStripSpacesDirective } from "jslib-angular/directives/input-strip-spaces.directive";
import { InputVerbatimDirective } from "jslib-angular/directives/input-verbatim.directive";
import { NotPremiumDirective } from "jslib-angular/directives/not-premium.directive";
import { SelectCopyDirective } from "jslib-angular/directives/select-copy.directive";
import { StopClickDirective } from "jslib-angular/directives/stop-click.directive";
import { StopPropDirective } from "jslib-angular/directives/stop-prop.directive";
import { TrueFalseValueDirective } from "jslib-angular/directives/true-false-value.directive";
import { ColorPasswordPipe } from "jslib-angular/pipes/color-password.pipe";
import { I18nPipe } from "jslib-angular/pipes/i18n.pipe";
import { SearchCiphersPipe } from "jslib-angular/pipes/search-ciphers.pipe";
import { SearchPipe } from "jslib-angular/pipes/search.pipe";
import { UserNamePipe } from "jslib-angular/pipes/user-name.pipe";

import { AcceptEmergencyComponent } from "./accounts/accept-emergency.component";
import { AcceptOrganizationComponent } from "./accounts/accept-organization.component";
import { HintComponent } from "./accounts/hint.component";
import { LockComponent } from "./accounts/lock.component";
import { LoginComponent } from "./accounts/login.component";
import { RecoverDeleteComponent } from "./accounts/recover-delete.component";
import { RecoverTwoFactorComponent } from "./accounts/recover-two-factor.component";
import { RegisterComponent } from "./accounts/register.component";
import { RemovePasswordComponent } from "./accounts/remove-password.component";
import { SetPasswordComponent } from "./accounts/set-password.component";
import { SsoComponent } from "./accounts/sso.component";
import { TwoFactorOptionsComponent } from "./accounts/two-factor-options.component";
import { TwoFactorComponent } from "./accounts/two-factor.component";
import { UpdatePasswordComponent } from "./accounts/update-password.component";
import { UpdateTempPasswordComponent } from "./accounts/update-temp-password.component";
import { VerifyEmailTokenComponent } from "./accounts/verify-email-token.component";
import { VerifyRecoverDeleteComponent } from "./accounts/verify-recover-delete.component";
import { NestedCheckboxComponent } from "./components/nested-checkbox.component";
import { PasswordRepromptComponent } from "./components/password-reprompt.component";
import { PasswordStrengthComponent } from "./components/password-strength.component";
import { PremiumBadgeComponent } from "./components/premium-badge.component";
import { FooterComponent } from "./layouts/footer.component";
import { FrontendLayoutComponent } from "./layouts/frontend-layout.component";
import { NavbarComponent } from "./layouts/navbar.component";
import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { UserLayoutComponent } from "./layouts/user-layout.component";
import { BulkConfirmComponent as OrgBulkConfirmComponent } from "./organizations/manage/bulk/bulk-confirm.component";
import { BulkRemoveComponent as OrgBulkRemoveComponent } from "./organizations/manage/bulk/bulk-remove.component";
import { BulkStatusComponent as OrgBulkStatusComponent } from "./organizations/manage/bulk/bulk-status.component";
import { CollectionAddEditComponent as OrgCollectionAddEditComponent } from "./organizations/manage/collection-add-edit.component";
import { CollectionsComponent as OrgManageCollectionsComponent } from "./organizations/manage/collections.component";
import { EntityEventsComponent as OrgEntityEventsComponent } from "./organizations/manage/entity-events.component";
import { EntityUsersComponent as OrgEntityUsersComponent } from "./organizations/manage/entity-users.component";
import { EventsComponent as OrgEventsComponent } from "./organizations/manage/events.component";
import { GroupAddEditComponent as OrgGroupAddEditComponent } from "./organizations/manage/group-add-edit.component";
import { GroupsComponent as OrgGroupsComponent } from "./organizations/manage/groups.component";
import { ManageComponent as OrgManageComponent } from "./organizations/manage/manage.component";
import { PeopleComponent as OrgPeopleComponent } from "./organizations/manage/people.component";
import { PoliciesComponent as OrgPoliciesComponent } from "./organizations/manage/policies.component";
import { PolicyEditComponent as OrgPolicyEditComponent } from "./organizations/manage/policy-edit.component";
import { ResetPasswordComponent as OrgResetPasswordComponent } from "./organizations/manage/reset-password.component";
import { UserAddEditComponent as OrgUserAddEditComponent } from "./organizations/manage/user-add-edit.component";
import { UserConfirmComponent as OrgUserConfirmComponent } from "./organizations/manage/user-confirm.component";
import { UserGroupsComponent as OrgUserGroupsComponent } from "./organizations/manage/user-groups.component";
import { DisableSendPolicyComponent } from "./organizations/policies/disable-send.component";
import { MasterPasswordPolicyComponent } from "./organizations/policies/master-password.component";
import { PasswordGeneratorPolicyComponent } from "./organizations/policies/password-generator.component";
import { PersonalOwnershipPolicyComponent } from "./organizations/policies/personal-ownership.component";
import { RequireSsoPolicyComponent } from "./organizations/policies/require-sso.component";
import { ResetPasswordPolicyComponent } from "./organizations/policies/reset-password.component";
import { SendOptionsPolicyComponent } from "./organizations/policies/send-options.component";
import { SingleOrgPolicyComponent } from "./organizations/policies/single-org.component";
import { TwoFactorAuthenticationPolicyComponent } from "./organizations/policies/two-factor-authentication.component";
import { AccountComponent as OrgAccountComponent } from "./organizations/settings/account.component";
import { AdjustSubscription } from "./organizations/settings/adjust-subscription.component";
import { ChangePlanComponent } from "./organizations/settings/change-plan.component";
import { DeleteOrganizationComponent } from "./organizations/settings/delete-organization.component";
import { DownloadLicenseComponent } from "./organizations/settings/download-license.component";
import { OrganizationBillingComponent } from "./organizations/settings/organization-billing.component";
import { OrganizationSubscriptionComponent } from "./organizations/settings/organization-subscription.component";
import { SettingsComponent as OrgSettingComponent } from "./organizations/settings/settings.component";
import { TwoFactorSetupComponent as OrgTwoFactorSetupComponent } from "./organizations/settings/two-factor-setup.component";
import { FamiliesForEnterpriseSetupComponent } from "./organizations/sponsorships/families-for-enterprise-setup.component";
import { ExportComponent as OrgExportComponent } from "./organizations/tools/export.component";
import { ExposedPasswordsReportComponent as OrgExposedPasswordsReportComponent } from "./organizations/tools/exposed-passwords-report.component";
import { ImportComponent as OrgImportComponent } from "./organizations/tools/import.component";
import { InactiveTwoFactorReportComponent as OrgInactiveTwoFactorReportComponent } from "./organizations/tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent as OrgReusedPasswordsReportComponent } from "./organizations/tools/reused-passwords-report.component";
import { ToolsComponent as OrgToolsComponent } from "./organizations/tools/tools.component";
import { UnsecuredWebsitesReportComponent as OrgUnsecuredWebsitesReportComponent } from "./organizations/tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent as OrgWeakPasswordsReportComponent } from "./organizations/tools/weak-passwords-report.component";
import { AddEditComponent as OrgAddEditComponent } from "./organizations/vault/add-edit.component";
import { AttachmentsComponent as OrgAttachmentsComponent } from "./organizations/vault/attachments.component";
import { CiphersComponent as OrgCiphersComponent } from "./organizations/vault/ciphers.component";
import { CollectionsComponent as OrgCollectionsComponent } from "./organizations/vault/collections.component";
import { GroupingsComponent as OrgGroupingsComponent } from "./organizations/vault/groupings.component";
import { VaultComponent as OrgVaultComponent } from "./organizations/vault/vault.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    InfiniteScrollModule,
    DragDropModule,
    ToastrModule,
    ReactiveFormsModule,
    RouterModule,
    BadgeModule,
  ],
  declarations: [
    A11yInvalidDirective,
    A11yTitleDirective,
    AcceptEmergencyComponent,
    AcceptOrganizationComponent,
    AdjustSubscription,
    ApiActionDirective,
    AutofocusDirective,
    AvatarComponent,
    BlurClickDirective,
    BoxRowDirective,
    CalloutComponent,
    ChangePlanComponent,
    ColorPasswordPipe,
    DeleteOrganizationComponent,
    DisableSendPolicyComponent,
    DownloadLicenseComponent,
    ExportScopeCalloutComponent,
    FallbackSrcDirective,
    FamiliesForEnterpriseSetupComponent,
    FooterComponent,
    FrontendLayoutComponent,
    HintComponent,
    I18nPipe,
    IconComponent,
    InputStripSpacesDirective,
    InputVerbatimDirective,
    LockComponent,
    LoginComponent,
    MasterPasswordPolicyComponent,
    NavbarComponent,
    NestedCheckboxComponent,
    NotPremiumDirective,
    OrgAccountComponent,
    OrgAddEditComponent,
    OrganizationBillingComponent,
    OrganizationLayoutComponent,
    OrganizationPlansComponent,
    OrganizationsComponent,
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
    OrgGroupingsComponent,
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
    OrgVaultComponent,
    OrgWeakPasswordsReportComponent,
    PasswordGeneratorComponent,
    PasswordGeneratorHistoryComponent,
    PasswordGeneratorPolicyComponent,
    PasswordRepromptComponent,
    PasswordStrengthComponent,
    PaymentComponent,
    PersonalOwnershipPolicyComponent,
    PreferencesComponent,
    PremiumBadgeComponent,
    PremiumComponent,
    ProfileComponent,
    ProvidersComponent,
    PurgeVaultComponent,
    RecoverDeleteComponent,
    RecoverTwoFactorComponent,
    RegisterComponent,
    RemovePasswordComponent,
    RequireSsoPolicyComponent,
    ResetPasswordPolicyComponent,
    ReusedPasswordsReportComponent,
    SearchCiphersPipe,
    SearchPipe,
    SelectCopyDirective,
    SendAddEditComponent,
    SendComponent,
    SendEffluxDatesComponent,
    SendOptionsPolicyComponent,
    SetPasswordComponent,
    SettingsComponent,
    ShareComponent,
    SingleOrgPolicyComponent,
    SponsoredFamiliesComponent,
    SponsoringOrgRowComponent,
    SsoComponent,
    StopClickDirective,
    StopPropDirective,
    TaxInfoComponent,
    ToolsComponent,
    TrueFalseValueDirective,
    TwoFactorAuthenticationPolicyComponent,
    TwoFactorAuthenticatorComponent,
    TwoFactorComponent,
    TwoFactorDuoComponent,
    TwoFactorEmailComponent,
    TwoFactorOptionsComponent,
    TwoFactorRecoveryComponent,
    TwoFactorSetupComponent,
    TwoFactorVerifyComponent,
    TwoFactorWebAuthnComponent,
    TwoFactorYubiKeyComponent,
    UnsecuredWebsitesReportComponent,
    UpdateKeyComponent,
    UpdateLicenseComponent,
    UpdatePasswordComponent,
    UpdateTempPasswordComponent,
    UserBillingComponent,
    UserLayoutComponent,
    UserNamePipe,
    UserSubscriptionComponent,
    VaultComponent,
    VaultTimeoutInputComponent,
    VerifyEmailComponent,
    VerifyEmailTokenComponent,
    VerifyMasterPasswordComponent,
    VerifyRecoverDeleteComponent,
    WeakPasswordsReportComponent,
  ],
  exports: [
    A11yTitleDirective,
    A11yInvalidDirective,
    ApiActionDirective,
    AvatarComponent,
    CalloutComponent,
    FooterComponent,
    I18nPipe,
    InputStripSpacesDirective,
    NavbarComponent,
    OrganizationPlansComponent,
    SearchPipe,
    StopClickDirective,
    StopPropDirective,
    UserNamePipe,
  ],
  providers: [DatePipe, SearchPipe, UserNamePipe],
  bootstrap: [],
})
export class OrganizationsModule {}
