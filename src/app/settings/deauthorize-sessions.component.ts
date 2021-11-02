import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { UserVerificationService } from 'jslib-common/abstractions/userVerification.service';

import { PasswordVerificationRequest } from 'jslib-common/models/request/passwordVerificationRequest';

import { Verification } from 'jslib-common/types/verification';

@Component({
    selector: 'app-deauthorize-sessions',
    templateUrl: 'deauthorize-sessions.component.html',
})
export class DeauthorizeSessionsComponent {
    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private userVerificationService: UserVerificationService,
        private messagingService: MessagingService, private logService: LogService) { }

    async submit() {
        let request: PasswordVerificationRequest;
        try {
            request = await this.userVerificationService.buildRequest(this.masterPassword);
        } catch (e) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'), e.message);
            return;
        }

        try {
            this.formPromise = this.apiService.postSecurityStamp(request);
            await this.formPromise;
            this.toasterService.popAsync('success', this.i18nService.t('sessionsDeauthorized'),
                this.i18nService.t('logBackIn'));
            this.messagingService.send('logout');
        } catch (e) {
            this.logService.error(e);
        }
    }
}
