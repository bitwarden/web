import {
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';
import { TwoFactorProviderRequest } from 'jslib/models/request/twoFactorProviderRequest';
import { UpdateTwoFactorAuthenticatorRequest } from 'jslib/models/request/updateTwoFactorAuthenticatorRequest';
import { TwoFactorAuthenticatorResponse } from 'jslib/models/response/twoFactorAuthenticatorResponse';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

@Component({
    selector: 'app-two-factor-authenticator',
    templateUrl: 'two-factor-authenticator.component.html',
})
export class TwoFactorAuthenticatorComponent {
    @Output() onUpdated = new EventEmitter<boolean>();

    enabled = false;
    authed = false;
    key: string;
    qr: string;
    token: string;
    masterPassword: string;

    authPromise: Promise<any>;
    formPromise: Promise<any>;

    private masterPasswordHash: string;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private cryptoService: CryptoService, private userService: UserService,
        private platformUtilsService: PlatformUtilsService) { }

    async auth() {
        if (this.masterPassword == null || this.masterPassword === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return;
        }

        const request = new PasswordVerificationRequest();
        request.masterPasswordHash = this.masterPasswordHash =
            await this.cryptoService.hashPassword(this.masterPassword, null);
        try {
            this.authPromise = this.apiService.getTwoFactorAuthenticator(request);
            const response = await this.authPromise;
            this.authed = true;
            await this.processResponse(response);
        } catch { }
    }

    async submit() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    private async enable() {
        const request = new UpdateTwoFactorAuthenticatorRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.token = this.token;
        request.key = this.key;
        try {
            this.formPromise = this.apiService.putTwoFactorAuthenticator(request);
            const response = await this.formPromise;
            await this.processResponse(response);
            this.analytics.eventTrack.next({ action: 'Enabled Two-step Authenticator' });
            this.onUpdated.emit(true);
        } catch { }
    }

    private async disable() {
        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('twoStepDisableDesc'),
            this.i18nService.t('disable'), this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }

        try {
            const request = new TwoFactorProviderRequest();
            request.masterPasswordHash = this.masterPasswordHash;
            request.type = TwoFactorProviderType.Authenticator;
            this.formPromise = this.apiService.putTwoFactorDisable(request);
            await this.formPromise;
            this.enabled = false;
            this.analytics.eventTrack.next({ action: 'Disabled Two-step Authenticator' });
            this.toasterService.popAsync('success', null, this.i18nService.t('twoStepDisabled'));
            this.onUpdated.emit(false);
        } catch { }
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
