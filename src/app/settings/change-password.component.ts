import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PasswordRequest } from 'jslib/models/request/passwordRequest';

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

    private masterPasswordStrengthTimeout: any;
    private email: string;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private cryptoService: CryptoService, private messagingService: MessagingService,
        private userService: UserService, private passwordGenerationService: PasswordGenerationService,
        private platformUtilsService: PlatformUtilsService) { }

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
            this.formPromise = this.apiService.postPassword(request);
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

    private getPasswordStrengthUserInput() {
        let userInput: string[] = [];
        const atPosition = this.email.indexOf('@');
        if (atPosition > -1) {
            userInput = userInput.concat(this.email.substr(0, atPosition).trim().toLowerCase().split(/[^A-Za-z0-9]/));
        }
        return userInput;
    }
}
