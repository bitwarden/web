import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToasterModule } from 'angular2-toaster';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { ServicesModule } from './services/services.module';

import { ModalComponent } from './modal.component';

import { FooterComponent } from './layouts/footer.component';
import { NavbarComponent } from './layouts/navbar.component';

import { A11yTitleDirective } from 'jslib-angular/directives/a11y-title.directive';
import { ApiActionDirective } from 'jslib-angular/directives/api-action.directive';
import { I18nPipe } from 'jslib-angular/pipes/i18n.pipe';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ServicesModule,
        InfiniteScrollModule,
        ToasterModule.forChild(),
        DragDropModule,
        RouterModule.forChild([]),
    ],
    declarations: [
        A11yTitleDirective,
        ApiActionDirective,
        I18nPipe,
        ModalComponent,
        NavbarComponent,
        FooterComponent,
    ],
    entryComponents: [
        ModalComponent,
    ],
    providers: [DatePipe],
    exports: [
        A11yTitleDirective,
        ApiActionDirective,
        I18nPipe,
        ModalComponent,
        NavbarComponent,
        FooterComponent,
    ],
})
export class BitwardenCommonModule { }
