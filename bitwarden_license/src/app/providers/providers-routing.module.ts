import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'jslib-angular/services/auth-guard.service';

import { AcceptProviderComponent } from './accept-provider.component';
import { ClientsComponent } from './clients.component';
import { PeopleComponent } from './manage/people.component';
import { ProvidersLayoutComponent } from './providers-layout.component';
import { SettingsComponent } from './settings/settings.component';
import { SetupProviderComponent } from './setup/setup-provider.component';
import { SetupComponent } from './setup/setup.component';

import { FrontendLayoutComponent } from 'src/app/layouts/frontend-layout.component';
import { OrganizationJoinProviderComponent } from './organization-join-provider.component';

const routes: Routes = [
    {
        path: '',
        component: FrontendLayoutComponent,
        children: [
            {
                path: 'setup-provider',
                component: SetupProviderComponent,
                data: { titleId: 'setupProvider' },
            },
            {
                path: 'accept-provider',
                component: AcceptProviderComponent,
                data: { titleId: 'acceptProvider' },
            },
        ],
    },
    {
        path: '',
        canActivate: [AuthGuardService],
        children: [
            {
                path: 'setup',
                component: SetupComponent,
            },
            {
                path: ':providerId',
                component: ProvidersLayoutComponent,
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'clients' },
                    { path: 'clients', component: ClientsComponent, data: { titleId: 'clients' } },
                    {
                        path: 'manage',
                        component: PeopleComponent,
                    },
                    {
                        path: 'settings',
                        component: SettingsComponent,
                    },
                    {
                        path: 'join/:organizationId',
                        component: OrganizationJoinProviderComponent,
                    },
                ],
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProvidersRoutingModule { }
