import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProviderService } from './provider.service';

import { ProvidersLayoutComponent } from './providers-layout.component';
import { ProvidersRoutingModule } from './providers-routing.module';

import { AddOrganizationComponent } from './clients/add-organization.component';
import { ClientsComponent } from './clients/clients.component';
import { CreateOrganizationComponent } from './clients/create-organization.component';

import { AcceptProviderComponent } from './manage/accept-provider.component';
import { BulkConfirmComponent } from './manage/bulk/bulk-confirm.component';
import { BulkRemoveComponent } from './manage/bulk/bulk-remove.component';
import { BulkStatusComponent } from './manage/bulk/bulk-status.component';
import { PeopleComponent } from './manage/people.component';
import { UserAddEditComponent } from './manage/user-add-edit.component';

import { SettingsComponent } from './settings/settings.component';

import { SetupProviderComponent } from './setup/setup-provider.component';
import { SetupComponent } from './setup/setup.component';

import { OssModule } from 'src/app/oss.module';

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
        AddOrganizationComponent,
        CreateOrganizationComponent,
    ],
    providers: [
        ProviderService,
    ],
})
export class ProvidersModule {}
