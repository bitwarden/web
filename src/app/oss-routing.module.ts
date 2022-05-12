import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "jslib-angular/guards/auth.guard";
import { LockGuard } from "jslib-angular/guards/lock.guard";
import { UnauthGuard } from "jslib-angular/guards/unauth.guard";

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
import { HomeGuard } from "./guards/home.guard";
import { FrontendLayoutComponent } from "./layouts/frontend-layout.component";
import { UserLayoutComponent } from "./layouts/user-layout.component";
import { AcceptFamilySponsorshipComponent } from "./organizations/sponsorships/accept-family-sponsorship.component";
import { FamiliesForEnterpriseSetupComponent } from "./organizations/sponsorships/families-for-enterprise-setup.component";
import { AccessComponent } from "./send/access.component";
import { SendComponent } from "./send/send.component";
import { AccountComponent } from "./settings/account.component";
import { CreateOrganizationComponent } from "./settings/create-organization.component";
import { DomainRulesComponent } from "./settings/domain-rules.component";
import { EmergencyAccessViewComponent } from "./settings/emergency-access-view.component";
import { EmergencyAccessComponent } from "./settings/emergency-access.component";
import { PreferencesComponent } from "./settings/preferences.component";
import { SettingsComponent } from "./settings/settings.component";
import { SponsoredFamiliesComponent } from "./settings/sponsored-families.component";
import { ExportComponent } from "./tools/export.component";
import { GeneratorComponent } from "./tools/generator.component";
import { ImportComponent } from "./tools/import.component";
import { ToolsComponent } from "./tools/tools.component";

const routes: Routes = [
  {
    path: "",
    component: FrontendLayoutComponent,
    data: { doNotSaveUrl: true },
    children: [
      {
        path: "",
        pathMatch: "full",
        children: [], // Children lets us have an empty component.
        canActivate: [HomeGuard], // Redirects either to vault, login or lock page.
      },
      { path: "login", component: LoginComponent, canActivate: [UnauthGuard] },
      { path: "2fa", component: TwoFactorComponent, canActivate: [UnauthGuard] },
      {
        path: "register",
        component: RegisterComponent,
        canActivate: [UnauthGuard],
        data: { titleId: "createAccount" },
      },
      {
        path: "sso",
        component: SsoComponent,
        canActivate: [UnauthGuard],
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
        canActivate: [UnauthGuard],
        data: { titleId: "passwordHint" },
      },
      {
        path: "lock",
        component: LockComponent,
        canActivate: [LockGuard],
      },
      { path: "verify-email", component: VerifyEmailTokenComponent },
      {
        path: "accept-organization",
        component: AcceptOrganizationComponent,
        data: { titleId: "joinOrganization", doNotSaveUrl: false },
      },
      {
        path: "accept-emergency",
        component: AcceptEmergencyComponent,
        data: { titleId: "acceptEmergency", doNotSaveUrl: false },
      },
      {
        path: "accept-families-for-enterprise",
        component: AcceptFamilySponsorshipComponent,
        data: { titleId: "acceptFamilySponsorship", doNotSaveUrl: false },
      },
      { path: "recover", pathMatch: "full", redirectTo: "recover-2fa" },
      {
        path: "recover-2fa",
        component: RecoverTwoFactorComponent,
        canActivate: [UnauthGuard],
        data: { titleId: "recoverAccountTwoStep" },
      },
      {
        path: "recover-delete",
        component: RecoverDeleteComponent,
        canActivate: [UnauthGuard],
        data: { titleId: "deleteAccount" },
      },
      {
        path: "verify-recover-delete",
        component: VerifyRecoverDeleteComponent,
        canActivate: [UnauthGuard],
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
        canActivate: [AuthGuard],
        data: { titleId: "updateTempPassword" },
      },
      {
        path: "update-password",
        component: UpdatePasswordComponent,
        canActivate: [AuthGuard],
        data: { titleId: "updatePassword" },
      },
      {
        path: "remove-password",
        component: RemovePasswordComponent,
        canActivate: [AuthGuard],
        data: { titleId: "removeMasterPassword" },
      },
    ],
  },
  {
    path: "",
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "vault",
        loadChildren: async () =>
          (await import("./modules/vault/modules/individual-vault/individual-vault.module"))
            .IndividualVaultModule,
      },
      { path: "sends", component: SendComponent, data: { title: "Send" } },
      {
        path: "create-organization",
        component: CreateOrganizationComponent,
        data: { titleId: "newOrganization" },
      },
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
            path: "security",
            loadChildren: async () =>
              (await import("./settings/security-routing.module")).SecurityRoutingModule,
          },
          {
            path: "domain-rules",
            component: DomainRulesComponent,
            data: { titleId: "domainRules" },
          },
          {
            path: "subscription",
            loadChildren: async () =>
              (await import("./settings/subscription-routing.module")).SubscriptionRoutingModule,
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
        canActivate: [AuthGuard],
        children: [
          { path: "", pathMatch: "full", redirectTo: "generator" },
          { path: "import", component: ImportComponent, data: { titleId: "importData" } },
          { path: "export", component: ExportComponent, data: { titleId: "exportVault" } },
          {
            path: "generator",
            component: GeneratorComponent,
            data: { titleId: "generator" },
          },
        ],
      },
      {
        path: "reports",
        loadChildren: async () =>
          (await import("./reports/reports-routing.module")).ReportsRoutingModule,
      },
      { path: "setup/families-for-enterprise", component: FamiliesForEnterpriseSetupComponent },
    ],
  },
  {
    path: "organizations",
    loadChildren: () =>
      import("./organizations/organization-routing.module").then(
        (m) => m.OrganizationsRoutingModule
      ),
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
