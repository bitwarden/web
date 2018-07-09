import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import {
    PasswordGeneratorComponent as BasePasswordGeneratorComponent,
} from 'jslib/angular/components/password-generator.component';

import { ModalComponent } from '../modal.component';
import { PasswordGeneratorHistoryComponent } from './password-generator-history.component';

@Component({
    selector: 'app-password-generator',
    templateUrl: 'password-generator.component.html',
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
    @ViewChild('historyTemplate', { read: ViewContainerRef }) historyModalRef: ViewContainerRef;

    private modal: ModalComponent = null;

    constructor(passwordGenerationService: PasswordGenerationService, analytics: Angulartics2,
        platformUtilsService: PlatformUtilsService, i18nService: I18nService,
        toasterService: ToasterService, private componentFactoryResolver: ComponentFactoryResolver) {
        super(passwordGenerationService, analytics, platformUtilsService, i18nService, toasterService, window);
    }

    history() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.historyModalRef.createComponent(factory).instance;
        this.modal.show<PasswordGeneratorHistoryComponent>(PasswordGeneratorHistoryComponent, this.historyModalRef);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }
}
