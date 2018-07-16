import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';

import { FrontendLayoutComponent } from './layouts/frontend-layout.component';
import { OrganizationLayoutComponent } from './layouts/organization-layout.component';
import { UserLayoutComponent } from './layouts/user-layout.component';

import { AcceptOrganizationComponent } from './accounts/accept-organization.component';
import { HintComponent } from './accounts/hint.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RecoverDeleteComponent } from './accounts/recover-delete.component';
import { RecoverTwoFactorComponent } from './accounts/recover-two-factor.component';
import { RegisterComponent } from './accounts/register.component';
import { TwoFactorComponent } from './accounts/two-factor.component';
import { VerifyEmailTokenComponent } from './accounts/verify-email-token.component';
import { VerifyRecoverDeleteComponent } from './accounts/verify-recover-delete.component';

import { CollectionsComponent as OrgManageCollectionsComponent } from './organizations/manage/collections.component';
import { EventsComponent as OrgEventsComponent } from './organizations/manage/events.component';
import { GroupsComponent as OrgGroupsComponent } from './organizations/manage/groups.component';
import { ManageComponent as OrgManageComponent } from './organizations/manage/manage.component';
import { PeopleComponent as OrgPeopleComponent } from './organizations/manage/people.component';

import { AccountComponent as OrgAccountComponent } from './organizations/settings/account.component';
import { SettingsComponent as OrgSettingsComponent } from './organizations/settings/settings.component';

import { ExportComponent as OrgExportComponent } from './organizations/tools/export.component';
import { ImportComponent as OrgImportComponent } from './organizations/tools/import.component';
import { ToolsComponent as OrgToolsComponent } from './organizations/tools/tools.component';

import { VaultComponent as OrgVaultComponent } from './organizations/vault/vault.component';

import { AccountComponent } from './settings/account.component';
import { CreateOrganizationComponent } from './settings/create-organization.component';
import { DomainRulesComponent } from './settings/domain-rules.component';
import { OptionsComponent } from './settings/options.component';
import { OrganizationsComponent } from './settings/organizations.component';
import { PremiumComponent } from './settings/premium.component';
import { SettingsComponent } from './settings/settings.component';
import { TwoFactorSetupComponent } from './settings/two-factor-setup.component';
import { UserBillingComponent } from './settings/user-billing.component';

import { BreachReportComponent } from './tools/breach-report.component';
import { ExportComponent } from './tools/export.component';
import { ImportComponent } from './tools/import.component';
import { PasswordGeneratorComponent } from './tools/password-generator.component';
import { ToolsComponent } from './tools/tools.component';

import { VaultComponent } from './vault/vault.component';

import { OrganizationGuardService } from './services/organization-guard.service';
import { OrganizationTypeGuardService } from './services/organization-type-guard.service';
import { UnauthGuardService } from './services/unauth-guard.service';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';

import { OrganizationUserType } from 'jslib/enums/organizationUserType';

const routes: Routes = [
    {
        path: '',
        component: FrontendLayoutComponent,
        children: [
            { path: '', pathMatch: 'full', component: LoginComponent, canActivate: [UnauthGuardService] },
            { path: '2fa', component: TwoFactorComponent, canActivate: [UnauthGuardService] },
            {
                path: 'register', component: RegisterComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'createAccount' },
            },
            {
                path: 'hint', component: HintComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'passwordHint' },
            },
            { path: 'lock', component: LockComponent },
            { path: 'verify-email', component: VerifyEmailTokenComponent },
            {
                path: 'accept-organization',
                component: AcceptOrganizationComponent,
                data: { titleId: 'joinOrganization' },
            },
            { path: 'recover', pathMatch: 'full', redirectTo: 'recover-2fa' },
            {
                path: 'recover-2fa',
                component: RecoverTwoFactorComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'recoverAccountTwoStep' },
            },
            {
                path: 'recover-delete',
                component: RecoverDeleteComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'deleteAccount' },
            },
            {
                path: 'verify-recover-delete',
                component: VerifyRecoverDeleteComponent,
                canActivate: [UnauthGuardService],
                data: { titleId: 'deleteAccount' },
            },
        ],
    },
    {
        path: '',
        component: UserLayoutComponent,
        canActivate: [AuthGuardService],
        children: [
            { path: 'vault', component: VaultComponent, data: { titleId: 'myVault' } },
            {
                path: 'settings',
                component: SettingsComponent,
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'account' },
                    { path: 'account', component: AccountComponent, data: { titleId: 'myAccount' } },
                    { path: 'options', component: OptionsComponent, data: { titleId: 'options' } },
                    { path: 'domain-rules', component: DomainRulesComponent, data: { titleId: 'domainRules' } },
                    { path: 'two-factor', component: TwoFactorSetupComponent, data: { titleId: 'twoStepLogin' } },
                    { path: 'premium', component: PremiumComponent, data: { titleId: 'goPremium' } },
                    { path: 'billing', component: UserBillingComponent, data: { titleId: 'billingAndLicensing' } },
                    { path: 'organizations', component: OrganizationsComponent, data: { titleId: 'organizations' } },
                    {
                        path: 'create-organization',
                        component: CreateOrganizationComponent,
                        data: { titleId: 'newOrganization' },
                    },
                ],
            },
            {
                path: 'tools',
                component: ToolsComponent,
                canActivate: [AuthGuardService],
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'generator' },
                    { path: 'import', component: ImportComponent, data: { titleId: 'importData' } },
                    { path: 'export', component: ExportComponent, data: { titleId: 'exportVault' } },
                    {
                        path: 'generator',
                        component: PasswordGeneratorComponent,
                        data: { titleId: 'passwordGenerator' },
                    },
                    { path: 'breach-report', component: BreachReportComponent, data: { titleId: 'dataBreachReport' } },
                ],
            },
        ],
    },
    {
        path: 'organizations/:organizationId',
        component: OrganizationLayoutComponent,
        canActivate: [AuthGuardService, OrganizationGuardService],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'vault' },
            { path: 'vault', component: OrgVaultComponent, data: { titleId: 'vault' } },
            {
                path: 'tools',
                component: OrgToolsComponent,
                canActivate: [OrganizationTypeGuardService],
                data: { allowedTypes: [OrganizationUserType.Owner, OrganizationUserType.Admin] },
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'import' },
                    { path: 'import', component: OrgImportComponent, data: { titleId: 'importData' } },
                    { path: 'export', component: OrgExportComponent, data: { titleId: 'exportVault' } },
                ],
            },
            {
                path: 'manage',
                component: OrgManageComponent,
                canActivate: [OrganizationTypeGuardService],
                data: { allowedTypes: [OrganizationUserType.Owner, OrganizationUserType.Admin] },
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'people' },
                    { path: 'collections', component: OrgManageCollectionsComponent, data: { titleId: 'collections' } },
                    { path: 'events', component: OrgEventsComponent, data: { titleId: 'eventLogs' } },
                    { path: 'groups', component: OrgGroupsComponent, data: { titleId: 'groups' } },
                    { path: 'people', component: OrgPeopleComponent, data: { titleId: 'people' } },
                ],
            },
            {
                path: 'settings',
                component: OrgSettingsComponent,
                canActivate: [OrganizationTypeGuardService],
                data: { allowedTypes: [OrganizationUserType.Owner, OrganizationUserType.Admin] },
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'account' },
                    { path: 'account', component: OrgAccountComponent, data: { titleId: 'myOrganization' } },
                ],
            },
        ],
    },
    { path: '**', redirectTo: '' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        /*enableTracing: true,*/
    })],
    exports: [RouterModule],
})
export class AppRoutingModule { }
