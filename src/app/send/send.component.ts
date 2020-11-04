import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { SendType } from 'jslib/enums/sendType';

import { SendView } from 'jslib/models/view/sendView';

import { AddEditComponent } from './add-edit.component';

import { ModalComponent } from '../modal.component';

import { ApiService } from 'jslib/abstractions/api.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { SendData } from 'jslib/models/data/sendData';

import { Send } from 'jslib/models/domain/send';

@Component({
    selector: 'app-send',
    templateUrl: 'send.component.html',
})
export class SendComponent implements OnInit {
    @ViewChild('sendAddEdit', { read: ViewContainerRef, static: true }) sendAddEditModalRef: ViewContainerRef;

    sendType = SendType;
    loading = true;
    expired: boolean = false;
    type: SendType = null;
    sends: SendView[] = [];

    modal: ModalComponent = null;
    actionPromise: any;

    constructor(private apiService: ApiService, private userService: UserService,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private platformUtilsService: PlatformUtilsService, private environmentService: EnvironmentService) { }

    async ngOnInit() {
        await this.load();
    }

    async load() {
        this.loading = true;
        const userId = await this.userService.getUserId();
        const sends = await this.apiService.getSends();
        const sendsArr: SendView[] = [];
        if (sends != null && sends.data != null) {
            for (const res of sends.data) {
                const data = new SendData(res, userId);
                const send = new Send(data);
                const view = await send.decrypt();
                sendsArr.push(view);
            }
        }
        this.sends = sendsArr;
        this.loading = false;
    }

    addSend() {
        const component = this.editSend(null);
        component.type = this.type;
    }

    editSend(send: SendView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.sendAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AddEditComponent>(
            AddEditComponent, this.sendAddEditModalRef);

        childComponent.sendId = send == null ? null : send.id;
        childComponent.onSavedSend.subscribe(async (s: SendView) => {
            this.modal.close();
            await this.load();
        });
        childComponent.onDeletedSend.subscribe(async (s: SendView) => {
            this.modal.close();
            await this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
    }

    async removePassword(s: SendView): Promise<boolean> {
        if (this.actionPromise != null || s.password == null) {
            return;
        }
        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('removePasswordConfirmation'),
            this.i18nService.t('removePassword'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.apiService.putSendRemovePassword(s.id);
            await this.actionPromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t('removedPassword'));
            await this.load();
        } catch { }
        this.actionPromise = null;
    }

    async delete(s: SendView): Promise<boolean> {
        if (this.actionPromise != null) {
            return false;
        }
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteSendConfirmation'),
            this.i18nService.t('deleteSend'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.apiService.deleteSend(s.id);
            await this.actionPromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t('deletedSend'));
            await this.load();
        } catch { }
        this.actionPromise = null;
        return true;
    }

    copy(s: SendView) {
        let webVaultUrl = this.environmentService.getWebVaultUrl();
        if (webVaultUrl == null) {
            webVaultUrl = 'https://vault.bitwarden.com';
        }
        const link = webVaultUrl + '/#/send/' + s.accessId + '/' + s.urlB64Key;
        this.platformUtilsService.copyToClipboard(link);
        this.platformUtilsService.showToast('success', null,
            this.i18nService.t('valueCopied', this.i18nService.t('sendLink')));
    }
}
