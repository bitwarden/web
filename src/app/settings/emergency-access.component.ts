import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';
import { EmergencyAccessStatusType } from 'jslib/enums/emergencyAccessStatusType';
import { EmergencyAccessType } from 'jslib/enums/emergencyAccessType';
import { Utils } from 'jslib/misc/utils';
import { EmergencyAccessConfirmRequest } from 'jslib/models/request/emergencyAccessConfirmRequest';
import { EmergencyAccessGranteeDetailsResponse, EmergencyAccessGrantorDetailsResponse } from 'jslib/models/response/emergencyAccessResponse';
import { ConstantsService } from 'jslib/services/constants.service';

import { ModalComponent } from '../modal.component';
import { EmergencyAccessAddEditComponent } from './emergency-access-add-edit.component';
import { EmergencyAccessConfirmComponent } from './emergency-access-confirm.component';
import { EmergencyAccessTakeoverComponent } from './emergency-access-takeover.component';

@Component({
    selector: 'emergency-access',
    templateUrl: 'emergency-access.component.html',
})
export class EmergencyAccessComponent implements OnInit {
    @ViewChild('addEdit', { read: ViewContainerRef, static: true }) addEditModalRef: ViewContainerRef;
    @ViewChild('takeoverTemplate', { read: ViewContainerRef, static: true}) takeoverModalRef: ViewContainerRef;
    @ViewChild('confirmTemplate', { read: ViewContainerRef, static: true }) confirmModalRef: ViewContainerRef;

    emergencyContacts: EmergencyAccessGranteeDetailsResponse[];
    emergencyGrantees: EmergencyAccessGrantorDetailsResponse[];
    emergencyAccessType = EmergencyAccessType;
    emergencyAccessStatusType = EmergencyAccessStatusType;
    actionPromise: Promise<any>;

