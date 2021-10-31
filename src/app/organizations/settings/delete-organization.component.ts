import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { Verification } from 'jslib-common/types/verification';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';

import { VerificationType } from 'jslib-common/enums/verificationType';

import { PasswordVerificationRequest } from 'jslib-common/models/request/passwordVerificationRequest';

@Component({
    selector: 'app-delete-organization',
    templateUrl: 'delete-organization.component.html',
})
export class DeleteOrganizationComponent {
    organizationId: string;

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
            this.formPromise = this.apiService.deleteOrganization(this.organizationId, request);
            await this.formPromise;
            this.toasterService.popAsync('success', this.i18nService.t('organizationDeleted'),
                this.i18nService.t('organizationDeletedDesc'));
            this.router.navigate(['/']);
        } catch (e) {
            this.logService.error(e);
        }
    }
}
