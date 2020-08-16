import { Directive, EventEmitter, Output } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';
import { TwoFactorProviderRequest } from 'jslib/models/request/twoFactorProviderRequest';

@Directive()
export abstract class TwoFactorBaseComponent {
    @Output() onUpdated = new EventEmitter<boolean>();

    type: TwoFactorProviderType;
    organizationId: string;
    twoFactorProviderType = TwoFactorProviderType;
    enabled = false;
    authed = false;

    protected masterPasswordHash: string;

    constructor(
        protected apiService: ApiService,
        protected i18nService: I18nService,
        protected analytics: Angulartics2,
        protected toasterService: ToasterService,
        protected platformUtilsService: PlatformUtilsService
    ) {}

    protected auth(authResponse: any) {
        this.masterPasswordHash = authResponse.masterPasswordHash;
        this.authed = true;
    }

    protected async enable(enableFunction: () => Promise<void>) {
        try {
            await enableFunction();
            this.analytics.eventTrack.next({
                action: 'Enabled Two-step ' + TwoFactorProviderType[this.type].toString(),
            });
            this.onUpdated.emit(true);
        } catch {}
    }

    protected async disable(promise: Promise<any>) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('twoStepDisableDesc'),
            this.i18nService.t('disable'),
            this.i18nService.t('yes'),
            this.i18nService.t('no'),
            'warning'
        );
        if (!confirmed) {
            return;
        }

        try {
            const request = new TwoFactorProviderRequest();
            request.masterPasswordHash = this.masterPasswordHash;
            request.type = this.type;
            if (this.organizationId != null) {
                promise = this.apiService.putTwoFactorOrganizationDisable(
                    this.organizationId,
                    request
                );
            } else {
                promise = this.apiService.putTwoFactorDisable(request);
            }
            await promise;
            this.enabled = false;
            this.analytics.eventTrack.next({
                action: 'Disabled Two-step ' + TwoFactorProviderType[this.type].toString(),
            });
            this.toasterService.popAsync('success', null, this.i18nService.t('twoStepDisabled'));
            this.onUpdated.emit(false);
        } catch {}
    }
}
