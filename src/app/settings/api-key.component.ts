import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';

import { ApiKeyResponse } from 'jslib/models/response/apiKeyResponse';

@Component({
    selector: 'app-api-key',
    templateUrl: 'api-key.component.html',
})
export class ApiKeyComponent {
    keyType: string;
    isRotation: boolean;
    postKey: (entityId: string, request: PasswordVerificationRequest) => Promise<ApiKeyResponse>;
    entityId: string;
    scope: string;
    grantType: string;
    apiKeyTitle: string;
    apiKeyWarning: string;
    apiKeyDescription: string;

    masterPassword: string;
    formPromise: Promise<ApiKeyResponse>;
    clientId: string;
    clientSecret: string;

    constructor(private i18nService: I18nService, private analytics: Angulartics2,
        private toasterService: ToasterService, private cryptoService: CryptoService) { }

    async submit() {
        if (this.masterPassword == null || this.masterPassword === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return;
        }

        const request = new PasswordVerificationRequest();
        request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);
        try {
            this.formPromise = this.postKey(this.entityId, request);
            const response = await this.formPromise;
            this.clientSecret = response.apiKey;
            this.clientId = `${this.keyType}.${this.entityId}`;
            this.analytics.eventTrack.next({ action: `Viewed ${this.keyType} API Key` });
        } catch { }
    }
}
