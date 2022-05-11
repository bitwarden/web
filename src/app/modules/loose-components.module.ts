import { NgModule } from "@angular/core";

import { UserVerificationComponent } from "jslib-angular/components/user-verification.component";

import { AcceptEmergencyComponent } from "../accounts/accept-emergency.component";
import { AcceptOrganizationComponent } from "../accounts/accept-organization.component";
import { HintComponent } from "../accounts/hint.component";
import { LockComponent } from "../accounts/lock.component";
import { LoginComponent } from "../accounts/login.component";
import { RecoverDeleteComponent } from "../accounts/recover-delete.component";
import { RecoverTwoFactorComponent } from "../accounts/recover-two-factor.component";
import { RegisterComponent } from "../accounts/register.component";
import { RemovePasswordComponent } from "../accounts/remove-password.component";
import { SetPasswordComponent } from "../accounts/set-password.component";
import { SsoComponent } from "../accounts/sso.component";
import { TwoFactorOptionsComponent } from "../accounts/two-factor-options.component";
import { TwoFactorComponent } from "../accounts/two-factor.component";
import { UpdatePasswordComponent } from "../accounts/update-password.component";
import { UpdateTempPasswordComponent } from "../accounts/update-temp-password.component";
import { VerifyEmailTokenComponent } from "../accounts/verify-email-token.component";
import { VerifyRecoverDeleteComponent } from "../accounts/verify-recover-delete.component";
import { NestedCheckboxComponent } from "../components/nested-checkbox.component";
import { PasswordRepromptComponent } from "../components/password-reprompt.component";
import { PremiumBadgeComponent } from "../components/premium-badge.component";
import { FooterComponent } from "../layouts/footer.component";
import { FrontendLayoutComponent } from "../layouts/frontend-layout.component";
import { NavbarComponent } from "../layouts/navbar.component";
import { UserLayoutComponent } from "../layouts/user-layout.component";
import { ProvidersComponent } from "../providers/providers.component";
import { BreachReportComponent } from "../reports/breach-report.component";
import { ExposedPasswordsReportComponent } from "../reports/exposed-passwords-report.component";
import { InactiveTwoFactorReportComponent } from "../reports/inactive-two-factor-report.component";
import { ReportCardComponent } from "../reports/report-card.component";
import { ReportListComponent } from "../reports/report-list.component";
import { ReportsComponent } from "../reports/reports.component";
import { ReusedPasswordsReportComponent } from "../reports/reused-passwords-report.component";
import { UnsecuredWebsitesReportComponent } from "../reports/unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "../reports/weak-passwords-report.component";
import { AccessComponent } from "../send/access.component";
import { AddEditComponent as SendAddEditComponent } from "../send/add-edit.component";
import { EffluxDatesComponent as SendEffluxDatesComponent } from "../send/efflux-dates.component";
import { SendComponent } from "../send/send.component";
import { AccountComponent } from "../settings/account.component";
import { AddCreditComponent } from "../settings/add-credit.component";
import { AdjustPaymentComponent } from "../settings/adjust-payment.component";
import { AdjustStorageComponent } from "../settings/adjust-storage.component";
import { ApiKeyComponent } from "../settings/api-key.component";
import { BillingSyncKeyComponent } from "../settings/billing-sync-key.component";
import { ChangeEmailComponent } from "../settings/change-email.component";
import { ChangeKdfComponent } from "../settings/change-kdf.component";
import { ChangePasswordComponent } from "../settings/change-password.component";
import { CreateOrganizationComponent } from "../settings/create-organization.component";
import { DeauthorizeSessionsComponent } from "../settings/deauthorize-sessions.component";
import { DeleteAccountComponent } from "../settings/delete-account.component";
import { DomainRulesComponent } from "../settings/domain-rules.component";
import { EmergencyAccessAddEditComponent } from "../settings/emergency-access-add-edit.component";
import { EmergencyAccessAttachmentsComponent } from "../settings/emergency-access-attachments.component";
import { EmergencyAccessConfirmComponent } from "../settings/emergency-access-confirm.component";
import { EmergencyAccessTakeoverComponent } from "../settings/emergency-access-takeover.component";
import { EmergencyAccessViewComponent } from "../settings/emergency-access-view.component";
import { EmergencyAccessComponent } from "../settings/emergency-access.component";
import { EmergencyAddEditComponent } from "../settings/emergency-add-edit.component";
import { LinkSsoComponent } from "../settings/link-sso.component";
import { PaymentMethodComponent } from "../settings/payment-method.component";
import { PreferencesComponent } from "../settings/preferences.component";
import { PremiumComponent } from "../settings/premium.component";
import { ProfileComponent } from "../settings/profile.component";
import { PurgeVaultComponent } from "../settings/purge-vault.component";
import { SecurityKeysComponent } from "../settings/security-keys.component";
import { SecurityComponent } from "../settings/security.component";
import { SettingsComponent } from "../settings/settings.component";
import { SponsoredFamiliesComponent } from "../settings/sponsored-families.component";
import { SponsoringOrgRowComponent } from "../settings/sponsoring-org-row.component";
import { SubscriptionComponent } from "../settings/subscription.component";
import { TaxInfoComponent } from "../settings/tax-info.component";
import { TwoFactorAuthenticatorComponent } from "../settings/two-factor-authenticator.component";
import { TwoFactorDuoComponent } from "../settings/two-factor-duo.component";
import { TwoFactorEmailComponent } from "../settings/two-factor-email.component";
import { TwoFactorRecoveryComponent } from "../settings/two-factor-recovery.component";
import { TwoFactorSetupComponent } from "../settings/two-factor-setup.component";
import { TwoFactorVerifyComponent } from "../settings/two-factor-verify.component";
import { TwoFactorWebAuthnComponent } from "../settings/two-factor-webauthn.component";
import { TwoFactorYubiKeyComponent } from "../settings/two-factor-yubikey.component";
import { UpdateKeyComponent } from "../settings/update-key.component";
import { UpdateLicenseComponent } from "../settings/update-license.component";
import { UserBillingHistoryComponent } from "../settings/user-billing-history.component";
import { UserSubscriptionComponent } from "../settings/user-subscription.component";
import { VaultTimeoutInputComponent } from "../settings/vault-timeout-input.component";
import { VerifyEmailComponent } from "../settings/verify-email.component";
import { ExportComponent } from "../tools/export.component";
import { GeneratorComponent } from "../tools/generator.component";
import { ImportComponent } from "../tools/import.component";
import { PasswordGeneratorHistoryComponent } from "../tools/password-generator-history.component";
import { ToolsComponent } from "../tools/tools.component";
import { AddEditCustomFieldsComponent } from "../vault/add-edit-custom-fields.component";
import { AddEditComponent } from "../vault/add-edit.component";
import { AttachmentsComponent } from "../vault/attachments.component";
import { BulkActionsComponent } from "../vault/bulk-actions.component";
import { BulkDeleteComponent } from "../vault/bulk-delete.component";
import { BulkMoveComponent } from "../vault/bulk-move.component";
import { BulkRestoreComponent } from "../vault/bulk-restore.component";
import { BulkShareComponent } from "../vault/bulk-share.component";
import { CiphersComponent } from "../vault/ciphers.component";
import { CollectionsComponent } from "../vault/collections.component";
import { FolderAddEditComponent } from "../vault/folder-add-edit.component";
import { ShareComponent } from "../vault/share.component";

