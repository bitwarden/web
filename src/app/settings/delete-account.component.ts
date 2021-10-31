import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';

import { VerificationType } from 'jslib-common/enums/verificationType';

import { PasswordVerificationRequest } from 'jslib-common/models/request/passwordVerificationRequest';

import { Verification } from 'jslib-angular/components/verify-master-password.component';

@Component({
    selector: 'app-delete-account',
    templateUrl: 'delete-account.component.html',
})
export class DeleteAccountComponent {
    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private cryptoService: CryptoService,
        private messagingService: MessagingService, private logService: LogService) { }

    async submit() {
        if (this.masterPassword?.secret == null || this.masterPassword.secret === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return;
        }

        const request = new PasswordVerificationRequest();
        if (this.masterPassword.type === VerificationType.MasterPassword) {
            request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword.secret, null);
        } else {
            request.otp = this.masterPassword.secret;
        }

        try {
            this.formPromise = this.apiService.deleteAccount(request);
            await this.formPromise;
            this.toasterService.popAsync('success', this.i18nService.t('accountDeleted'),
                this.i18nService.t('accountDeletedDesc'));
            this.messagingService.send('logout');
        } catch (e) {
            this.logService.error(e);
        }
    }
}
