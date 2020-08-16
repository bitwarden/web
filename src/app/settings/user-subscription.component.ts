import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { SubscriptionResponse } from 'jslib/models/response/subscriptionResponse';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';

@Component({
    selector: 'app-user-subscription',
    templateUrl: 'user-subscription.component.html',
})
export class UserSubscriptionComponent implements OnInit {
    loading = false;
    firstLoaded = false;
    adjustStorageAdd = true;
    showAdjustStorage = false;
    showUpdateLicense = false;
    sub: SubscriptionResponse;
    selfHosted = false;

    cancelPromise: Promise<any>;
    reinstatePromise: Promise<any>;

    constructor(
        private tokenService: TokenService,
        private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private router: Router
    ) {
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

        if (this.tokenService.getPremium()) {
            this.loading = true;
            this.sub = await this.apiService.getUserSubscription();
        } else {
            this.router.navigate(['/settings/premium']);
            return;
        }

        this.loading = false;
    }

    async reinstate() {
        if (this.loading) {
            return;
        }

        if (this.usingInAppPurchase) {
            this.platformUtilsService.showDialog(
                this.i18nService.t('manageSubscriptionFromStore'),
                this.i18nService.t('cancelSubscription'),
                null,
                null,
                'warning'
            );
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('reinstateConfirmation'),
            this.i18nService.t('reinstateSubscription'),
            this.i18nService.t('yes'),
            this.i18nService.t('cancel')
        );
        if (!confirmed) {
            return;
        }

        try {
            this.reinstatePromise = this.apiService.postReinstatePremium();
            await this.reinstatePromise;
            this.analytics.eventTrack.next({ action: 'Reinstated Premium' });
            this.toasterService.popAsync('success', null, this.i18nService.t('reinstated'));
            this.load();
        } catch {}
    }

    async cancel() {
        if (this.loading) {
            return;
        }

        if (this.usingInAppPurchase) {
            this.platformUtilsService.showDialog(
                this.i18nService.t('manageSubscriptionFromStore'),
                this.i18nService.t('cancelSubscription'),
                null,
                null,
                'warning'
            );
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('cancelConfirmation'),
            this.i18nService.t('cancelSubscription'),
            this.i18nService.t('yes'),
            this.i18nService.t('no'),
            'warning'
        );
        if (!confirmed) {
            return;
        }

        try {
            this.cancelPromise = this.apiService.postCancelPremium();
            await this.cancelPromise;
            this.analytics.eventTrack.next({ action: 'Canceled Premium' });
            this.toasterService.popAsync(
                'success',
                null,
                this.i18nService.t('canceledSubscription')
            );
            this.load();
        } catch {}
    }

    downloadLicense() {
        if (this.loading) {
            return;
        }

        const licenseString = JSON.stringify(this.sub.license, null, 2);
        this.platformUtilsService.saveFile(
            window,
            licenseString,
            null,
            'bitwarden_premium_license.json'
        );
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
        if (this.usingInAppPurchase) {
            this.platformUtilsService.showDialog(
                this.i18nService.t('cannotPerformInAppPurchase'),
                this.i18nService.t(add ? 'addStorage' : 'removeStorage'),
                null,
                null,
                'warning'
            );
            return;
        }
        this.adjustStorageAdd = add;
        this.showAdjustStorage = true;
    }

    closeStorage(load: boolean) {
        this.showAdjustStorage = false;
        if (load) {
            this.load();
        }
    }

    get subscriptionMarkedForCancel() {
        return (
            this.subscription != null &&
            !this.subscription.cancelled &&
            this.subscription.cancelAtEndDate
        );
    }

    get subscription() {
        return this.sub != null ? this.sub.subscription : null;
    }

    get nextInvoice() {
        return this.sub != null ? this.sub.upcomingInvoice : null;
    }

    get storagePercentage() {
        return this.sub != null && this.sub.maxStorageGb
            ? +(100 * (this.sub.storageGb / this.sub.maxStorageGb)).toFixed(2)
            : 0;
    }

    get storageProgressWidth() {
        return this.storagePercentage < 5 ? 5 : 0;
    }

    get usingInAppPurchase() {
        return this.sub != null ? this.sub.usingInAppPurchase : false;
    }
}
