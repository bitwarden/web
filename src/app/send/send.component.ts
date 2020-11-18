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
import { SendService } from 'jslib/abstractions/send.service';

@Component({
    selector: 'app-send',
    templateUrl: 'send.component.html',
})
export class SendComponent implements OnInit {
    @ViewChild('sendAddEdit', { read: ViewContainerRef, static: true }) sendAddEditModalRef: ViewContainerRef;

    sendType = SendType;
    loaded = false;
    loading = true;
    refreshing = false;
    expired: boolean = false;
    type: SendType = null;
    sends: SendView[] = [];
    filteredSends: SendView[] = [];
    searchText: string;
    selectedType: SendType;
    selectedAll: boolean;
    searchPlaceholder: string;
    filter: (cipher: SendView) => boolean;
    searchPending = false;

    modal: ModalComponent = null;
    actionPromise: any;

    private searchTimeout: any;

    constructor(private apiService: ApiService, private sendService: SendService,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private platformUtilsService: PlatformUtilsService, private environmentService: EnvironmentService) { }

    async ngOnInit() {
        await this.load();
    }
    async load(filter: (send: SendView) => boolean = null) {
        this.loading = true;
        const sends = await this.sendService.getAllDecrypted();
        this.sends = sends;
        this.selectAll();
        this.loading = false;
        this.loaded = true;
    }

    async reload(filter: (send: SendView) => boolean = null) {
        this.loaded = false;
        this.sends = [];
        await this.load(filter);
    }

    async refresh() {
        try {
            this.refreshing = true;
            await this.reload(this.filter);
        } finally {
            this.refreshing = false;
        }
    }

    async applyFilter(filter: (send: SendView) => boolean = null) {
        this.filter = filter;
        await this.search(null);
    }

    async search(timeout: number = null) {
        this.searchPending = false;
        if (this.searchTimeout != null) {
            clearTimeout(this.searchTimeout);
        }
        if (timeout == null) {
            this.filteredSends = this.sends.filter((s) => this.filter == null || this.filter(s));
            return;
        }
        this.searchPending = true;
        this.searchTimeout = setTimeout(async () => {
            this.filteredSends = this.sends.filter((s) => this.filter == null || this.filter(s));
            this.searchPending = false;
        }, timeout);
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

    searchTextChanged() {
        this.search(200);
    }

    selectAll() {
        this.clearSelections();
        this.selectedAll = true;
        this.applyFilter(null);
    }

    selectType(type: SendType) {
        this.clearSelections();
        this.selectedType = type;
        this.applyFilter((s) => s.type === type);
    }

    clearSelections() {
        this.selectedAll = false;
        this.selectedType = null;
    }
}
