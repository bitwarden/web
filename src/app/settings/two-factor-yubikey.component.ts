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
import { UpdateTwoFactorYubioOtpRequest } from 'jslib/models/request/updateTwoFactorYubioOtpRequest';
import { TwoFactorYubiKeyResponse } from 'jslib/models/response/twoFactorYubiKeyResponse';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

@Component({
    selector: 'app-two-factor-yubikey',
    templateUrl: 'two-factor-yubikey.component.html',
})
export class TwoFactorYubiKeyComponent {
    @Output() onUpdated = new EventEmitter<boolean>();

    enabled = false;
    authed = false;
    keys: any[];
    nfc = false;
    masterPassword: string;

    authPromise: Promise<TwoFactorYubiKeyResponse>;
    formPromise: Promise<any>;
    disablePromise: Promise<any>;

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
            this.authPromise = this.apiService.getTwoFactorYubiKey(request);
            const response = await this.authPromise;
            this.authed = true;
            this.processResponse(response);
        } catch { }
    }

    async submit() {
        const request = new UpdateTwoFactorYubioOtpRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.key1 = this.keys != null && this.keys.length > 0 ? this.keys[0].key : null;
        request.key2 = this.keys != null && this.keys.length > 1 ? this.keys[1].key : null;
        request.key3 = this.keys != null && this.keys.length > 2 ? this.keys[2].key : null;
        request.key4 = this.keys != null && this.keys.length > 3 ? this.keys[3].key : null;
        request.key5 = this.keys != null && this.keys.length > 4 ? this.keys[4].key : null;
        request.nfc = this.nfc;
        try {
            this.formPromise = this.apiService.putTwoFactorYubiKey(request);
            const response = await this.formPromise;
            await this.processResponse(response);
            this.analytics.eventTrack.next({ action: 'Enabled Two-step YubiKey' });
            this.processResponse(response);
            this.toasterService.popAsync('success', null, this.i18nService.t('yubikeysUpdated'));
            this.onUpdated.emit(true);
        } catch { }
    }

    async disable() {
        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('twoStepDisableDesc'),
            this.i18nService.t('disable'), this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }

        try {
            const request = new TwoFactorProviderRequest();
            request.masterPasswordHash = this.masterPasswordHash;
            request.type = TwoFactorProviderType.Yubikey;
            this.disablePromise = this.apiService.putTwoFactorDisable(request);
            await this.disablePromise;
            this.enabled = false;
            this.analytics.eventTrack.next({ action: 'Disabled Two-step YubiKey' });
            this.toasterService.popAsync('success', null, this.i18nService.t('twoStepDisabled'));
            this.onUpdated.emit(false);
        } catch { }
    }

    remove(key: any) {
        key.existingKey = null;
        key.key = null;
    }

    private processResponse(response: TwoFactorYubiKeyResponse) {
        this.enabled = response.enabled;
        this.keys = [
            { key: response.key1, existingKey: this.padRight(response.key1) },
            { key: response.key2, existingKey: this.padRight(response.key2) },
            { key: response.key3, existingKey: this.padRight(response.key3) },
            { key: response.key4, existingKey: this.padRight(response.key4) },
            { key: response.key5, existingKey: this.padRight(response.key5) },
        ];
        this.nfc = response.nfc || !response.enabled;
    }

    private padRight(str: string, character = '•', size = 44) {
        if (str == null || character == null || str.length >= size) {
            return str;
        }
        const max = (size - str.length) / character.length;
        for (let i = 0; i < max; i++) {
            str += character;
        }
        return str;
    }
}
