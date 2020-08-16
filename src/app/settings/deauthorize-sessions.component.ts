import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';

import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';

@Component({
    selector: 'app-deauthorize-sessions',
    templateUrl: 'deauthorize-sessions.component.html',
})
export class DeauthorizeSessionsComponent {
    masterPassword: string;
    formPromise: Promise<any>;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private cryptoService: CryptoService,
        private messagingService: MessagingService
    ) {}

    async submit() {
        if (this.masterPassword == null || this.masterPassword === '') {
            this.toasterService.popAsync(
                'error',
                this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired')
            );
            return;
        }

        const request = new PasswordVerificationRequest();
        request.masterPasswordHash = await this.cryptoService.hashPassword(
            this.masterPassword,
            null
        );
        try {
            this.formPromise = this.apiService.postSecurityStamp(request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Deauthorized Sessions' });
            this.toasterService.popAsync(
                'success',
                this.i18nService.t('sessionsDeauthorized'),
                this.i18nService.t('logBackIn')
            );
            this.messagingService.send('logout');
        } catch {}
    }
}
