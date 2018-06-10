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

import { ExportComponent } from './tools/export.component';
import { ImportComponent } from './tools/import.component';
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
                path: 'tools',
                component: ToolsComponent,
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'import' },
                    { path: 'import', component: ImportComponent, canActivate: [AuthGuardService] },
                    { path: 'export', component: ExportComponent, canActivate: [AuthGuardService] },
                ],
            },
        ],
    },
    {
        path: 'organization/:organizationId',
        component: OrganizationLayoutComponent,
        children: [
            { path: 'vault', component: VaultComponent, canActivate: [AuthGuardService] },
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
