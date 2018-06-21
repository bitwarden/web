import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { ModalComponent } from '../modal.component';
import { DeauthorizeSessionsComponent } from './deauthorize-sessions.component';

@Component({
    selector: 'app-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent {
    @ViewChild('deauthorizeSessionsTemplate', { read: ViewContainerRef }) deauthModalRef: ViewContainerRef;

    private modal: ModalComponent = null;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    deauthorizeSessions() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.deauthModalRef.createComponent(factory).instance;
        this.modal.show<DeauthorizeSessionsComponent>(DeauthorizeSessionsComponent, this.deauthModalRef);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    purgeVault() {

    }

    deleteAccount() {

    }
}
