import { ComponentFactoryResolver, Directive, ViewChild, ViewContainerRef } from '@angular/core';

import { CipherView } from 'jslib/models/view/cipherView';

import { Organization } from 'jslib/models/domain/organization';

import { ModalComponent } from '../modal.component';
import { AddEditComponent as OrgAddEditComponent } from '../organizations/vault/add-edit.component';
import { AddEditComponent } from '../vault/add-edit.component';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

@Directive()
export class CipherReportComponent {
    @ViewChild('cipherAddEdit', { read: ViewContainerRef, static: true })
    cipherAddEditModalRef: ViewContainerRef;

    loading = false;
    hasLoaded = false;
    ciphers: CipherView[] = [];
    organization: Organization;

    private modal: ModalComponent = null;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        protected userService: UserService,
        protected messagingService: MessagingService,
        public requiresPaid: boolean
    ) {}

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
        let childComponent: OrgAddEditComponent | AddEditComponent;
        if (this.organization != null) {
            childComponent = this.modal.show<OrgAddEditComponent>(
                OrgAddEditComponent,
                this.cipherAddEditModalRef
            );
            (childComponent as OrgAddEditComponent).organization = this.organization;
        } else {
            childComponent = this.modal.show<AddEditComponent>(
                AddEditComponent,
                this.cipherAddEditModalRef
            );
        }

        childComponent.cipherId = cipher == null ? null : cipher.id;
        if (this.organization != null) {
            childComponent.organizationId = this.organization.id;
        }
        childComponent.onSavedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });
        childComponent.onDeletedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });
        childComponent.onRestoredCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
    }

    protected async checkAccess(): Promise<boolean> {
        if (this.organization != null) {
            // TODO: Maybe we want to just make sure they are not on a free plan? Just compare useTotp for now
            // since all paid plans include useTotp
            if (this.requiresPaid && !this.organization.useTotp) {
                this.messagingService.send('upgradeOrganization', {
                    organizationId: this.organization.id,
                });
                return false;
            }
        } else {
            const accessPremium = await this.userService.canAccessPremium();
            if (this.requiresPaid && !accessPremium) {
                this.messagingService.send('premiumRequired');
                this.loading = false;
                return false;
            }
        }
        return true;
    }

    protected async setCiphers() {
        this.ciphers = [];
    }
}
