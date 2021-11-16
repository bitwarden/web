import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserVerificationService } from 'jslib-common/abstractions/userVerification.service';

import { SecretVerificationRequest } from 'jslib-common/models/request/secretVerificationRequest';

import { Verification } from 'jslib-common/types/verification';

@Component({
    selector: 'app-delete-account',
    templateUrl: 'delete-account.component.html',
})
export class DeleteAccountComponent {
    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private userVerificationService: UserVerificationService,
        private messagingService: MessagingService, private logService: LogService,
        private platformUtilsService: PlatformUtilsService) { }

    async submit() {
        let request: SecretVerificationRequest;
        try {
            request = await this.userVerificationService.buildRequest(this.masterPassword);
        } catch (e) {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'), e.message);
            return;
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
