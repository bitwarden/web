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

import { UnauthGuardService } from './services/unauth-guard.service';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';

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
        children: [
            { path: 'vault', component: VaultComponent, canActivate: [AuthGuardService] },
            {
                path: 'settings',
                component: SettingsComponent,
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'account' },
                    { path: 'account', component: AccountComponent, canActivate: [AuthGuardService] },
                    { path: 'options', component: OptionsComponent, canActivate: [AuthGuardService] },
                    { path: 'domain-rules', component: DomainRulesComponent, canActivate: [AuthGuardService] },
                    { path: 'two-factor', component: TwoFactorSetupComponent, canActivate: [AuthGuardService] },
                    { path: 'premium', component: PremiumComponent, canActivate: [AuthGuardService] },
                    { path: 'billing', component: UserBillingComponent, canActivate: [AuthGuardService] },
                    { path: 'organizations', component: OrganizationsComponent, canActivate: [AuthGuardService] },
                    {
                        path: 'create-organization',
                        component: CreateOrganizationComponent,
                        canActivate: [AuthGuardService],
                    },
                ],
            },
            {
                path: 'tools',
                component: ToolsComponent,
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'generator' },
                    { path: 'import', component: ImportComponent, canActivate: [AuthGuardService] },
                    { path: 'export', component: ExportComponent, canActivate: [AuthGuardService] },
                    { path: 'generator', component: PasswordGeneratorComponent, canActivate: [AuthGuardService] },
                    { path: 'breach-report', component: BreachReportComponent, canActivate: [AuthGuardService] },
                ],
            },
        ],
    },
    {
        path: 'organizations/:organizationId',
        component: OrganizationLayoutComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'vault' },
            { path: 'vault', component: OrgVaultComponent, canActivate: [AuthGuardService] },
            {
                path: 'tools',
                component: OrgToolsComponent,
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'export' },
                    // { path: 'import', component: ImportComponent, canActivate: [AuthGuardService] },
                    { path: 'export', component: OrgExportComponent, canActivate: [AuthGuardService] },
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
