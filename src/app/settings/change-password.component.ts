import {
    Component,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';
import { PasswordRequest } from 'jslib/models/request/passwordRequest';

@Component({
    selector: 'app-change-password',
    templateUrl: 'change-password.component.html',
})
export class ChangePasswordComponent {
    currentMasterPassword: string;
    newMasterPassword: string;
    confirmNewMasterPassword: string;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private cryptoService: CryptoService, private messagingService: MessagingService,
        private userService: UserService) { }

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

        const request = new PasswordRequest();
        request.masterPasswordHash = await this.cryptoService.hashPassword(this.currentMasterPassword, null);
        const email = await this.userService.getEmail();
        const newKey = await this.cryptoService.makeKey(this.newMasterPassword, email);
        request.newMasterPasswordHash = await this.cryptoService.hashPassword(this.newMasterPassword, newKey);
        const encKey = await this.cryptoService.getEncKey();
        const newEncKey = await this.cryptoService.encrypt(encKey.key, newKey);
        request.key = newEncKey.encryptedString;
        try {
            this.formPromise = this.apiService.postPassword(request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Changed Password' });
            this.toasterService.popAsync('success', this.i18nService.t('masterPasswordChanged'),
                this.i18nService.t('logBackIn'));
            this.messagingService.send('logout');
        } catch { }
    }
}
