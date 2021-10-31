import {
    Component,
    Input,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';

import { PasswordVerificationRequest } from 'jslib-common/models/request/passwordVerificationRequest';

import { Verification } from 'jslib-common/types/verification';

import { VerificationType } from 'jslib-common/enums/verificationType';

@Component({
    selector: 'app-purge-vault',
    templateUrl: 'purge-vault.component.html',
})
export class PurgeVaultComponent {
    @Input() organizationId?: string = null;

    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private cryptoService: CryptoService,
        private router: Router, private logService: LogService) { }

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
            this.formPromise = this.apiService.postPurgeCiphers(request, this.organizationId);
            await this.formPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('vaultPurged'));
            if (this.organizationId != null) {
                this.router.navigate(['organizations', this.organizationId, 'vault']);
            } else {
                this.router.navigate(['vault']);
            }
        } catch (e) {
            this.logService.error(e);
        }
    }
}
