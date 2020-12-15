import { DatePipe } from '@angular/common';

import {
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { Component } from '@angular/core';

import { SendType } from 'jslib/enums/sendType';

import { ApiService } from 'jslib/abstractions/api.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SendService } from 'jslib/abstractions/send.service';

import { SendView } from 'jslib/models/view/sendView';
import { SendFileView } from 'jslib/models/view/sendFileView';
import { SendTextView } from 'jslib/models/view/sendTextView';

import { Send } from 'jslib/models/domain/send';

import { SendData } from 'jslib/models/data/sendData';

@Component({
    selector: 'app-send-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent {
    @Input() sendId: string;
    @Input() type: SendType;

    @Output() onSavedSend = new EventEmitter<SendView>();
    @Output() onDeletedSend = new EventEmitter<SendView>();
    @Output() onCancelled = new EventEmitter<SendView>();

    editMode: boolean = false;
    send: SendView;
    link: string;
    title: string;
    deletionDate: string;
    expirationDate: string;
    hasPassword: boolean;
    password: string;
    formPromise: Promise<any>;
    deletePromise: Promise<any>;
    sendType = SendType;
    typeOptions: any[];

    constructor(private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private apiService: ApiService, private environmentService: EnvironmentService,
        private datePipe: DatePipe, private sendService: SendService) {
        this.typeOptions = [
            { name: i18nService.t('sendTypeFile'), value: SendType.File },
            { name: i18nService.t('sendTypeText'), value: SendType.Text },
        ];
    }

    async ngOnInit() {
        await this.load();
    }

    async load() {
        this.editMode = this.sendId != null;
        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editSend');
        } else {
            this.title = this.i18nService.t('createSend');
        }

        if (this.send == null) {
            if (this.editMode) {
                const send = await this.loadSend();
                this.send = await send.decrypt();
            } else {
                this.send = new SendView();
                this.send.type = this.type == null ? SendType.File : this.type;
                this.send.file = new SendFileView();
                this.send.text = new SendTextView();
                this.send.deletionDate = new Date();
                this.send.deletionDate.setDate(this.send.deletionDate.getDate() + 7);
            }
        }

        this.hasPassword = this.send.password != null && this.send.password.trim() !== '';

        // Parse dates
        this.deletionDate = this.send.deletionDate == null ? null :
            this.datePipe.transform(this.send.deletionDate, 'yyyy-MM-ddTHH:mm');
        this.expirationDate = this.send.expirationDate == null ? null :
            this.datePipe.transform(this.send.expirationDate, 'yyyy-MM-ddTHH:mm');

        if (this.editMode) {
            let webVaultUrl = this.environmentService.getWebVaultUrl();
            if (webVaultUrl == null) {
                webVaultUrl = 'https://vault.bitwarden.com';
            }
            this.link = webVaultUrl + '/#/send/' + this.send.accessId + '/' + this.send.urlB64Key;
        }
    }

    async submit(): Promise<boolean> {
        if (this.send.name == null || this.send.name === '') {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('nameRequired'));
            return false;
        }

        let file: File = null;
        if (this.send.type === SendType.File && !this.editMode) {
            const fileEl = document.getElementById('file') as HTMLInputElement;
            const files = fileEl.files;
            if (files == null || files.length === 0) {
                this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                    this.i18nService.t('selectFile'));
                return;
            }

            file = files[0];
            if (file.size > 104857600) { // 100 MB
                this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                    this.i18nService.t('maxFileSize'));
                return;
            }
        }

        const encSend = await this.encryptSend(file);
        try {
            this.formPromise = this.sendService.saveWithServer(encSend);
            await this.formPromise;
            this.send.id = encSend[0].id;
            this.platformUtilsService.showToast('success', null,
                this.i18nService.t(this.editMode ? 'editedSend' : 'createdSend'));
            this.onSavedSend.emit(this.send);
            return true;
        } catch { }

        return false;
    }

    clearExpiration() {
        this.expirationDate = null;
    }

    async delete(): Promise<void> {
        if (this.deletePromise != null) {
            return;
        }
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteSendConfirmation'),
            this.i18nService.t('deleteSend'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }

        try {
            this.deletePromise = this.apiService.deleteSend(this.send.id);
            await this.deletePromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t('deletedSend'));
            await this.load();
            this.onDeletedSend.emit(this.send);
        } catch { }
    }

    protected async loadSend(): Promise<Send> {
        const response = await this.apiService.getSend(this.sendId);
        const data = new SendData(response);
        return new Send(data);
    }

    protected async encryptSend(file: File): Promise<[Send, ArrayBuffer]> {
        const sendData = await this.sendService.encrypt(this.send, file, this.password, null);

        // Parse dates
        try {
            sendData[0].deletionDate = this.deletionDate == null ? null : new Date(this.deletionDate);
        } catch {
            sendData[0].deletionDate = null;
        }
        try {
            sendData[0].expirationDate = this.expirationDate == null ? null : new Date(this.expirationDate);
        } catch {
            sendData[0].expirationDate = null;
        }

        return sendData;
    }
}