import { PipesModule } from "./pipes/pipes.module";
import { SharedModule } from "./shared.module";
import { VaultFilterModule } from "./vault-filter/vault-filter.module";
import { OrganizationBadgeModule } from "./vault/modules/organization-badge/organization-badge.module";

// Please do not add to this list of declarations - we should refactor these into modules when doing so makes sense until there are none left.
// If you are building new functionality, please create or extend a feature module instead.
@NgModule({
  imports: [SharedModule, VaultFilterModule, OrganizationBadgeModule, PipesModule],
  declarations: [
    PremiumBadgeComponent,
    AcceptEmergencyComponent,
    AcceptOrganizationComponent,
    AccessComponent,
    AccountComponent,
    AddCreditComponent,
    AddEditComponent,
    AddEditCustomFieldsComponent,
    AddEditCustomFieldsComponent,
    AdjustPaymentComponent,
    AdjustStorageComponent,
    ApiKeyComponent,
    AttachmentsComponent,
    BillingSyncKeyComponent,
    BreachReportComponent,
    BulkActionsComponent,
    BulkDeleteComponent,
    BulkMoveComponent,
    BulkRestoreComponent,
    BulkShareComponent,
    ChangeEmailComponent,
    ChangeKdfComponent,
    ChangePasswordComponent,
    CiphersComponent,
    CollectionsComponent,
    CreateOrganizationComponent,
    DeauthorizeSessionsComponent,
    DeleteAccountComponent,
    DomainRulesComponent,
    EmergencyAccessAddEditComponent,
    EmergencyAccessAttachmentsComponent,
    EmergencyAccessComponent,
    EmergencyAccessConfirmComponent,
    EmergencyAccessTakeoverComponent,
    EmergencyAccessViewComponent,
    EmergencyAddEditComponent,
    ExportComponent,
    ExposedPasswordsReportComponent,
    FolderAddEditComponent,
    FooterComponent,
    FrontendLayoutComponent,
    HintComponent,
    ImportComponent,
    InactiveTwoFactorReportComponent,
    LinkSsoComponent,
    LockComponent,
    LoginComponent,
    NavbarComponent,
    NestedCheckboxComponent,
    GeneratorComponent,
    PasswordGeneratorHistoryComponent,
    PasswordRepromptComponent,
    PaymentMethodComponent,
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
    ReportCardComponent,
    ReportListComponent,
    ReportsComponent,
    ReusedPasswordsReportComponent,
    SecurityComponent,
    SecurityKeysComponent,
    SendAddEditComponent,
    SendComponent,
    SendEffluxDatesComponent,
    SetPasswordComponent,
    SettingsComponent,
    ShareComponent,
    SponsoredFamiliesComponent,
    SponsoringOrgRowComponent,
    SsoComponent,
    SubscriptionComponent,
    TaxInfoComponent,
    ToolsComponent,
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
    UserBillingHistoryComponent,
    UserLayoutComponent,
    UserSubscriptionComponent,
    UserVerificationComponent,
    VaultTimeoutInputComponent,
    VerifyEmailComponent,
    VerifyEmailTokenComponent,
    VerifyRecoverDeleteComponent,
    WeakPasswordsReportComponent,
  ],
  exports: [
    PremiumBadgeComponent,
    AcceptEmergencyComponent,
    AcceptOrganizationComponent,
    AccessComponent,
    AccountComponent,
    AddCreditComponent,
    AddEditComponent,
    AddEditCustomFieldsComponent,
    AddEditCustomFieldsComponent,
    AdjustPaymentComponent,
    AdjustStorageComponent,
    ApiKeyComponent,
    AttachmentsComponent,
    BreachReportComponent,
    BulkActionsComponent,
    BulkDeleteComponent,
    BulkMoveComponent,
    BulkRestoreComponent,
    BulkShareComponent,
    ChangeEmailComponent,
    ChangeKdfComponent,
    ChangePasswordComponent,
    CiphersComponent,
    CollectionsComponent,
    CreateOrganizationComponent,
    DeauthorizeSessionsComponent,
    DeleteAccountComponent,
    DomainRulesComponent,
    EmergencyAccessAddEditComponent,
    EmergencyAccessAttachmentsComponent,
    EmergencyAccessComponent,
    EmergencyAccessConfirmComponent,
    EmergencyAccessTakeoverComponent,
    EmergencyAccessViewComponent,
    EmergencyAddEditComponent,
    ExportComponent,
    ExposedPasswordsReportComponent,
    FolderAddEditComponent,
    FooterComponent,
    FrontendLayoutComponent,
    HintComponent,
    ImportComponent,
    InactiveTwoFactorReportComponent,
    LinkSsoComponent,
    LockComponent,
    LoginComponent,
    NavbarComponent,
    NestedCheckboxComponent,
    GeneratorComponent,
    PasswordGeneratorHistoryComponent,
    PasswordRepromptComponent,
    PaymentMethodComponent,
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
    ReportCardComponent,
    ReportListComponent,
    ReportsComponent,
    ReusedPasswordsReportComponent,
    SecurityComponent,
    SecurityKeysComponent,
    SendAddEditComponent,
    SendComponent,
    SendEffluxDatesComponent,
    SetPasswordComponent,
    SettingsComponent,
    ShareComponent,
    SponsoredFamiliesComponent,
    SponsoringOrgRowComponent,
    SsoComponent,
    SubscriptionComponent,
    TaxInfoComponent,
    ToolsComponent,
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
    UserBillingHistoryComponent,
    UserLayoutComponent,
    UserSubscriptionComponent,
    UserVerificationComponent,
    VaultTimeoutInputComponent,
    VerifyEmailComponent,
    VerifyEmailTokenComponent,
    VerifyRecoverDeleteComponent,
    WeakPasswordsReportComponent,
  ],
})
export class LooseComponentsModule {}
