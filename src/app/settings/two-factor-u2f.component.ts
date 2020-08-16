import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { PasswordVerificationRequest } from 'jslib/models/request/passwordVerificationRequest';
import { UpdateTwoFactorU2fDeleteRequest } from 'jslib/models/request/updateTwoFactorU2fDeleteRequest';
import { UpdateTwoFactorU2fRequest } from 'jslib/models/request/updateTwoFactorU2fRequest';
import {
    ChallengeResponse,
    TwoFactorU2fResponse,
} from 'jslib/models/response/twoFactorU2fResponse';

import { TwoFactorBaseComponent } from './two-factor-base.component';

@Component({
    selector: 'app-two-factor-u2f',
    templateUrl: 'two-factor-u2f.component.html',
})
export class TwoFactorU2fComponent extends TwoFactorBaseComponent implements OnInit, OnDestroy {
    type = TwoFactorProviderType.U2f;
    name: string;
    keys: any[];
    keyIdAvailable: number = null;
    keysConfiguredCount = 0;
    u2fError: boolean;
    u2fListening: boolean;
    u2fResponse: string;
    challengePromise: Promise<ChallengeResponse>;
    formPromise: Promise<any>;

    private u2fScript: HTMLScriptElement;

    constructor(
        apiService: ApiService,
        i18nService: I18nService,
        analytics: Angulartics2,
        toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService,
        private ngZone: NgZone
    ) {
        super(apiService, i18nService, analytics, toasterService, platformUtilsService);
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

    auth(authResponse: any) {
        super.auth(authResponse);
        this.processResponse(authResponse.response);
    }

    submit() {
        if (this.u2fResponse == null || this.keyIdAvailable == null) {
            // Should never happen.
            return Promise.reject();
        }
        const request = new UpdateTwoFactorU2fRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.deviceResponse = this.u2fResponse;
        request.id = this.keyIdAvailable;
        request.name = this.name;

        return super.enable(async () => {
            this.formPromise = this.apiService.putTwoFactorU2f(request);
            const response = await this.formPromise;
            await this.processResponse(response);
        });
    }

    disable() {
        return super.disable(this.formPromise);
    }

    async remove(key: any) {
        if (this.keysConfiguredCount <= 1 || key.removePromise != null) {
            return;
        }
        const name = key.name != null ? key.name : this.i18nService.t('u2fkeyX', key.id);
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('removeU2fConfirmation'),
            name,
            this.i18nService.t('yes'),
            this.i18nService.t('no'),
            'warning'
        );
        if (!confirmed) {
            return;
        }
        const request = new UpdateTwoFactorU2fDeleteRequest();
        request.id = key.id;
        request.masterPasswordHash = this.masterPasswordHash;
        try {
            key.removePromise = this.apiService.deleteTwoFactorU2f(request);
            const response = await key.removePromise;
            key.removePromise = null;
            await this.processResponse(response);
        } catch {}
    }

    async readKey() {
        if (this.keyIdAvailable == null) {
            return;
        }
        const request = new PasswordVerificationRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        try {
            this.challengePromise = this.apiService.getTwoFactorU2fChallenge(request);
            const challenge = await this.challengePromise;
            this.readDevice(challenge);
        } catch {}
    }

    private readDevice(u2fChallenge: ChallengeResponse) {
        // tslint:disable-next-line
        console.log('listening for key...');
        this.resetU2f(true);
        (window as any).u2f.register(
            u2fChallenge.appId,
            [
                {
                    version: u2fChallenge.version,
                    challenge: u2fChallenge.challenge,
                },
            ],
            [],
            (data: any) => {
                this.ngZone.run(() => {
                    this.u2fListening = false;
                    if (data.errorCode) {
                        this.u2fError = true;
                        // tslint:disable-next-line
                        console.log('error: ' + data.errorCode);
                        return;
                    }
                    this.u2fResponse = JSON.stringify(data);
                });
            },
            15
        );
    }

    private resetU2f(listening = false) {
        this.u2fResponse = null;
        this.u2fError = false;
        this.u2fListening = listening;
    }

    private processResponse(response: TwoFactorU2fResponse) {
        this.resetU2f();
        this.keys = [];
        this.keyIdAvailable = null;
        this.name = null;
        this.keysConfiguredCount = 0;
        for (let i = 1; i <= 5; i++) {
            if (response.keys != null) {
                const key = response.keys.filter((k) => k.id === i);
                if (key.length > 0) {
                    this.keysConfiguredCount++;
                    this.keys.push({
                        id: i,
                        name: key[0].name,
                        configured: true,
                        compromised: key[0].compromised,
                        removePromise: null,
                    });
                    continue;
                }
            }
            this.keys.push({
                id: i,
                name: null,
                configured: false,
                compromised: false,
                removePromise: null,
            });
            if (this.keyIdAvailable == null) {
                this.keyIdAvailable = i;
            }
        }
        this.enabled = response.enabled;
    }
}
