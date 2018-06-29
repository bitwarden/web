import {
    Component,
    EventEmitter,
    Output,
    ViewChild,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { PaymentComponent } from './payment.component';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent {
    @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;
    @Output() onPremiumPurchased = new EventEmitter();

    premiumPrice = 10;
    storageGbPrice = 4;
    additionalStorage = 0;

    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) { }

    async submit() {
        try {
            this.formPromise = this.paymentComponent.createPaymentToken().then((token) => {
                const fd = new FormData();
                fd.append('paymentToken', token);
                fd.append('additionalStorageGb', (this.additionalStorage || 0).toString());
                return this.apiService.postPremium(fd);
            }).then(() => {
                return this.finalizePremium();
            });
            await this.formPromise;
        } catch { }
    }

    get additionalStorageTotal(): number {
        return this.storageGbPrice * this.additionalStorage;
    }

    get total(): number {
        return this.additionalStorageTotal + this.premiumPrice;
    }

    private async finalizePremium() {
        await this.apiService.refreshIdentityToken();
        this.analytics.eventTrack.next({ action: 'Signed Up Premium' });
        this.toasterService.popAsync('success', null, this.i18nService.t('premiumUpdated'));
        this.onPremiumPurchased.emit();
    }
}
