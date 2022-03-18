import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuardService } from "jslib-angular/services/auth-guard.service";
import { LockGuardService } from "jslib-angular/services/lock-guard.service";
import { UnauthGuardService } from "jslib-angular/services/unauth-guard.service";

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
import { TwoFactorComponent } from "./accounts/two-factor.component";
import { UpdatePasswordComponent } from "./accounts/update-password.component";
import { UpdateTempPasswordComponent } from "./accounts/update-temp-password.component";
import { VerifyEmailTokenComponent } from "./accounts/verify-email-token.component";
import { VerifyRecoverDeleteComponent } from "./accounts/verify-recover-delete.component";
import { FrontendLayoutComponent } from "./layouts/frontend-layout.component";
import { UserLayoutComponent } from "./layouts/user-layout.component";
import { FamiliesForEnterpriseSetupComponent } from "./organizations/sponsorships/families-for-enterprise-setup.component";
import { AccessComponent } from "./send/access.component";
import { SendComponent } from "./send/send.component";
import { AccountComponent } from "./settings/account.component";
import { CreateOrganizationComponent } from "./settings/create-organization.component";
import { DomainRulesComponent } from "./settings/domain-rules.component";
import { EmergencyAccessViewComponent } from "./settings/emergency-access-view.component";
import { EmergencyAccessComponent } from "./settings/emergency-access.component";
import { OrganizationsComponent } from "./settings/organizations.component";
import { PreferencesComponent } from "./settings/preferences.component";
import { PremiumComponent } from "./settings/premium.component";
import { SettingsComponent } from "./settings/settings.component";
import { SponsoredFamiliesComponent } from "./settings/sponsored-families.component";
import { TwoFactorSetupComponent } from "./settings/two-factor-setup.component";
import { UserBillingComponent } from "./settings/user-billing.component";
import { UserSubscriptionComponent } from "./settings/user-subscription.component";
import { BreachReportComponent } from "./tools/breach-report.component";
import { ExportComponent } from "./tools/export.component";
import { ExposedPasswordsReportComponent } from "./tools/exposed-passwords-report.component";
import { ImportComponent } from "./tools/import.component";
import { InactiveTwoFactorReportComponent } from "./tools/inactive-two-factor-report.component";
import { PasswordGeneratorComponent } from "./tools/password-generator.component";
import { ReusedPasswordsReportComponent } from "./tools/reused-passwords-report.component";
import { ToolsComponent } from "./tools/tools.component";
import { UnsecuredWebsitesReportComponent } from "./tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./tools/weak-passwords-report.component";
import { VaultComponent } from "./vault/vault.component";

