import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
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
import { UpdateTwoFactorU2fRequest } from 'jslib/models/request/updateTwoFactorU2fRequest';
import { TwoFactorU2fResponse } from 'jslib/models/response/twoFactorU2fResponse';

@Component({
    selector: 'app-two-factor-u2f',
    templateUrl: 'two-factor-u2f.component.html',
})
export class TwoFactorU2fComponent implements OnInit, OnDestroy {
    @Output() onUpdated = new EventEmitter<boolean>();

    enabled = false;
    authed = false;
    u2fChallenge: any;
    u2fError: boolean;
    u2fListening: boolean;
    u2fResponse: string;
    masterPassword: string;
    u2fScript: HTMLScriptElement;

    authPromise: Promise<any>;
    formPromise: Promise<any>;

    private masterPasswordHash: string;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private cryptoService: CryptoService, private platformUtilsService: PlatformUtilsService) {
        this.u2fScript = window.document.createElement('script');
        this.u2fScript.src = 'scripts/u2f.js';
        this.u2fScript.async = true;
    }

    ngOnInit() {
        window.document.body.appendChild(this.u2fScript);
    }

    ngOnDestroy() {
        window.document.body.removeChild(this.u2fScript);
    }

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
            this.authPromise = this.apiService.getTwoFactorU2f(request);
            const response = await this.authPromise;
            this.authed = true;
            await this.processResponse(response);
            this.readDevice();
        } catch { }
    }

    async submit() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    private readDevice() {
        if (this.enabled) {
            return;
        }

        // tslint:disable-next-line
        console.log('listening for key...');

        this.u2fResponse = null;
        this.u2fError = false;
        this.u2fListening = true;

        (window as any).u2f.register(this.u2fChallenge.AppId, [{
            version: this.u2fChallenge.Version,
            challenge: this.u2fChallenge.Challenge,
        }], [], (data: any) => {
            this.u2fListening = false;
            if (data.errorCode === 5) {
                this.readDevice();
                return;
            } else if (data.errorCode) {
                this.u2fError = true;
                // tslint:disable-next-line
                console.log('error: ' + data.errorCode);
                return;
            }
            this.u2fResponse = JSON.stringify(data);
        }, 10);
    }

    private async enable() {
        const request = new UpdateTwoFactorU2fRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.deviceResponse = this.u2fResponse;
        try {
            this.formPromise = this.apiService.putTwoFactorU2f(request);
            const response = await this.formPromise;
            await this.processResponse(response);
            this.analytics.eventTrack.next({ action: 'Enabled Two-step U2F' });
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
            request.type = TwoFactorProviderType.U2f;
            this.formPromise = this.apiService.putTwoFactorDisable(request);
            await this.formPromise;
            this.enabled = false;
            this.analytics.eventTrack.next({ action: 'Disabled Two-step U2F' });
            this.toasterService.popAsync('success', null, this.i18nService.t('twoStepDisabled'));
            this.onUpdated.emit(false);
        } catch { }
    }

    private async processResponse(response: TwoFactorU2fResponse) {
        this.u2fChallenge = response.challenge;
        this.enabled = response.enabled;
    }
}
