import { Component } from '@angular/core';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserVerificationService } from 'jslib-common/abstractions/userVerification.service';

import { SecretVerificationRequest } from 'jslib-common/models/request/secretVerificationRequest';

import { ApiKeyResponse } from 'jslib-common/models/response/apiKeyResponse';

import { Verification } from 'jslib-common/types/verification';

@Component({
    selector: 'app-api-key',
    templateUrl: 'api-key.component.html',
})
export class ApiKeyComponent {
    keyType: string;
    isRotation: boolean;
    postKey: (entityId: string, request: SecretVerificationRequest) => Promise<ApiKeyResponse>;
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

    constructor(private userVerificationService: UserVerificationService, private logService: LogService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService) { }

    async submit() {
        try {
            const request = await this.userVerificationService.buildRequest(this.masterPassword);
            this.formPromise = this.postKey(this.entityId, request);
            const response = await this.formPromise;
            this.clientSecret = response.apiKey;
            this.clientId = `${this.keyType}.${this.entityId}`;
        } catch (e) {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'), e.message);
            this.logService.error(e);
        }
    }
}
