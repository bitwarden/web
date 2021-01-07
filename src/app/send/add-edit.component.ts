import { DatePipe } from '@angular/common';

import {
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { Component } from '@angular/core';

import { SendType } from 'jslib/enums/sendType';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SendService } from 'jslib/abstractions/send.service';
import { UserService } from 'jslib/abstractions/user.service';

import { SendView } from 'jslib/models/view/sendView';
import { SendFileView } from 'jslib/models/view/sendFileView';
import { SendTextView } from 'jslib/models/view/sendTextView';

import { Send } from 'jslib/models/domain/send';
import { MessagingService } from 'jslib/abstractions/messaging.service';

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
    deletionDateOptions: any[];
    expirationDateOptions: any[];
    deletionDateSelect = 168;
    expirationDateSelect: number = null;
    canAccessPremium = true;
    premiumRequiredAlertShown = false;

    constructor(private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private environmentService: EnvironmentService, private datePipe: DatePipe,
        private sendService: SendService, private userService: UserService,
        private messagingService: MessagingService) {
        this.typeOptions = [
            { name: i18nService.t('sendTypeFile'), value: SendType.File },
            { name: i18nService.t('sendTypeText'), value: SendType.Text },
        ];
        this.deletionDateOptions = this.expirationDateOptions = [
            { name: i18nService.t('oneHour'), value: 1 },
            { name: i18nService.t('oneDay'), value: 24 },
            { name: i18nService.t('days', '2'), value: 48 },
            { name: i18nService.t('days', '3'), value: 72 },
            { name: i18nService.t('days', '7'), value: 168 },
            { name: i18nService.t('days', '30'), value: 720 },
            { name: i18nService.t('custom'), value: 0 },
        ];
        this.expirationDateOptions = [
            { name: i18nService.t('never'), value: null }
        ].concat([...this.deletionDateOptions]);
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

        this.canAccessPremium = await this.userService.canAccessPremium();
        if (!this.canAccessPremium) {
            this.type = SendType.Text;
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
        this.deletionDate = this.dateToString(this.send.deletionDate);
        this.expirationDate = this.dateToString(this.send.expirationDate);

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

        if (!this.editMode) {
            const now = new Date();
            if (this.deletionDateSelect > 0) {
                const d = new Date();
                d.setHours(now.getHours() + this.deletionDateSelect);
                this.deletionDate = this.dateToString(d);
            }
            if (this.expirationDateSelect != null && this.expirationDateSelect > 0) {
                const d = new Date();
                d.setHours(now.getHours() + this.expirationDateSelect);
                this.expirationDate = this.dateToString(d);
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
            this.deletePromise = this.sendService.deleteWithServer(this.send.id);
            await this.deletePromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t('deletedSend'));
            await this.load();
            this.onDeletedSend.emit(this.send);
        } catch { }
    }

    typeChanged() {
        if (!this.canAccessPremium && this.send.type == SendType.File && !this.premiumRequiredAlertShown) {
            this.premiumRequiredAlertShown = true;
            this.messagingService.send('premiumRequired');
        }
    }

    protected async loadSend(): Promise<Send> {
        return this.sendService.get(this.sendId);
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

    protected dateToString(d: Date) {
        return d == null ? null : this.datePipe.transform(d, 'yyyy-MM-ddTHH:mm');
    }
}
