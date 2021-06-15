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

import { AvatarComponent } from './components/avatar.component';

import { A11yTitleDirective } from 'jslib-angular/directives/a11y-title.directive';
import { ApiActionDirective } from 'jslib-angular/directives/api-action.directive';
import { StopClickDirective } from 'jslib-angular/directives/stop-click.directive';
import { StopPropDirective } from 'jslib-angular/directives/stop-prop.directive';

import { CalloutComponent } from 'jslib-angular/components/callout.component';

import { I18nPipe } from 'jslib-angular/pipes/i18n.pipe';
import { SearchPipe } from 'jslib-angular/pipes/search.pipe';

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
        StopClickDirective,
        StopPropDirective,
        I18nPipe,
        SearchPipe,
        AvatarComponent,
        CalloutComponent,
        ModalComponent,
        NavbarComponent,
        FooterComponent,
    ],
    entryComponents: [
        ModalComponent,
    ],
    providers: [DatePipe, SearchPipe],
    exports: [
        A11yTitleDirective,
        AvatarComponent,
        CalloutComponent,
        ApiActionDirective,
        StopClickDirective,
        StopPropDirective,
        I18nPipe,
        SearchPipe,
        ModalComponent,
        NavbarComponent,
        FooterComponent,
    ],
})
export class BitwardenCommonModule { }
