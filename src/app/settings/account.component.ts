import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';

import { ModalComponent } from '../modal.component';
import { DeauthorizeSessionsComponent } from './deauthorize-sessions.component';
import { DeleteAccountComponent } from './delete-account.component';
import { PurgeVaultComponent } from './purge-vault.component';

@Component({
    selector: 'app-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent {
    @ViewChild('deauthorizeSessionsTemplate', {
        read: ViewContainerRef,
        static: true,
    })
    deauthModalRef: ViewContainerRef;
    @ViewChild('purgeVaultTemplate', { read: ViewContainerRef, static: true })
    purgeModalRef: ViewContainerRef;
    @ViewChild('deleteAccountTemplate', {
        read: ViewContainerRef,
        static: true,
    })
    deleteModalRef: ViewContainerRef;

    private modal: ModalComponent = null;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    deauthorizeSessions() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.deauthModalRef.createComponent(factory).instance;
        this.modal.show<DeauthorizeSessionsComponent>(
            DeauthorizeSessionsComponent,
            this.deauthModalRef
        );

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    purgeVault() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.purgeModalRef.createComponent(factory).instance;
        this.modal.show<PurgeVaultComponent>(PurgeVaultComponent, this.purgeModalRef);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    deleteAccount() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.deleteModalRef.createComponent(factory).instance;
        this.modal.show<DeleteAccountComponent>(DeleteAccountComponent, this.deleteModalRef);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }
}