    private modal: ModalComponent = null;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private platformUtilsService: PlatformUtilsService,
        private toasterService: ToasterService, private cryptoService: CryptoService,
        private userService: UserService, private router: Router,
        private storageService: StorageService) { }

    async ngOnInit() {
        this.load();
    }

    async load() {
        this.emergencyContacts = (await this.apiService.getEmergencyAccessTrusted()).data;
        this.emergencyGrantees = (await this.apiService.getEmergencyAccessGranted()).data;
    }

    edit(details: EmergencyAccessGranteeDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.addEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EmergencyAccessAddEditComponent>(
            EmergencyAccessAddEditComponent, this.addEditModalRef);

        childComponent.name = details != null ? details.name || details.email : null;
        childComponent.emergencyAccessId = details != null ? details.id : null;
        childComponent.onSavedUser.subscribe(() => {
            this.modal.close();
            this.load();
        });
        childComponent.onDeletedUser.subscribe(() => {
            this.modal.close();
            this.remove(details);
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    invite() {
        this.edit(null);
    }

    async reinvite(contact: EmergencyAccessGranteeDetailsResponse) {
        if (this.actionPromise != null) {
            return;
        }
        this.actionPromise = this.apiService.postEmergencyAccessReinvite(contact.id);
        await this.actionPromise;
        this.toasterService.popAsync('success', null, this.i18nService.t('hasBeenReinvited', contact.email));
        this.actionPromise = null;
    }

    async confirm(contact: EmergencyAccessGranteeDetailsResponse) {
        function updateUser() {
            contact.status = EmergencyAccessStatusType.Confirmed;
        }

        if (this.actionPromise != null) {
            return;
        }

        const autoConfirm = await this.storageService.get<boolean>(ConstantsService.autoConfirmFingerprints);
        if (autoConfirm == null || !autoConfirm) {
            if (this.modal != null) {
                this.modal.close();
            }

            const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
            this.modal = this.confirmModalRef.createComponent(factory).instance;
            const childComponent = this.modal.show<EmergencyAccessConfirmComponent>(
                EmergencyAccessConfirmComponent, this.confirmModalRef);

            childComponent.name = contact != null ? contact.name || contact.email : null;
            childComponent.emergencyAccessId = contact.id;
            childComponent.userId = contact != null ? contact.granteeId : null;
            childComponent.onConfirmedUser.subscribe(async () => {
                this.modal.close();

                await this.doConfirmation(contact);
                updateUser();
                this.toasterService.popAsync('success', null, this.i18nService.t('hasBeenConfirmed', contact.name || contact.email));
            });

            this.modal.onClosed.subscribe(() => {
                this.modal = null;
            });
            return;
        }

        this.actionPromise = this.doConfirmation(contact);
        await this.actionPromise;
        updateUser();

        this.toasterService.popAsync('success', null, this.i18nService.t('hasBeenConfirmed', contact.name || contact.email));
        this.actionPromise = null;
    }

    async remove(user: EmergencyAccessGranteeDetailsResponse | EmergencyAccessGrantorDetailsResponse) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('removeUserConfirmation'), user.name || user.email,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            await this.apiService.deleteEmergencyAccess(user.id);
            this.toasterService.popAsync('success', null, this.i18nService.t('removedUserId', user.name || user.email));

            if (user instanceof EmergencyAccessGranteeDetailsResponse) {
                this.removeGrantee(user);
            } else {
                this.removeGrantor(user);
            }
        } catch { }
    }

    async requestAccess(details: EmergencyAccessGrantorDetailsResponse) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('requestAccessConfirmation', details.waitTimeDays.toString()),
            details.name || details.email,
            this.i18nService.t('requestAccess'),
            this.i18nService.t('no'),
            'warning'
        );

        if (!confirmed) {
            return false;
        }

        await this.apiService.postEmergencyAccessInitiate(details.id);

        details.status = EmergencyAccessStatusType.RecoveryInitiated;
        this.toasterService.popAsync('success', null, this.i18nService.t('requestSent', details.name || details.email));
    }

    async approve(details: EmergencyAccessGranteeDetailsResponse) {
        const type = this.i18nService.t(details.type === EmergencyAccessType.View ? 'view' : 'takeover');

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('approveAccessConfirmation', details.name, type),
            details.name || details.email,
            this.i18nService.t('approve'),
            this.i18nService.t('no'),
            'warning'
        );

        if (!confirmed) {
            return false;
        }

        await this.apiService.postEmergencyAccessApprove(details.id);
        details.status = EmergencyAccessStatusType.RecoveryApproved;

        this.toasterService.popAsync('success', null, this.i18nService.t('emergencyApproved', details.name || details.email));
    }

    async reject(details: EmergencyAccessGranteeDetailsResponse) {
        await this.apiService.postEmergencyAccessReject(details.id);
        details.status = EmergencyAccessStatusType.Confirmed;

        this.toasterService.popAsync('success', null, this.i18nService.t('emergencyRejected', details.name || details.email));
    }

    async takeover(details: EmergencyAccessGrantorDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.addEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EmergencyAccessTakeoverComponent>(
            EmergencyAccessTakeoverComponent, this.takeoverModalRef);

        childComponent.name = details != null ? details.name || details.email : null;
        childComponent.email = details.email;
        childComponent.emergencyAccessId = details != null ? details.id : null;

        childComponent.onDone.subscribe(() => {
            this.modal.close();
            this.toasterService.popAsync('success', null, this.i18nService.t('passwordResetFor', details.name || details.email));
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    private removeGrantee(user: EmergencyAccessGranteeDetailsResponse) {
        const index = this.emergencyContacts.indexOf(user);
        if (index > -1) {
            this.emergencyContacts.splice(index, 1);
        }
    }

    private removeGrantor(user: EmergencyAccessGrantorDetailsResponse) {
        const index = this.emergencyGrantees.indexOf(user);
        if (index > -1) {
            this.emergencyGrantees.splice(index, 1);
        }
    }

    // Encrypt the master password hash using the grantees public key, and send it to bitwarden for escrow.
    private async doConfirmation(user: EmergencyAccessGranteeDetailsResponse) {
        const encKey = await this.cryptoService.getEncKey();
        const publicKeyResponse = await this.apiService.getUserPublicKey(user.granteeId);
        const publicKey = Utils.fromB64ToArray(publicKeyResponse.publicKey);

        try {
            // tslint:disable-next-line
            console.log('User\'s fingerprint: ' +
                (await this.cryptoService.getFingerprint(user.granteeId, publicKey.buffer)).join('-'));
        } catch { }

        const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);
        const request = new EmergencyAccessConfirmRequest();
        request.key = encryptedKey.encryptedString;
        await this.apiService.postEmergencyAccessConfirm(user.id, request);
    }
}
