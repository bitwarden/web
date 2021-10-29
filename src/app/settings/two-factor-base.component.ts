import {
    Directive,
    EventEmitter,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { TwoFactorProviderType } from 'jslib-common/enums/twoFactorProviderType';
import { VerificationType } from 'jslib-common/enums/verificationType';

import { PasswordVerificationRequest, Verification } from 'jslib-common/models/request/passwordVerificationRequest';
import { TwoFactorProviderRequest } from 'jslib-common/models/request/twoFactorProviderRequest';

@Directive()
export abstract class TwoFactorBaseComponent {
    @Output() onUpdated = new EventEmitter<boolean>();

    type: TwoFactorProviderType;
    organizationId: string;
    twoFactorProviderType = TwoFactorProviderType;
    verification: Verification;
    enabled = false;
    authed = false;

    constructor(protected apiService: ApiService, protected i18nService: I18nService,
        protected toasterService: ToasterService, protected platformUtilsService: PlatformUtilsService,
        protected logService: LogService) { }

    protected auth(authResponse: any) {
        this.verification = authResponse.verification;
        this.authed = true;
    }

    protected async enable(enableFunction: () => Promise<void>) {
        try {
            await enableFunction();
            this.onUpdated.emit(true);
        } catch (e) {
            this.logService.error(e);
        }
    }

    protected async disable(promise: Promise<any>) {
        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('twoStepDisableDesc'),
            this.i18nService.t('disable'), this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }

        try {
            const request = new TwoFactorProviderRequest(this.verification);
            request.type = this.type;
            if (this.organizationId != null) {
                promise = this.apiService.putTwoFactorOrganizationDisable(this.organizationId, request);
            } else {
                promise = this.apiService.putTwoFactorDisable(request);
            }
            await promise;
            this.enabled = false;
            this.toasterService.popAsync('success', null, this.i18nService.t('twoStepDisabled'));
            this.onUpdated.emit(false);
        }  catch (e) {
            this.logService.error(e);
        }
    }
}
