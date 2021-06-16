import { ToasterModule } from 'angular2-toaster';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from '../../../src/app/app-routing.module';
import { AppComponent } from '../../../src/app/app.component';
import { OssModule } from '../../../src/app/oss.module';
import { ServicesModule } from '../../../src/app/services/services.module';

@NgModule({
    imports: [
        OssModule,
        BrowserAnimationsModule,
        FormsModule,
        ServicesModule,
        ToasterModule.forRoot(),
        InfiniteScrollModule,
        DragDropModule,
        AppRoutingModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
