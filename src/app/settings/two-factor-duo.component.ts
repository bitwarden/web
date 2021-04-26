import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { TwoFactorProviderType } from 'jslib-common/enums/twoFactorProviderType';
import { UpdateTwoFactorDuoRequest } from 'jslib-common/models/request/updateTwoFactorDuoRequest';
import { TwoFactorDuoResponse } from 'jslib-common/models/response/twoFactorDuoResponse';

import { TwoFactorBaseComponent } from './two-factor-base.component';

@Component({
    selector: 'app-two-factor-duo',
    templateUrl: 'two-factor-duo.component.html',
})
export class TwoFactorDuoComponent extends TwoFactorBaseComponent {
    type = TwoFactorProviderType.Duo;
    ikey: string;
    skey: string;
    host: string;
    formPromise: Promise<any>;

    constructor(apiService: ApiService, i18nService: I18nService,
        toasterService: ToasterService, platformUtilsService: PlatformUtilsService) {
        super(apiService, i18nService, toasterService, platformUtilsService);
    }

    auth(authResponse: any) {
        super.auth(authResponse);
        this.processResponse(authResponse.response);
    }

    submit() {
        if (this.enabled) {
            return super.disable(this.formPromise);
        } else {
            return this.enable();
        }
    }

    protected enable() {
        const request = new UpdateTwoFactorDuoRequest();
        request.masterPasswordHash = this.masterPasswordHash;
        request.integrationKey = this.ikey;
        request.secretKey = this.skey;
        request.host = this.host;

        return super.enable(async () => {
            if (this.organizationId != null) {
                this.formPromise = this.apiService.putTwoFactorOrganizationDuo(this.organizationId, request);
            } else {
                this.formPromise = this.apiService.putTwoFactorDuo(request);
            }
            const response = await this.formPromise;
            await this.processResponse(response);
        });
    }

    private processResponse(response: TwoFactorDuoResponse) {
        this.ikey = response.integrationKey;
        this.skey = response.secretKey;
        this.host = response.host;
        this.enabled = response.enabled;
    }
}
