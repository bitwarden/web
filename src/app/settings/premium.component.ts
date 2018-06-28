import {
    Component,
    OnInit,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent implements OnInit {
    premiumPrice = 10;
    storageGbPrice = 4;
    additionalStorage = 0;
    method = 'card';
    card: any = {
        number: null,
        exp_month: null,
        exp_year: null,
        address_country: '',
        address_zip: null,
    };
    formPromise: Promise<any>;
    cardExpMonthOptions: any[];
    cardExpYearOptions: any[];

    private stripeScript: HTMLScriptElement;
    private btScript: HTMLScriptElement;
    private btInstance: any = null;

    constructor(private i18nService: I18nService) {
        this.stripeScript = window.document.createElement('script');
        this.stripeScript.src = 'https://js.stripe.com/v2/';
        this.stripeScript.async = true;
        this.stripeScript.onload = () => {
            (window as any).Stripe.setPublishableKey('pk_test_KPoCfZXu7mznb9uSCPZ2JpTD');
        };
        this.btScript = window.document.createElement('script');
        this.btScript.src = 'https://js.braintreegateway.com/web/dropin/1.4.0/js/dropin.min.js';
        this.btScript.async = true;

        this.cardExpMonthOptions = [
            { name: '-- ' + i18nService.t('select') + ' --', value: null },
            { name: '01 - ' + i18nService.t('january'), value: '01' },
            { name: '02 - ' + i18nService.t('february'), value: '02' },
            { name: '03 - ' + i18nService.t('march'), value: '03' },
            { name: '04 - ' + i18nService.t('april'), value: '04' },
            { name: '05 - ' + i18nService.t('may'), value: '05' },
            { name: '06 - ' + i18nService.t('june'), value: '06' },
            { name: '07 - ' + i18nService.t('july'), value: '07' },
            { name: '08 - ' + i18nService.t('august'), value: '08' },
            { name: '09 - ' + i18nService.t('september'), value: '09' },
            { name: '10 - ' + i18nService.t('october'), value: '10' },
            { name: '11 - ' + i18nService.t('november'), value: '11' },
            { name: '12 - ' + i18nService.t('december'), value: '12' },
        ];

        this.cardExpYearOptions = [
            { name: '-- ' + i18nService.t('select') + ' --', value: null },
        ];
        const year = (new Date()).getFullYear();
        for (let i = year; i < (year + 10); i++) {
            this.cardExpYearOptions.push({ name: i.toString(), value: i.toString().slice(-2) });
        }
    }

    ngOnInit() {
        window.document.body.appendChild(this.stripeScript);
        window.document.body.appendChild(this.btScript);
    }

    ngOnDestroy() {
        window.document.body.removeChild(this.stripeScript);
        window.document.body.removeChild(this.btScript);
        Array.from(window.document.querySelectorAll('iframe')).forEach((el) => {
            if (el.src != null && el.src.indexOf('stripe') > -1) {
                window.document.body.removeChild(el);
            }
        });
    }

    async submit() {
        try {
            const token = await this.createPaymentToken();
        } catch (e) {

        }
    }

    changeMethod() {
        if (this.method !== 'paypal') {
            this.btInstance = null;
            return;
        }

        window.setTimeout(() => {
            (window as any).braintree.dropin.create({
                authorization: 'sandbox_r72q8jq6_9pnxkwm75f87sdc2',
                container: '#bt-dropin-container',
                paymentOptionPriority: ['paypal'],
                paypal: {
                    flow: 'vault',
                    buttonStyle: {
                        label: 'pay',
                        size: 'medium',
                        shape: 'pill',
                        color: 'blue',
                    },
                },
            }, (createErr: any, instance: any) => {
                if (createErr != null) {
                    console.error(createErr);
                    return;
                }
                this.btInstance = instance;
            });
        }, 250);
    }

    get additionalStorageTotal(): number {
        return this.storageGbPrice * this.additionalStorage;
    }

    get total(): number {
        return this.additionalStorageTotal + this.premiumPrice;
    }

    private createPaymentToken() {
        return new Promise((resolve, reject) => {
            if (this.method === 'paypal') {
                this.btInstance.requestPaymentMethod().then((payload: any) => {
                    resolve(payload.nonce);
                }).catch((err: any) => {
                    reject(err.message);
                });
            } else {
                (window as any).Stripe.card.createToken(this.card, (status: number, response: any) => {
                    if (status === 200 && response.id != null) {
                        resolve(response.id);
                    } else if (response.error != null) {
                        reject(response.error.message);
                    } else {
                        reject();
                    }
                });
            }
        });
    }
}
