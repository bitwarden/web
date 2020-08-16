import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { PasswordGeneratorComponent as BasePasswordGeneratorComponent } from 'jslib/angular/components/password-generator.component';

import { ModalComponent } from '../modal.component';
import { PasswordGeneratorHistoryComponent } from './password-generator-history.component';

@Component({
    selector: 'app-password-generator',
    templateUrl: 'password-generator.component.html',
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
    @ViewChild('historyTemplate', { read: ViewContainerRef, static: true })
    historyModalRef: ViewContainerRef;

    private modal: ModalComponent = null;

    constructor(
        passwordGenerationService: PasswordGenerationService,
        platformUtilsService: PlatformUtilsService,
        i18nService: I18nService,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {
        super(passwordGenerationService, platformUtilsService, i18nService, window);
    }

    history() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.historyModalRef.createComponent(factory).instance;
        this.modal.show<PasswordGeneratorHistoryComponent>(
            PasswordGeneratorHistoryComponent,
            this.historyModalRef
        );

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    lengthChanged() {
        document.getElementById('length').focus();
    }

    minNumberChanged() {
        document.getElementById('min-number').focus();
    }

    minSpecialChanged() {
        document.getElementById('min-special').focus();
    }
}
