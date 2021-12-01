import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OssModule } from 'src/app/oss.module';

import { SsoComponent } from './manage/sso.component';
import { SsoOpenIdComponent } from './manage/ssoOpenId.component';
import { SsoSamlComponent } from './manage/ssoSaml.component';
import { OrganizationsRoutingModule } from './organizations-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        OssModule,
        OrganizationsRoutingModule,
    ],
    declarations: [
        SsoComponent,
        SsoOpenIdComponent,
        SsoSamlComponent,
    ],
})
export class OrganizationsModule {}
