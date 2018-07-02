import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { BillingResponse } from 'jslib/models/response/billingResponse';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { PaymentMethodType } from 'jslib/enums/paymentMethodType';

@Component({
    selector: 'app-user-billing',
    templateUrl: 'user-billing.component.html',
})
export class UserBillingComponent implements OnInit {
    premium = false;
    loading = false;
    firstLoaded = false;
    adjustStorageAdd = true;
    showAdjustStorage = false;
    showAdjustPayment = false;
    showUpdateLicense = false;
    billing: BillingResponse;
    paymentMethodType = PaymentMethodType;
    selfHosted = false;

    cancelPromise: Promise<any>;
    reinstatePromise: Promise<any>;

    constructor(private tokenService: TokenService, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) {
        this.selfHosted = platformUtilsService.isSelfHost();
    }

    async ngOnInit() {
        await this.load();
        this.firstLoaded = true;
    }

    async load() {
        if (this.loading) {
            return;
        }

        this.premium = this.tokenService.getPremium();
        if (this.premium) {
            this.loading = true;
            this.billing = await this.apiService.getUserBilling();
        }
        this.loading = false;
    }

    async reinstate() {
        if (this.loading) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('reinstateConfirmation'),
            this.i18nService.t('reinstateSubscription'), this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (!confirmed) {
            return;
        }

        try {
            this.reinstatePromise = this.apiService.postReinstatePremium();
            await this.reinstatePromise;
            this.analytics.eventTrack.next({ action: 'Reinstated Premium' });
            this.toasterService.popAsync('success', null, this.i18nService.t('reinstated'));
            this.load();
        } catch { }
    }

    async cancel() {
        if (this.loading) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('cancelConfirmation'),
            this.i18nService.t('cancelSubscription'), this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }

        try {
            this.cancelPromise = this.apiService.postCancelPremium();
            await this.cancelPromise;
            this.analytics.eventTrack.next({ action: 'Canceled Premium' });
            this.toasterService.popAsync('success', null, this.i18nService.t('canceledSubscription'));
            this.load();
        } catch { }
    }

    downloadLicense() {
        if (this.loading) {
            return;
        }

        const licenseString = JSON.stringify(this.billing.license, null, 2);
        this.platformUtilsService.saveFile(window, licenseString, null, 'bitwarden_premium_license.json');
    }

    updateLicense() {
        if (this.loading) {
            return;
        }
        this.showUpdateLicense = true;
    }

    closeUpdateLicense(load: boolean) {
        this.showUpdateLicense = false;
        if (load) {
            this.load();
        }
    }

    adjustStorage(add: boolean) {
        this.adjustStorageAdd = add;
        this.showAdjustStorage = true;
    }

    closeStorage(load: boolean) {
        this.showAdjustStorage = false;
        if (load) {
            this.load();
        }
    }

    changePayment() {
        this.showAdjustPayment = true;
    }

    closePayment(load: boolean) {
        this.showAdjustPayment = false;
        if (load) {
            this.load();
        }
    }

    get subscriptionMarkedForCancel() {
        return this.subscription != null && !this.subscription.cancelled && this.subscription.cancelAtEndDate;
    }

    get subscription() {
        return this.billing != null ? this.billing.subscription : null;
    }

    get nextInvoice() {
        return this.billing != null ? this.billing.upcomingInvoice : null;
    }

    get paymentSource() {
        return this.billing != null ? this.billing.paymentSource : null;
    }

    get charges() {
        return this.billing != null ? this.billing.charges : null;
    }

    get storagePercentage() {
        return this.billing != null ? +(100 * (this.billing.storageGb / this.billing.maxStorageGb)).toFixed(2) : 0;
    }
}
