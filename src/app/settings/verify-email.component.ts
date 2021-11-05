import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';

@Component({
    selector: 'app-verify-email',
    templateUrl: 'verify-email.component.html',
})
export class VerifyEmailComponent {
    actionPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private logService: LogService) { }

    async send() {
        if (this.actionPromise != null) {
            return;
        }
        try {
            this.actionPromise = this.apiService.postAccountVerifyEmail();
            await this.actionPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('checkInboxForVerification'));
        } catch (e) {
            this.logService.error(e);
        }
        this.actionPromise = null;
    }
}
