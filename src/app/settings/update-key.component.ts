import { Component } from '@angular/core';

import { Toast, ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { CipherString } from 'jslib/models/domain/cipherString';

import { CipherWithIdRequest } from 'jslib/models/request/cipherWithIdRequest';
import { FolderWithIdRequest } from 'jslib/models/request/folderWithIdRequest';
import { UpdateKeyRequest } from 'jslib/models/request/updateKeyRequest';

@Component({
    selector: 'app-update-key',
    templateUrl: 'update-key.component.html',
})
export class UpdateKeyComponent {
    masterPassword: string;
    formPromise: Promise<any>;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private cryptoService: CryptoService,
        private messagingService: MessagingService,
        private syncService: SyncService,
        private folderService: FolderService,
        private cipherService: CipherService
    ) {}

    async submit() {
        const hasEncKey = await this.cryptoService.hasEncKey();
        if (hasEncKey) {
            return;
        }

        if (this.masterPassword == null || this.masterPassword === '') {
            this.toasterService.popAsync(
                'error',
                this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired')
            );
            return;
        }

        try {
            this.formPromise = this.makeRequest().then((request) => {
                return this.apiService.postAccountKey(request);
            });
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Key Updated' });
            const toast: Toast = {
                type: 'success',
                title: this.i18nService.t('keyUpdated'),
                body: this.i18nService.t('logBackInOthersToo'),
                timeout: 15000,
            };
            this.toasterService.popAsync(toast);
            this.messagingService.send('logout');
        } catch {}
    }

    private async makeRequest(): Promise<UpdateKeyRequest> {
        const key = await this.cryptoService.getKey();
        const encKey = await this.cryptoService.makeEncKey(key);
        const privateKey = await this.cryptoService.getPrivateKey();
        let encPrivateKey: CipherString = null;
        if (privateKey != null) {
            encPrivateKey = await this.cryptoService.encrypt(privateKey, encKey[0]);
        }
        const request = new UpdateKeyRequest();
        request.privateKey = encPrivateKey != null ? encPrivateKey.encryptedString : null;
        request.key = encKey[1].encryptedString;
        request.masterPasswordHash = await this.cryptoService.hashPassword(
            this.masterPassword,
            null
        );

        await this.syncService.fullSync(true);

        const folders = await this.folderService.getAllDecrypted();
        for (let i = 0; i < folders.length; i++) {
            if (folders[i].id == null) {
                continue;
            }
            const folder = await this.folderService.encrypt(folders[i], encKey[0]);
            request.folders.push(new FolderWithIdRequest(folder));
        }

        const ciphers = await this.cipherService.getAllDecrypted();
        for (let i = 0; i < ciphers.length; i++) {
            if (ciphers[i].organizationId != null) {
                continue;
            }
            const cipher = await this.cipherService.encrypt(ciphers[i], encKey[0]);
            request.ciphers.push(new CipherWithIdRequest(cipher));
        }

        return request;
    }
}
