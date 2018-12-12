import {
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { CipherView } from 'jslib/models/view/cipherView';

import { ModalComponent } from '../modal.component';
import { AddEditComponent } from '../vault/add-edit.component';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

export class CipherReportComponent {
    @ViewChild('cipherAddEdit', { read: ViewContainerRef }) cipherAddEditModalRef: ViewContainerRef;

    loading = false;
    hasLoaded = false;
    ciphers: CipherView[] = [];

    private modal: ModalComponent = null;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, protected userService: UserService,
        protected messagingService: MessagingService, public requiresPremium: boolean) { }

    async load() {
        this.loading = true;
        await this.setCiphers();
        this.loading = false;
        this.hasLoaded = true;
    }

    selectCipher(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.cipherAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AddEditComponent>(
            AddEditComponent, this.cipherAddEditModalRef);

        childComponent.cipherId = cipher == null ? null : cipher.id;
        childComponent.onSavedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });
        childComponent.onDeletedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
    }

    protected async checkPremium(): Promise<boolean> {
        const accessPremium = await this.userService.canAccessPremium();
        if (this.requiresPremium && !accessPremium) {
            this.messagingService.send('premiumRequired');
            this.loading = false;
            return false;
        }
        return true;
    }

    protected async setCiphers() {
        this.ciphers = [];
    }
}
