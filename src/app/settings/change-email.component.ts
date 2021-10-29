import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { EmailRequest } from 'jslib-common/models/request/emailRequest';
import { EmailTokenRequest } from 'jslib-common/models/request/emailTokenRequest';

import { TwoFactorProviderType } from 'jslib-common/enums/twoFactorProviderType';
import { VerificationType } from 'jslib-common/enums/verificationType';

@Component({
    selector: 'app-change-email',
    templateUrl: 'change-email.component.html',
})
export class ChangeEmailComponent implements OnInit {
    masterPassword: string;
    newEmail: string;
    token: string;
    tokenSent = false;
    showTwoFactorEmailWarning = false;

    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private cryptoService: CryptoService,
        private messagingService: MessagingService, private userService: UserService,
        private logService: LogService) { }

    async ngOnInit() {
        const twoFactorProviders = await this.apiService.getTwoFactorProviders();
        this.showTwoFactorEmailWarning = twoFactorProviders.data.some(p => p.type === TwoFactorProviderType.Email &&
            p.enabled);
    }

    async submit() {
        const hasEncKey = await this.cryptoService.hasEncKey();
        if (!hasEncKey) {
            this.toasterService.popAsync('error', null, this.i18nService.t('updateKey'));
            return;
        }

        this.newEmail = this.newEmail.trim().toLowerCase();
        if (!this.tokenSent) {
            const masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);
            const request = new EmailTokenRequest({
                secret: masterPasswordHash,
                type: VerificationType.MasterPassword,
            });
            request.newEmail = this.newEmail;
            try {
                this.formPromise = this.apiService.postEmailToken(request);
                await this.formPromise;
                this.tokenSent = true;
            } catch (e) {
                this.logService.error(e);
            }
        } else {
            const masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);
            const request = new EmailRequest({
                secret: masterPasswordHash,
                type: VerificationType.MasterPassword,
            });
            request.token = this.token;
            request.newEmail = this.newEmail;
            const kdf = await this.userService.getKdf();
            const kdfIterations = await this.userService.getKdfIterations();
            const newKey = await this.cryptoService.makeKey(this.masterPassword, this.newEmail, kdf, kdfIterations);
            request.newMasterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, newKey);
            const newEncKey = await this.cryptoService.remakeEncKey(newKey);
            request.key = newEncKey[1].encryptedString;
            try {
                this.formPromise = this.apiService.postEmail(request);
                await this.formPromise;
                this.reset();
                this.toasterService.popAsync('success', this.i18nService.t('emailChanged'),
                    this.i18nService.t('logBackIn'));
                this.messagingService.send('logout');
            } catch (e) {
                this.logService.error(e);
            }
        }
    }

    reset() {
        this.token = this.newEmail = this.masterPassword = null;
        this.tokenSent = false;
    }
}
