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

import { VaultComponent } from './vault/vault.component';

const routes: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: '', redirectTo: 'vault', pathMatch: 'full' },
            { path: 'vault', component: VaultComponent },
        ],
    },
    {
        path: '',
        component: FrontendLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: '2fa', component: TwoFactorComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'hint', component: HintComponent },
            { path: 'lock', component: LockComponent },
        ],
    },
    {
        path: 'organization/:organizationId',
        component: OrganizationLayoutComponent,
        children: [
            { path: 'vault', component: VaultComponent },
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
