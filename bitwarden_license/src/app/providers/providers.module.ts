import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProvidersLayoutComponent } from './providers-layout.component';
import { ProvidersRoutingModule } from './providers-routing.module';
import { SetupComponent } from './setup.component';

import { BulkConfirmComponent } from './manage/bulk/bulk-confirm.component';
import { BulkRemoveComponent } from './manage/bulk/bulk-remove.component';
import { BulkStatusComponent } from './manage/bulk/bulk-status.component';
import { PeopleComponent } from './manage/people.component';
import { UserAddEditComponent } from './manage/user-add-edit.component';
import { ClientsComponent } from './clients.component';

import { OssModule } from 'src/app/oss.module';
import { SetupProviderComponent } from './setup-provider.component';
import { AcceptProviderComponent } from './accept-provider.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        OssModule,
        ProvidersRoutingModule,
    ],
    declarations: [
        ClientsComponent,
        ProvidersLayoutComponent,
        PeopleComponent,
        UserAddEditComponent,
        SetupComponent,
        BulkConfirmComponent,
        BulkRemoveComponent,
        BulkStatusComponent,
        SetupProviderComponent,
        AcceptProviderComponent,
        SettingsComponent,
    ],
})
export class ProvidersModule {}
