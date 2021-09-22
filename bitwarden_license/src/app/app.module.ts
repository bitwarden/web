import { ToasterModule } from 'angular2-toaster';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DisablePersonalVaultExportPolicyComponent } from './policies/disable-personal-vault-export.component';
import { MaximumVaultTimeoutPolicyComponent } from './policies/maximum-vault-timeout.component';

import { OssRoutingModule } from 'src/app/oss-routing.module';
import { OssModule } from 'src/app/oss.module';
import { ServicesModule } from 'src/app/services/services.module';


@NgModule({
    imports: [
        OssModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        ServicesModule,
        ToasterModule.forRoot(),
        InfiniteScrollModule,
        DragDropModule,
        AppRoutingModule,
        OssRoutingModule,
        RouterModule,
    ],
    declarations: [
        AppComponent,
        MaximumVaultTimeoutPolicyComponent,
        DisablePersonalVaultExportPolicyComponent,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
