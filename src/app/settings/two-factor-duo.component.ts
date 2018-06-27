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

import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';
import { TwoFactorProviderRequest } from 'jslib/models/request/twoFactorProviderRequest';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';
import { UpdateTwoFactorDuoRequest } from 'jslib/models/request/updateTwoFactorDuoRequest';
import { TwoFactorDuoResponse } from 'jslib/models/response/twoFactorDuoResponse';

@Component({
    selector: 'app-two-factor-duo',
    templateUrl: 'two-factor-duo.component.html',
})
export class TwoFactorDuoComponent {
    @Output() onUpdated = new EventEmitter<boolean>();

    enabled = false;
    authed = false;
    ikey: string;
    skey: string;
    host: string;
    masterPassword: string;

    authPromise: Promise<any>;
    formPromise: Promise<any>;

    private masterPasswordHash: string;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private cryptoService: CryptoService, private platformUtilsService: PlatformUtilsService) { }

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
            this.authPromise = this.apiService.getTwoFactorDuo(request);
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
        const request = new UpdateTwoFactorDuoRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.integrationKey = this.ikey;
        request.secretKey = this.skey;
        request.host = this.host;
        try {
            this.formPromise = this.apiService.putTwoFactorDuo(request);
            const response = await this.formPromise;
            await this.processResponse(response);
            this.analytics.eventTrack.next({ action: 'Enabled Two-step Duo' });
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
            request.type = TwoFactorProviderType.Duo;
            this.formPromise = this.apiService.putTwoFactorDisable(request);
            await this.formPromise;
            this.enabled = false;
            this.analytics.eventTrack.next({ action: 'Disabled Two-step Duo' });
            this.toasterService.popAsync('success', null, this.i18nService.t('twoStepDisabled'));
            this.onUpdated.emit(false);
        } catch { }
    }

    private async processResponse(response: TwoFactorDuoResponse) {
        this.ikey = response.integrationKey;
        this.skey = response.secretKey;
        this.host = response.host;
        this.enabled = response.enabled;
    }
}
