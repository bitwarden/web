import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';

import { PasswordVerificationRequest } from 'jslib-common/models/request/passwordVerificationRequest';

import { ApiKeyResponse } from 'jslib-common/models/response/apiKeyResponse';

import { Verification } from 'jslib-angular/components/verify-master-password.component';

import { VerificationType } from 'jslib-common/enums/verificationType';

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

    masterPassword: Verification;
    formPromise: Promise<ApiKeyResponse>;
    clientId: string;
    clientSecret: string;

    constructor(private i18nService: I18nService, private toasterService: ToasterService,
        private cryptoService: CryptoService, private logService: LogService) { }

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
            this.formPromise = this.postKey(this.entityId, request);
            const response = await this.formPromise;
            this.clientSecret = response.apiKey;
            this.clientId = `${this.keyType}.${this.entityId}`;
        } catch (e) {
            this.logService.error(e);
        }
    }
}
