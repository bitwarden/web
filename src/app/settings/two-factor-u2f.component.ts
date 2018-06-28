import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';
import { UpdateTwoFactorU2fRequest } from 'jslib/models/request/updateTwoFactorU2fRequest';
import { TwoFactorU2fResponse } from 'jslib/models/response/twoFactorU2fResponse';

import { TwoFactorBaseComponent } from './two-factor-base.component';

@Component({
    selector: 'app-two-factor-u2f',
    templateUrl: 'two-factor-u2f.component.html',
})
export class TwoFactorU2fComponent extends TwoFactorBaseComponent implements OnInit, OnDestroy {
    u2fChallenge: any;
    u2fError: boolean;
    u2fListening: boolean;
    u2fResponse: string;
    formPromise: Promise<any>;

    private closed = false;
    private u2fScript: HTMLScriptElement;

    constructor(apiService: ApiService, i18nService: I18nService,
        analytics: Angulartics2, toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService) {
        super(apiService, i18nService, analytics, toasterService, platformUtilsService,
            TwoFactorProviderType.U2f);
        this.u2fScript = window.document.createElement('script');
        this.u2fScript.src = 'scripts/u2f.js';
        this.u2fScript.async = true;
    }

    ngOnInit() {
        window.document.body.appendChild(this.u2fScript);
    }

    ngOnDestroy() {
        this.closed = true;
        window.document.body.removeChild(this.u2fScript);
    }

    auth(authResponse: any) {
        super.auth(authResponse);
        this.processResponse(authResponse.response);
        this.readDevice();
    }

    submit() {
        if (this.enabled) {
            return super.disable(this.formPromise);
        } else {
            return this.enable();
        }
    }

    protected enable() {
        const request = new UpdateTwoFactorU2fRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.deviceResponse = this.u2fResponse;

        return super.enable(async () => {
            this.formPromise = this.apiService.putTwoFactorU2f(request);
            const response = await this.formPromise;
            await this.processResponse(response);
        });
    }

    private readDevice() {
        if (this.closed || this.enabled) {
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

    private processResponse(response: TwoFactorU2fResponse) {
        this.u2fChallenge = response.challenge;
        this.enabled = response.enabled;
    }
}
