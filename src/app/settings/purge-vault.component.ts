import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';

@Component({
    selector: 'app-purge-vault',
    templateUrl: 'purge-vault.component.html',
})
export class PurgeVaultComponent {
    @Input() organizationId?: string = null;

    masterPassword: string;
    formPromise: Promise<any>;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private cryptoService: CryptoService,
        private router: Router
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
            this.formPromise = this.apiService.postPurgeCiphers(request, this.organizationId);
            await this.formPromise;
            this.analytics.eventTrack.next({
                action: this.organizationId != null ? 'Purged Organization Vault' : 'Purged Vault',
            });
            this.toasterService.popAsync('success', null, this.i18nService.t('vaultPurged'));
            if (this.organizationId != null) {
                this.router.navigate(['organizations', this.organizationId, 'vault']);
            } else {
                this.router.navigate(['vault']);
            }
        } catch {}
    }
}
