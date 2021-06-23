import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'jslib-angular/services/auth-guard.service';

import { AddOrganizationComponent } from './clients/add-organization.component';
import { ClientsComponent } from './clients/clients.component';
import { CreateOrganizationComponent } from './clients/create-organization.component';
import { AcceptProviderComponent } from './manage/accept-provider.component';
import { PeopleComponent } from './manage/people.component';
import { ProvidersLayoutComponent } from './providers-layout.component';
import { SettingsComponent } from './settings/settings.component';
import { SetupProviderComponent } from './setup/setup-provider.component';
import { SetupComponent } from './setup/setup.component';

import { FrontendLayoutComponent } from 'src/app/layouts/frontend-layout.component';

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
                    { path: 'clients/create', component: CreateOrganizationComponent },
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
                        path: 'add/:organizationId',
                        component: AddOrganizationComponent,
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
