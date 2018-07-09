import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { UpdateTwoFactorAuthenticatorRequest } from 'jslib/models/request/updateTwoFactorAuthenticatorRequest';
import { TwoFactorAuthenticatorResponse } from 'jslib/models/response/twoFactorAuthenticatorResponse';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { TwoFactorBaseComponent } from './two-factor-base.component';

@Component({
    selector: 'app-two-factor-authenticator',
    templateUrl: 'two-factor-authenticator.component.html',
})
export class TwoFactorAuthenticatorComponent extends TwoFactorBaseComponent {
    key: string;
    qr: string;
    token: string;
    formPromise: Promise<any>;

    constructor(apiService: ApiService, i18nService: I18nService,
        analytics: Angulartics2, toasterService: ToasterService,
        private userService: UserService, platformUtilsService: PlatformUtilsService) {
        super(apiService, i18nService, analytics, toasterService, platformUtilsService,
            TwoFactorProviderType.Authenticator);
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
        this.qr = 'https://chart.googleapis.com/chart?chs=160x160&chld=L|0&cht=qr&chl=otpauth://totp/' +
            'Bitwarden:' + encodeURIComponent(await this.userService.getEmail()) +
            '%3Fsecret=' + encodeURIComponent(this.key) +
            '%26issuer=Bitwarden';
    }
}
