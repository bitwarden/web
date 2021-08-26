import {
    Directive,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { CipherView } from 'jslib-common/models/view/cipherView';

import { Organization } from 'jslib-common/models/domain/organization';

import { AddEditComponent as OrgAddEditComponent } from '../organizations/vault/add-edit.component';
import { AddEditComponent } from '../vault/add-edit.component';

import { ModalService } from 'jslib-angular/services/modal.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { UserService } from 'jslib-common/abstractions/user.service';

@Directive()
export class CipherReportComponent {
    @ViewChild('cipherAddEdit', { read: ViewContainerRef, static: true }) cipherAddEditModalRef: ViewContainerRef;

    loading = false;
    hasLoaded = false;
    ciphers: CipherView[] = [];
    organization: Organization;

    constructor(private modalService: ModalService, protected userService: UserService,
        protected messagingService: MessagingService, public requiresPaid: boolean) { }

    async load() {
        this.loading = true;
        await this.setCiphers();
        this.loading = false;
        this.hasLoaded = true;
    }

    async selectCipher(cipher: CipherView) {
        const type = this.organization != null ? OrgAddEditComponent : AddEditComponent;

        const [modal, childComponent] = await this.modalService.openViewRef(type, this.cipherAddEditModalRef, (comp: OrgAddEditComponent | AddEditComponent) => {
            if (this.organization != null) {
                (comp as OrgAddEditComponent).organization = this.organization;
                comp.organizationId = this.organization.id;
            }

            comp.cipherId = cipher == null ? null : cipher.id;
            comp.onSavedCipher.subscribe(async (c: CipherView) => {
                modal.close();
                await this.load();
            });
            comp.onDeletedCipher.subscribe(async (c: CipherView) => {
                modal.close();
                await this.load();
            });
            comp.onRestoredCipher.subscribe(async (c: CipherView) => {
                modal.close();
                await this.load();
            });

        });

        return childComponent;
    }

    protected async checkAccess(): Promise<boolean> {
        if (this.organization != null) {
            // TODO: Maybe we want to just make sure they are not on a free plan? Just compare useTotp for now
            // since all paid plans include useTotp
            if (this.requiresPaid && !this.organization.useTotp) {
                this.messagingService.send('upgradeOrganization', { organizationId: this.organization.id });
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
