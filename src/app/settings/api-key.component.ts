import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';

import { PasswordVerificationRequest } from 'jslib-common/models/request/passwordVerificationRequest';

import { ApiKeyResponse } from 'jslib-common/models/response/apiKeyResponse';

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

    constructor(private i18nService: I18nService, private toasterService: ToasterService,
        private cryptoService: CryptoService, private logService: LogService) { }

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
        } catch (e) {
            this.logService.error(e);
        }
    }
}
