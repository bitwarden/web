import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { TwoFactorRecoveryRequest } from 'jslib/models/request/twoFactorRecoveryRequest';

@Component({
    selector: 'app-recover-two-factor',
    templateUrl: 'recover-two-factor.component.html',
})
export class RecoverTwoFactorComponent {
    email: string;
    masterPassword: string;
    recoveryCode: string;
    formPromise: Promise<any>;

    constructor(private router: Router, private apiService: ApiService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private cryptoService: CryptoService) {
    }

    async submit() {
        try {
            const request = new TwoFactorRecoveryRequest();
            request.recoveryCode = this.recoveryCode.replace(/\s/g, '').toLowerCase();
            request.email = this.email.toLowerCase();
            const key = await this.cryptoService.makeKey(this.masterPassword, request.email);
            request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, key);
            this.formPromise = this.apiService.postTwoFactorRecover(request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Recovered 2FA' });
            this.toasterService.popAsync('success', null, this.i18nService.t('twoStepRecoverDisabled'));
            this.router.navigate(['/']);
        } catch { }
    }
}
