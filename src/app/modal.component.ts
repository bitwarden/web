import * as jq from 'jquery';

import { Component, ComponentFactoryResolver, Type, ViewContainerRef } from '@angular/core';

import { ModalComponent as BaseModalComponent } from 'jslib/angular/components/modal.component';
import { Utils } from 'jslib/misc/utils';

import { MessagingService } from 'jslib/abstractions/messaging.service';

@Component({
    selector: 'app-modal',
    template: `<ng-template #container></ng-template>`,
})
export class ModalComponent extends BaseModalComponent {
    el: any = null;

    constructor(
        componentFactoryResolver: ComponentFactoryResolver,
        messagingService: MessagingService
    ) {
        super(componentFactoryResolver, messagingService);
    }

    ngOnDestroy() {
        /* Nothing */
    }

    show<T>(
        type: Type<T>,
        parentContainer: ViewContainerRef,
        fade = true,
        setComponentParameters: (component: T) => void = null
    ): T {
        this.parentContainer = parentContainer;
        this.fade = fade;

        const factory = this.componentFactoryResolver.resolveComponentFactory<T>(type);
        const componentRef = this.container.createComponent<T>(factory);
        if (setComponentParameters != null) {
            setComponentParameters(componentRef.instance);
        }

        const modals = Array.from(document.querySelectorAll('.modal'));
        if (modals.length > 0) {
            this.el = jq(modals[0]);
            this.el.modal('show');

            this.el.on('show.bs.modal', () => {
                this.onShow.emit();
                this.messagingService.send('modalShow');
            });
            this.el.on('shown.bs.modal', () => {
                this.onShown.emit();
                this.messagingService.send('modalShown');
                if (!Utils.isMobileBrowser) {
                    this.el.find('*[appAutoFocus]').focus();
                }
            });
            this.el.on('hide.bs.modal', () => {
                this.onClose.emit();
                this.messagingService.send('modalClose');
            });
            this.el.on('hidden.bs.modal', () => {
                this.onClosed.emit();
                this.messagingService.send('modalClosed');
                if (this.parentContainer != null) {
                    this.parentContainer.clear();
                }
            });
        }

        return componentRef.instance;
    }

    close() {
        if (this.el != null) {
            this.el.modal('hide');
        }
    }
}
