import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { UpdateTwoFactorAuthenticatorRequest } from 'jslib-common/models/request/updateTwoFactorAuthenticatorRequest';
import { TwoFactorAuthenticatorResponse } from 'jslib-common/models/response/twoFactorAuthenticatorResponse';

import { TwoFactorProviderType } from 'jslib-common/enums/twoFactorProviderType';

import { StateService } from 'jslib-common/abstractions/state.service';
import { TwoFactorBaseComponent } from './two-factor-base.component';

@Component({
    selector: 'app-two-factor-authenticator',
    templateUrl: 'two-factor-authenticator.component.html',
})
export class TwoFactorAuthenticatorComponent extends TwoFactorBaseComponent implements OnInit, OnDestroy {
    type = TwoFactorProviderType.Authenticator;
    key: string;
    token: string;
    formPromise: Promise<any>;

    private qrScript: HTMLScriptElement;

    constructor(apiService: ApiService, i18nService: I18nService,
        toasterService: ToasterService, private stateService: StateService,
        platformUtilsService: PlatformUtilsService) {
        super(apiService, i18nService, toasterService, platformUtilsService);
        this.qrScript = window.document.createElement('script');
        this.qrScript.src = 'scripts/qrious.min.js';
        this.qrScript.async = true;
    }

    ngOnInit() {
        window.document.body.appendChild(this.qrScript);
    }

    ngOnDestroy() {
        window.document.body.removeChild(this.qrScript);
    }

    auth(authResponse: any) {
        super.auth(authResponse);
        return this.processResponse(authResponse.response);
    }

    submit() {
        if (this.enabled) {
            return super.disable(this.formPromise);
        } else {
            return this.enable();
        }
    }

    protected enable() {
        const request = new UpdateTwoFactorAuthenticatorRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.token = this.token;
        request.key = this.key;

        return super.enable(async () => {
            this.formPromise = this.apiService.putTwoFactorAuthenticator(request);
            const response = await this.formPromise;
            await this.processResponse(response);
        });
    }

    private async processResponse(response: TwoFactorAuthenticatorResponse) {
        this.token = null;
        this.enabled = response.enabled;
        this.key = response.key;
        const email = await this.stateService.getEmail();
        window.setTimeout(() => {
            const qr = new (window as any).QRious({
                element: document.getElementById('qr'),
                value: 'otpauth://totp/Bitwarden:' + encodeURIComponent(email) +
                    '?secret=' + encodeURIComponent(this.key) + '&issuer=Bitwarden',
                size: 160,
            });
        }, 100);
    }
}
