import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProvidersRoutingModule { }
