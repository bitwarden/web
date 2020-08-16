import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { TwoFactorEmailRequest } from 'jslib/models/request/twoFactorEmailRequest';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';
import { UpdateTwoFactorEmailRequest } from 'jslib/models/request/updateTwoFactorEmailRequest';
import { TwoFactorEmailResponse } from 'jslib/models/response/twoFactorEmailResponse';

import { TwoFactorBaseComponent } from './two-factor-base.component';

@Component({
    selector: 'app-two-factor-email',
    templateUrl: 'two-factor-email.component.html',
})
export class TwoFactorEmailComponent extends TwoFactorBaseComponent {
    type = TwoFactorProviderType.Email;
    email: string;
    token: string;
    sentEmail: string;
    formPromise: Promise<any>;
    emailPromise: Promise<any>;

    constructor(
        apiService: ApiService,
        i18nService: I18nService,
        analytics: Angulartics2,
        toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService,
        private userService: UserService
    ) {
        super(apiService, i18nService, analytics, toasterService, platformUtilsService);
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

    async sendEmail() {
        try {
            const request = new TwoFactorEmailRequest(this.email, this.masterPasswordHash);
            this.emailPromise = this.apiService.postTwoFactorEmailSetup(request);
            await this.emailPromise;
            this.sentEmail = this.email;
        } catch {}
    }

    protected enable() {
        const request = new UpdateTwoFactorEmailRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.email = this.email;
        request.token = this.token;

        return super.enable(async () => {
            this.formPromise = this.apiService.putTwoFactorEmail(request);
            const response = await this.formPromise;
            await this.processResponse(response);
        });
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
