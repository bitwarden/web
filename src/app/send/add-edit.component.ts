import { DatePipe } from '@angular/common';

import {
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { Component } from '@angular/core';

import { SendType } from 'jslib/enums/sendType';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { EventService } from 'jslib/abstractions/event.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

import { SendView } from 'jslib/models/view/sendView';
import { SendFileView } from 'jslib/models/view/sendFileView';
import { SendTextView } from 'jslib/models/view/sendTextView';
import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';

import { Send } from 'jslib/models/domain/send';
import { SendFile } from 'jslib/models/domain/sendFile';
import { SendText } from 'jslib/models/domain/sendText';

import { SendData } from 'jslib/models/data/sendData';

import { SendRequest } from 'jslib/models/request/sendRequest';

import { Utils } from 'jslib/misc/utils';

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

    constructor(cipherService: CipherService, folderService: FolderService,
        private i18nService: I18nService, protected platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        userService: UserService, collectionService: CollectionService,
        protected totpService: TotpService, protected passwordGenerationService: PasswordGenerationService,
        protected messagingService: MessagingService, eventService: EventService,
        protected apiService: ApiService, private cryptoService: CryptoService,
        private cryptoFunctionService: CryptoFunctionService, private environmentService: EnvironmentService,
        private datePipe: DatePipe) {
        this.typeOptions = [
            { name: i18nService.t('file'), value: SendType.File },
            { name: 'Text', value: SendType.Text },
        ];
    }

    async ngOnInit() {
        await this.load();
    }

    async load() {
        this.editMode = this.sendId != null;
        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editItem');
        } else {
            this.title = this.i18nService.t('addItem');
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
            this.formPromise = this.saveSend(encSend);
            await this.formPromise;
            this.send.id = encSend[0].id;
            this.platformUtilsService.showToast('success', null,
                this.i18nService.t(this.editMode ? 'editedSend' : 'addedSend'));
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
            this.i18nService.t('permanentlyDeleteItemConfirmation'),
            this.i18nService.t('permanentlyDeleteItem'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }

        try {
            this.deletePromise = this.apiService.deleteSend(this.send.id);
            await this.deletePromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t('permanentlyDeletedItem'));
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
        let fileData: ArrayBuffer = null;
        const send = new Send();
        send.id = this.send.id;
        send.type = this.send.type;
        send.disabled = this.send.disabled;
        if (this.send.key == null) {
            this.send.key = await this.cryptoFunctionService.randomBytes(16);
            this.send.cryptoKey = await this.cryptoService.makeSendKey(this.send.key);
        }
        if (this.password != null) {
            const passwordHash = await this.cryptoFunctionService.pbkdf2(this.password,
                this.send.key, 'sha256', 100000);
            send.password = Utils.fromBufferToB64(passwordHash);
        }
        send.key = await this.cryptoService.encrypt(this.send.key, null);
        send.name = await this.cryptoService.encrypt(this.send.name, this.send.cryptoKey);
        send.notes = await this.cryptoService.encrypt(this.send.notes, this.send.cryptoKey);
        if (send.type === SendType.Text) {
            send.text = new SendText();
            send.text.text = await this.cryptoService.encrypt(this.send.text.text, this.send.cryptoKey);
            send.text.hidden = this.send.text.hidden;
        } else if (send.type === SendType.File) {
            send.file = new SendFile();
            if (file != null) {
                fileData = await this.parseFile(send, file);
            }
        }

        // Parse dates
        try {
            send.deletionDate = this.deletionDate == null ? null : new Date(this.deletionDate);
        } catch {
            send.deletionDate = null;
        }
        try {
            send.expirationDate = this.expirationDate == null ? null : new Date(this.expirationDate);
        } catch {
            send.expirationDate = null;
        }

        return [send, fileData];
    }

    protected async saveSend(sendData: [Send, ArrayBuffer]) {
        const request = new SendRequest(sendData[0]);
        if (sendData[0].id == null) {
            if (sendData[0].type === SendType.Text) {
                await this.apiService.postSend(request);
            } else {
                const fd = new FormData();
                try {
                    const blob = new Blob([sendData[1]], { type: 'application/octet-stream' });
                    fd.append('model', JSON.stringify(request));
                    fd.append('data', blob, sendData[0].file.fileName.encryptedString);
                } catch (e) {
                    if (Utils.isNode && !Utils.isBrowser) {
                        fd.append('model', JSON.stringify(request));
                        fd.append('data', Buffer.from(sendData[1]) as any, {
                            filepath: sendData[0].file.fileName.encryptedString,
                            contentType: 'application/octet-stream',
                        } as any);
                    } else {
                        throw e;
                    }
                }
                await this.apiService.postSendFile(fd);
            }
        } else {
            await this.apiService.putSend(sendData[0].id, request);
        }
    }

    private parseFile(send: Send, file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async (evt) => {
                try {
                    send.file.fileName = await this.cryptoService.encrypt(file.name, this.send.cryptoKey);
                    const fileData = await this.cryptoService.encryptToBytes(evt.target.result as ArrayBuffer,
                        this.send.cryptoKey);
                    resolve(fileData);
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = (evt) => {
                reject('Error reading file.');
            };
        });
    }
}
