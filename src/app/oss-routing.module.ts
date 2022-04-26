import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuardService } from "jslib-angular/services/auth-guard.service";
import { LockGuardService } from "jslib-angular/services/lock-guard.service";
import { UnauthGuardService } from "jslib-angular/services/unauth-guard.service";
import { Permissions } from "jslib-common/enums/permissions";

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
import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { UserLayoutComponent } from "./layouts/user-layout.component";
import { CollectionsComponent as OrgManageCollectionsComponent } from "./organizations/manage/collections.component";
import { EventsComponent as OrgEventsComponent } from "./organizations/manage/events.component";
import { GroupsComponent as OrgGroupsComponent } from "./organizations/manage/groups.component";
import { ManageComponent as OrgManageComponent } from "./organizations/manage/manage.component";
import { PeopleComponent as OrgPeopleComponent } from "./organizations/manage/people.component";
import { PoliciesComponent as OrgPoliciesComponent } from "./organizations/manage/policies.component";
import { AccountComponent as OrgAccountComponent } from "./organizations/settings/account.component";
import { OrganizationBillingComponent } from "./organizations/settings/organization-billing.component";
import { OrganizationSubscriptionComponent } from "./organizations/settings/organization-subscription.component";
import { SettingsComponent as OrgSettingsComponent } from "./organizations/settings/settings.component";
import { TwoFactorSetupComponent as OrgTwoFactorSetupComponent } from "./organizations/settings/two-factor-setup.component";
import { AcceptFamilySponsorshipComponent } from "./organizations/sponsorships/accept-family-sponsorship.component";
import { FamiliesForEnterpriseSetupComponent } from "./organizations/sponsorships/families-for-enterprise-setup.component";
import { ExportComponent as OrgExportComponent } from "./organizations/tools/export.component";
import { ExposedPasswordsReportComponent as OrgExposedPasswordsReportComponent } from "./organizations/tools/exposed-passwords-report.component";
import { ImportComponent as OrgImportComponent } from "./organizations/tools/import.component";
import { InactiveTwoFactorReportComponent as OrgInactiveTwoFactorReportComponent } from "./organizations/tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent as OrgReusedPasswordsReportComponent } from "./organizations/tools/reused-passwords-report.component";
import { ToolsComponent as OrgToolsComponent } from "./organizations/tools/tools.component";
import { UnsecuredWebsitesReportComponent as OrgUnsecuredWebsitesReportComponent } from "./organizations/tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent as OrgWeakPasswordsReportComponent } from "./organizations/tools/weak-passwords-report.component";
import { VaultComponent as OrgVaultComponent } from "./organizations/vault/vault.component";
import { AccessComponent } from "./send/access.component";
import { SendComponent } from "./send/send.component";
import { OrganizationGuardService } from "./services/organization-guard.service";
import { OrganizationTypeGuardService } from "./services/organization-type-guard.service";
import { AccountComponent } from "./settings/account.component";
import { CreateOrganizationComponent } from "./settings/create-organization.component";
import { DomainRulesComponent } from "./settings/domain-rules.component";
import { EmergencyAccessViewComponent } from "./settings/emergency-access-view.component";
import { EmergencyAccessComponent } from "./settings/emergency-access.component";
import { OptionsComponent } from "./settings/options.component";
import { OrganizationsComponent } from "./settings/organizations.component";
import { PremiumComponent } from "./settings/premium.component";
import { SettingsComponent } from "./settings/settings.component";
import { SponsoredFamiliesComponent } from "./settings/sponsored-families.component";
import { TwoFactorSetupComponent } from "./settings/two-factor-setup.component";
import { UserBillingComponent } from "./settings/user-billing.component";
import { UserSubscriptionComponent } from "./settings/user-subscription.component";
import { ExportComponent } from "./tools/export.component";
import { GeneratorComponent } from "./tools/generator.component";
import { ImportComponent } from "./tools/import.component";
import { ToolsComponent } from "./tools/tools.component";
import { VaultComponent } from "./vault/vault.component";

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
      { path: "login", component: LoginComponent, canActivate: [UnauthGuardService] },
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
          { path: "options", component: OptionsComponent, data: { titleId: "options" } },
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
            component: GeneratorComponent,
            data: { titleId: "generator" },
          },
        ],
      },
      {
        path: "reports",
        loadChildren: async () => (await import("./reports/reports.module")).ReportsModule,
      },
      { path: "setup/families-for-enterprise", component: FamiliesForEnterpriseSetupComponent },
    ],
  },
  {
    path: "organizations/:organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuardService, OrganizationGuardService],
    children: [
      { path: "", pathMatch: "full", redirectTo: "vault" },
      { path: "vault", component: OrgVaultComponent, data: { titleId: "vault" } },
      {
        path: "tools",
        component: OrgToolsComponent,
        canActivate: [OrganizationTypeGuardService],
        data: { permissions: [Permissions.AccessImportExport, Permissions.AccessReports] },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "import",
          },
          {
            path: "import",
            component: OrgImportComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "importData",
              permissions: [Permissions.AccessImportExport],
            },
          },
          {
            path: "export",
            component: OrgExportComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "exportVault",
              permissions: [Permissions.AccessImportExport],
            },
          },
          {
            path: "exposed-passwords-report",
            component: OrgExposedPasswordsReportComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "exposedPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "inactive-two-factor-report",
            component: OrgInactiveTwoFactorReportComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "inactive2faReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "reused-passwords-report",
            component: OrgReusedPasswordsReportComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "reusedPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "unsecured-websites-report",
            component: OrgUnsecuredWebsitesReportComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "unsecuredWebsitesReport",
              permissions: [Permissions.AccessReports],
            },
          },
          {
            path: "weak-passwords-report",
            component: OrgWeakPasswordsReportComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "weakPasswordsReport",
              permissions: [Permissions.AccessReports],
            },
          },
        ],
      },
      {
        path: "manage",
        component: OrgManageComponent,
        canActivate: [OrganizationTypeGuardService],
        data: {
          permissions: [
            Permissions.CreateNewCollections,
            Permissions.EditAnyCollection,
            Permissions.DeleteAnyCollection,
            Permissions.EditAssignedCollections,
            Permissions.DeleteAssignedCollections,
            Permissions.AccessEventLogs,
            Permissions.ManageGroups,
            Permissions.ManageUsers,
            Permissions.ManagePolicies,
          ],
        },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "people",
          },
          {
            path: "collections",
            component: OrgManageCollectionsComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "collections",
              permissions: [
                Permissions.CreateNewCollections,
                Permissions.EditAnyCollection,
                Permissions.DeleteAnyCollection,
                Permissions.EditAssignedCollections,
                Permissions.DeleteAssignedCollections,
              ],
            },
          },
          {
            path: "events",
            component: OrgEventsComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "eventLogs",
              permissions: [Permissions.AccessEventLogs],
            },
          },
          {
            path: "groups",
            component: OrgGroupsComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "groups",
              permissions: [Permissions.ManageGroups],
            },
          },
          {
            path: "people",
            component: OrgPeopleComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "people",
              permissions: [Permissions.ManageUsers, Permissions.ManageUsersPassword],
            },
          },
          {
            path: "policies",
            component: OrgPoliciesComponent,
            canActivate: [OrganizationTypeGuardService],
            data: {
              titleId: "policies",
              permissions: [Permissions.ManagePolicies],
            },
          },
        ],
      },
      {
        path: "settings",
        component: OrgSettingsComponent,
        canActivate: [OrganizationTypeGuardService],
        data: { permissions: [Permissions.ManageOrganization] },
        children: [
          { path: "", pathMatch: "full", redirectTo: "account" },
          { path: "account", component: OrgAccountComponent, data: { titleId: "myOrganization" } },
          {
            path: "two-factor",
            component: OrgTwoFactorSetupComponent,
            data: { titleId: "twoStepLogin" },
          },
          {
            path: "billing",
            component: OrganizationBillingComponent,
            canActivate: [OrganizationTypeGuardService],
            data: { titleId: "billing", permissions: [Permissions.ManageBilling] },
          },
          {
            path: "subscription",
            component: OrganizationSubscriptionComponent,
            data: { titleId: "subscription" },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      paramsInheritanceStrategy: "always",
      /*enableTracing: true,*/
    }),
  ],
  exports: [RouterModule],
})
export class OssRoutingModule {}