const routes: Routes = [
  {
    path: "",
    component: FrontendLayoutComponent,
    children: [
      { path: "", pathMatch: "full", component: LoginComponent, canActivate: [UnauthGuardService] },
      { path: "2fa", component: TwoFactorComponent, canActivate: [UnauthGuardService] },
      {
        path: "register",
        component: RegisterComponent,
        canActivate: [UnauthGuardService],
        data: { titleId: "createAccount" },
      },
      {
        path: "sso",
        component: SsoComponent,
        canActivate: [UnauthGuardService],
        data: { titleId: "enterpriseSingleSignOn" },
      },
      {
        path: "set-password",
        component: SetPasswordComponent,
        data: { titleId: "setMasterPassword" },
      },
      {
        path: "hint",
        component: HintComponent,
        canActivate: [UnauthGuardService],
        data: { titleId: "passwordHint" },
      },
      {
        path: "lock",
        component: LockComponent,
        canActivate: [LockGuardService],
      },
      { path: "verify-email", component: VerifyEmailTokenComponent },
      {
        path: "accept-organization",
        component: AcceptOrganizationComponent,
        data: { titleId: "joinOrganization" },
      },
      {
        path: "accept-emergency",
        component: AcceptEmergencyComponent,
        data: { titleId: "acceptEmergency" },
      },
      { path: "recover", pathMatch: "full", redirectTo: "recover-2fa" },
      {
        path: "recover-2fa",
        component: RecoverTwoFactorComponent,
        canActivate: [UnauthGuardService],
        data: { titleId: "recoverAccountTwoStep" },
      },
      {
        path: "recover-delete",
        component: RecoverDeleteComponent,
        canActivate: [UnauthGuardService],
        data: { titleId: "deleteAccount" },
      },
      {
        path: "verify-recover-delete",
        component: VerifyRecoverDeleteComponent,
        canActivate: [UnauthGuardService],
        data: { titleId: "deleteAccount" },
      },
      {
        path: "send/:sendId/:key",
        component: AccessComponent,
        data: { title: "Bitwarden Send" },
      },
      {
        path: "update-temp-password",
        component: UpdateTempPasswordComponent,
        canActivate: [AuthGuardService],
        data: { titleId: "updateTempPassword" },
      },
      {
        path: "update-password",
        component: UpdatePasswordComponent,
        canActivate: [AuthGuardService],
        data: { titleId: "updatePassword" },
      },
      {
        path: "remove-password",
        component: RemovePasswordComponent,
        canActivate: [AuthGuardService],
        data: { titleId: "removeMasterPassword" },
      },
    ],
  },
  {
    path: "",
    component: UserLayoutComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: "vault", component: VaultComponent, data: { titleId: "myVault" } },
      { path: "sends", component: SendComponent, data: { title: "Send" } },
      {
        path: "settings",
        component: SettingsComponent,
        children: [
          { path: "", pathMatch: "full", redirectTo: "account" },
          { path: "account", component: AccountComponent, data: { titleId: "myAccount" } },
          {
            path: "preferences",
            component: PreferencesComponent,
            data: { titleId: "preferences" },
          },
          {
            path: "domain-rules",
            component: DomainRulesComponent,
            data: { titleId: "domainRules" },
          },
          {
            path: "two-factor",
            component: TwoFactorSetupComponent,
            data: { titleId: "twoStepLogin" },
          },
          { path: "premium", component: PremiumComponent, data: { titleId: "goPremium" } },
          { path: "billing", component: UserBillingComponent, data: { titleId: "billing" } },
          {
            path: "subscription",
            component: UserSubscriptionComponent,
            data: { titleId: "premiumMembership" },
          },
          {
            path: "organizations",
            component: OrganizationsComponent,
            data: { titleId: "organizations" },
          },
          {
            path: "create-organization",
            component: CreateOrganizationComponent,
            data: { titleId: "newOrganization" },
          },
          {
            path: "emergency-access",
            children: [
              {
                path: "",
                component: EmergencyAccessComponent,
                data: { titleId: "emergencyAccess" },
              },
              {
                path: ":id",
                component: EmergencyAccessViewComponent,
                data: { titleId: "emergencyAccess" },
              },
            ],
          },
          {
            path: "sponsored-families",
            component: SponsoredFamiliesComponent,
            data: { titleId: "sponsoredFamilies" },
          },
        ],
      },
      {
        path: "tools",
        component: ToolsComponent,
        canActivate: [AuthGuardService],
        children: [
          { path: "", pathMatch: "full", redirectTo: "generator" },
          { path: "import", component: ImportComponent, data: { titleId: "importData" } },
          { path: "export", component: ExportComponent, data: { titleId: "exportVault" } },
          {
            path: "generator",
            component: PasswordGeneratorComponent,
            data: { titleId: "passwordGenerator" },
          },
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
      { path: "setup/families-for-enterprise", component: FamiliesForEnterpriseSetupComponent },
      {
        path: "organizations",
        loadChildren: () =>
          import("./organizations/organization-routing.module").then(
            (m) => m.OrganizationsRoutingModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      paramsInheritanceStrategy: "always",
      // enableTracing: true,
    }),
  ],
  exports: [RouterModule],
})
export class OssRoutingModule {}
