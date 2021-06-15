import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientsComponent } from './clients.component';
import { PeopleComponent } from './manage/people.component';
import { ProvidersLayoutComponent } from './providers-layout.component';
import { SetupComponent } from './setup.component';


const routes: Routes = [
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProvidersRoutingModule { }
