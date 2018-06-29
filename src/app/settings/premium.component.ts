import {
    Component,
    ViewChild,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';

import { PaymentComponent } from './payment.component';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent {
    @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;

    premiumPrice = 10;
    storageGbPrice = 4;
    additionalStorage = 0;

    constructor(private i18nService: I18nService) { }

    async submit() {
        try {
            const token = await this.paymentComponent.createPaymentToken();
            console.log(token);
        } catch (e) {
            console.log(e);
        }
    }

    get additionalStorageTotal(): number {
        return this.storageGbPrice * this.additionalStorage;
    }

    get total(): number {
        return this.additionalStorageTotal + this.premiumPrice;
    }
}
