import { NgModule } from '@angular/core';
import {
    RouterModule,
    Routes,
} from '@angular/router';

import { FrontendLayoutComponent } from './layouts/frontend-layout.component';
import { OrganizationLayoutComponent } from './layouts/organization-layout.component';
import { UserLayoutComponent } from './layouts/user-layout.component';

import { HintComponent } from './accounts/hint.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RegisterComponent } from './accounts/register.component';
import { TwoFactorComponent } from './accounts/two-factor.component';

import { ExportComponent as OrgExportComponent } from './organizations/tools/export.component';
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
            { path: 'register', component: RegisterComponent, canActivate: [UnauthGuardService] },
            { path: 'hint', component: HintComponent, canActivate: [UnauthGuardService] },
            { path: 'lock', component: LockComponent },
        ],
    },
    {
        path: '',
        component: UserLayoutComponent,
        canActivate: [AuthGuardService],
        children: [
            { path: 'vault', component: VaultComponent },
            {
                path: 'settings',
                component: SettingsComponent,
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'account' },
                    { path: 'account', component: AccountComponent },
                    { path: 'options', component: OptionsComponent },
                    { path: 'domain-rules', component: DomainRulesComponent },
                    { path: 'two-factor', component: TwoFactorSetupComponent },
                    { path: 'premium', component: PremiumComponent },
                    { path: 'billing', component: UserBillingComponent },
                    { path: 'organizations', component: OrganizationsComponent },
                    { path: 'create-organization', component: CreateOrganizationComponent },
                ],
            },
            {
                path: 'tools',
                component: ToolsComponent,
                canActivate: [AuthGuardService],
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'generator' },
                    { path: 'import', component: ImportComponent },
                    { path: 'export', component: ExportComponent },
                    { path: 'generator', component: PasswordGeneratorComponent },
                    { path: 'breach-report', component: BreachReportComponent },
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
            { path: 'vault', component: OrgVaultComponent },
            {
                path: 'tools',
                component: OrgToolsComponent,
                canActivate: [OrganizationTypeGuardService],
                data: { allowedTypes: [OrganizationUserType.Owner, OrganizationUserType.Admin] },
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'export' },
                    // { path: 'import', component: ImportComponent },
                    { path: 'export', component: OrgExportComponent },
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
