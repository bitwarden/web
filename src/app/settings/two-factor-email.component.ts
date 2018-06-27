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

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';
import { UpdateTwoFactorEmailRequest } from 'jslib/models/request/updateTwoFactorEmailRequest';
import { TwoFactorEmailResponse } from 'jslib/models/response/twoFactorEmailResponse';
import { TwoFactorEmailRequest } from 'jslib/models/request';

@Component({
    selector: 'app-two-factor-email',
    templateUrl: 'two-factor-email.component.html',
})
export class TwoFactorEmailComponent {
    @Output() onUpdated = new EventEmitter<boolean>();

    enabled = false;
    authed = false;
    email: string;
    token: string;
    masterPassword: string;
    sentEmail: string;

    authPromise: Promise<any>;
    formPromise: Promise<any>;
    emailPromise: Promise<any>;

    private masterPasswordHash: string;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private cryptoService: CryptoService, private platformUtilsService: PlatformUtilsService,
        private userService: UserService) { }

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
            this.authPromise = this.apiService.getTwoFactorEmail(request);
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

    async sendEmail() {
        try {
            const request = new TwoFactorEmailRequest(this.email, this.masterPasswordHash);
            this.emailPromise = this.apiService.postTwoFactorEmailSetup(request);
            await this.emailPromise;
            this.sentEmail = this.email;
        } catch { }
    }

    private async enable() {
        const request = new UpdateTwoFactorEmailRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.email = this.email;
        request.token = this.token;
        try {
            this.formPromise = this.apiService.putTwoFactorEmail(request);
            const response = await this.formPromise;
            await this.processResponse(response);
            this.analytics.eventTrack.next({ action: 'Enabled Two-step Email' });
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
            request.type = TwoFactorProviderType.Email;
            this.formPromise = this.apiService.putTwoFactorDisable(request);
            await this.formPromise;
            this.enabled = false;
            this.analytics.eventTrack.next({ action: 'Disabled Two-step Email' });
            this.toasterService.popAsync('success', null, this.i18nService.t('twoStepDisabled'));
            this.onUpdated.emit(false);
        } catch { }
    }

    private async processResponse(response: TwoFactorEmailResponse) {
        this.token = null;
        this.email = response.email;
        this.enabled = response.enabled;
        if (!this.enabled && (this.email == null || this.email === '')) {
            this.email = await this.userService.getEmail();
        }
    }
}
