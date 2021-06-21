import {
    ApplicationRef,
    ComponentFactoryResolver,
    Injectable,
    Injector,
    Type,
} from '@angular/core';
import * as jq from 'jquery';
import { first } from 'rxjs/operators';

import { MessagingService } from 'jslib-common/abstractions/messaging.service';

import { ModalConfig, ModalService as BaseModalService } from 'jslib-angular/services/modal.service';

import { Utils } from 'jslib-common/misc/utils';

@Injectable()
export class ModalService extends BaseModalService {

    el: any = null;
    modalOpen: boolean = false;

    constructor(componentFactoryResolver: ComponentFactoryResolver, applicationRef: ApplicationRef,
        injector: Injector, private messagingService: MessagingService) {
        super(componentFactoryResolver, applicationRef, injector);
    }

    open(componentType: Type<any>, config: ModalConfig) {
        if (this.modalOpen) {
            return;
        }
        this.modalOpen = true;

        const modalRef = this.appendModalComponentToBody(config);

        this.dialogComponentRef.instance.childComponentType = componentType;

        modalRef.onCreated.pipe(first()).subscribe(() => {
            const modals = Array.from(document.querySelectorAll('.modal'));
            if (modals.length > 0) {
                this.el = jq(modals[0]);
                this.el.modal('show');

                this.el.on('show.bs.modal', () => {
                    modalRef.show();
                    this.messagingService.send('modalShow');
                });
                this.el.on('shown.bs.modal', () => {
                    modalRef.shown();
                    this.messagingService.send('modalShown');
                    if (!Utils.isMobileBrowser) {
                        this.el.find('*[appAutoFocus]').focus();
                    }
                });
                this.el.on('hide.bs.modal', () => {
                    this.messagingService.send('modalClose');
                });
                this.el.on('hidden.bs.modal', () => {
                    modalRef.closed();
                    this.messagingService.send('modalClosed');
                });
            }
        });

        modalRef.onClose.pipe(first()).subscribe(() => {
            if (this.el != null) {
                this.el.modal('hide');
            }
        });

        modalRef.onClosed.pipe(first()).subscribe(() => {
            this.modalOpen = false;
        });

        return modalRef;
    }
}
