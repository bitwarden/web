import {
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { PaymentComponent } from './payment.component';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent implements OnInit {
    @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;

    selfHosted = false;
    premiumPrice = 10;
    storageGbPrice = 4;
    additionalStorage = 0;

    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService, private tokenService: TokenService,
        private router: Router, private messagingService: MessagingService) {
        this.selfHosted = platformUtilsService.isSelfHost();
    }

    async ngOnInit() {
        const premium = await this.tokenService.getPremium();
        if (premium) {
            this.router.navigate(['/settings/billing']);
            return;
        }
    }

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

    async finalizePremium() {
        await this.apiService.refreshIdentityToken();
        this.analytics.eventTrack.next({ action: 'Signed Up Premium' });
        this.toasterService.popAsync('success', null, this.i18nService.t('premiumUpdated'));
        this.messagingService.send('purchasedPremium');
        this.router.navigate(['/settings/billing']);
    }

    get additionalStorageTotal(): number {
        return this.storageGbPrice * this.additionalStorage;
    }

    get total(): number {
        return this.additionalStorageTotal + this.premiumPrice;
    }
}
