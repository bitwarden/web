import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherString } from 'jslib/models/domain/cipherString';
import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';

import { CipherWithIdRequest } from 'jslib/models/request/cipherWithIdRequest';
import { FolderWithIdRequest } from 'jslib/models/request/folderWithIdRequest';
import { PasswordRequest } from 'jslib/models/request/passwordRequest';
import { UpdateKeyRequest } from 'jslib/models/request/updateKeyRequest';

@Component({
    selector: 'app-change-password',
    templateUrl: 'change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {
    currentMasterPassword: string;
    newMasterPassword: string;
    confirmNewMasterPassword: string;
    formPromise: Promise<any>;
    masterPasswordScore: number;
    rotateEncKey = false;

    private masterPasswordStrengthTimeout: any;
    private email: string;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private cryptoService: CryptoService, private messagingService: MessagingService,
        private userService: UserService, private passwordGenerationService: PasswordGenerationService,
        private platformUtilsService: PlatformUtilsService, private folderService: FolderService,
        private cipherService: CipherService, private syncService: SyncService) { }

    async ngOnInit() {
        this.email = await this.userService.getEmail();
    }

    async submit() {
        const hasEncKey = await this.cryptoService.hasEncKey();
        if (!hasEncKey) {
            this.toasterService.popAsync('error', null, this.i18nService.t('updateKey'));
            return;
        }

        if (this.currentMasterPassword == null || this.currentMasterPassword === '' ||
            this.newMasterPassword == null || this.newMasterPassword === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return;
        }
        if (this.newMasterPassword.length < 8) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassLength'));
            return;
        }
        if (this.newMasterPassword !== this.confirmNewMasterPassword) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassDoesntMatch'));
            return;
        }

        const strengthResult = this.passwordGenerationService.passwordStrength(this.newMasterPassword,
            this.getPasswordStrengthUserInput());
        if (strengthResult != null && strengthResult.score < 3) {
            const result = await this.platformUtilsService.showDialog(this.i18nService.t('weakMasterPasswordDesc'),
                this.i18nService.t('weakMasterPassword'), this.i18nService.t('yes'), this.i18nService.t('no'),
                'warning');
            if (!result) {
                return;
            }
        }

        if (this.rotateEncKey) {
            await this.syncService.fullSync(true);
        }

        const request = new PasswordRequest();
        request.masterPasswordHash = await this.cryptoService.hashPassword(this.currentMasterPassword, null);
        const email = await this.userService.getEmail();
        const kdf = await this.userService.getKdf();
        const kdfIterations = await this.userService.getKdfIterations();
        const newKey = await this.cryptoService.makeKey(this.newMasterPassword, email, kdf, kdfIterations);
        request.newMasterPasswordHash = await this.cryptoService.hashPassword(this.newMasterPassword, newKey);
        const newEncKey = await this.cryptoService.remakeEncKey(newKey);
        request.key = newEncKey[1].encryptedString;
        try {
            if (this.rotateEncKey) {
                this.formPromise = this.apiService.postPassword(request).then(() => {
                    return this.updateKey(newKey, request.newMasterPasswordHash);
                });
            } else {
                this.formPromise = this.apiService.postPassword(request);
            }
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Changed Password' });
            this.toasterService.popAsync('success', this.i18nService.t('masterPasswordChanged'),
                this.i18nService.t('logBackIn'));
            this.messagingService.send('logout');
        } catch { }
    }

    updatePasswordStrength() {
        if (this.masterPasswordStrengthTimeout != null) {
            clearTimeout(this.masterPasswordStrengthTimeout);
        }
        this.masterPasswordStrengthTimeout = setTimeout(() => {
            const strengthResult = this.passwordGenerationService.passwordStrength(this.newMasterPassword,
                this.getPasswordStrengthUserInput());
            this.masterPasswordScore = strengthResult == null ? null : strengthResult.score;
        }, 300);
    }

    async rotateEncKeyClicked() {
        if (this.rotateEncKey) {
            const ciphers = await this.cipherService.getAllDecrypted();
            let hasOldAttachments = false;
            if (ciphers != null) {
                for (let i = 0; i < ciphers.length; i++) {
                    if (ciphers[i].organizationId == null && ciphers[i].hasOldAttachments) {
                        hasOldAttachments = true;
                        break;
                    }
                }
            }

            if (hasOldAttachments) {
                const learnMore = await this.platformUtilsService.showDialog(
                    this.i18nService.t('oldAttachmentsNeedFixDesc'), null,
                    this.i18nService.t('learnMore'), this.i18nService.t('close'), 'warning');
                if (learnMore) {
                    this.platformUtilsService.launchUri('https://help.bitwarden.com/article/attachments/');
                }
                this.rotateEncKey = false;
                return;
            }

            const result = await this.platformUtilsService.showDialog(
                this.i18nService.t('updateEncryptionKeyWarning') + ' ' +
                this.i18nService.t('rotateEncKeyConfirmation'), this.i18nService.t('rotateEncKeyTitle'),
                this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
            if (!result) {
                this.rotateEncKey = false;
            }
        }
    }

    private getPasswordStrengthUserInput() {
        let userInput: string[] = [];
        const atPosition = this.email.indexOf('@');
        if (atPosition > -1) {
            userInput = userInput.concat(this.email.substr(0, atPosition).trim().toLowerCase().split(/[^A-Za-z0-9]/));
        }
        return userInput;
    }

    private async updateKey(key: SymmetricCryptoKey, masterPasswordHash: string) {
        const encKey = await this.cryptoService.makeEncKey(key);
        const privateKey = await this.cryptoService.getPrivateKey();
        let encPrivateKey: CipherString = null;
        if (privateKey != null) {
            encPrivateKey = await this.cryptoService.encrypt(privateKey, encKey[0]);
        }
        const request = new UpdateKeyRequest();
        request.privateKey = encPrivateKey != null ? encPrivateKey.encryptedString : null;
        request.key = encKey[1].encryptedString;
        request.masterPasswordHash = masterPasswordHash;

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

        await this.apiService.postAccountKey(request);
    }
}
