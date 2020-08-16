import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';

import { ApiKeyResponse } from 'jslib/models/response/apiKeyResponse';

@Component({
    selector: 'app-rotate-api-key',
    templateUrl: 'rotate-api-key.component.html',
})
export class RotateApiKeyComponent {
    organizationId: string;

    masterPassword: string;
    formPromise: Promise<ApiKeyResponse>;
    clientId: string;
    clientSecret: string;
    scope: string;

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
            this.formPromise = this.apiService.postOrganizationRotateApiKey(
                this.organizationId,
                request
            );
            const response = await this.formPromise;
            this.clientSecret = response.apiKey;
            this.clientId = 'organization.' + this.organizationId;
            this.scope = 'api.organization';
            this.analytics.eventTrack.next({
                action: 'Rotated Organization API Key',
            });
        } catch {}
    }
}
