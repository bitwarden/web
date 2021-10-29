import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';

import { PasswordVerificationRequest } from 'jslib-common/models/request/passwordVerificationRequest';

import { Verification } from 'jslib-angular/components/verify-master-password.component';

@Component({
    selector: 'app-deauthorize-sessions',
    templateUrl: 'deauthorize-sessions.component.html',
})
export class DeauthorizeSessionsComponent {
    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private messagingService: MessagingService,
        private logService: LogService) { }

    async submit() {
        if (this.masterPassword?.secret == null || this.masterPassword.secret === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return;
        }

        const request = new PasswordVerificationRequest(this.masterPassword);

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
