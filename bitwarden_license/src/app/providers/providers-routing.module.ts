import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'jslib-angular/services/auth-guard.service';

import { ClientsComponent } from './clients.component';
import { PeopleComponent } from './manage/people.component';
import { ProvidersLayoutComponent } from './providers-layout.component';
import { SetupComponent } from './setup.component';
import { SetupProviderComponent } from './setup-provider.component';
import { AcceptProviderComponent } from './accept-provider.component';
import { SettingsComponent } from './settings/settings.component';

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
                    { path: 'clients', component: ClientsComponent, data: { titleId: 'clients' } },
                    {
                        path: 'manage',
                        component: PeopleComponent,
                    },
                    {
                        path: 'settings',
                        component: SettingsComponent,
                    }
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
