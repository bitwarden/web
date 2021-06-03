import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BitwardenCommonModule } from '../common.module';
import { ProvidersLayoutComponent } from './providers-layout.component';
import { ProvidersRoutingModule } from './providers-routing.module';
import { SetupComponent } from './setup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BitwardenCommonModule,
    ProvidersRoutingModule,
  ],
  declarations: [
    ProvidersLayoutComponent,
    SetupComponent,
  ],
})
export class ProvidersModule { }