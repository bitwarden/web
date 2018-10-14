import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

const Keys = {
    stripeTest: 'pk_test_KPoCfZXu7mznb9uSCPZ2JpTD',
    stripeLive: 'pk_live_bpN0P37nMxrMQkcaHXtAybJk',
    btSandbox: 'sandbox_r72q8jq6_9pnxkwm75f87sdc2',
    btProduction: 'production_qfbsv8kc_njj2zjtyngtjmbjd',
};

@Component({
    selector: 'app-payment',
    templateUrl: 'payment.component.html',
})
export class PaymentComponent implements OnInit {
    @Input() showOptions = true;
    @Input() method: 'card' | 'paypal' | 'bank' = 'card';
    @Input() hideBank = false;
    @Input() hidePaypal = false;

    card: any = {
        number: null,
        exp_month: null,
        exp_year: null,
        address_country: '',
        address_zip: null,
    };
    bank: any = {
        routing_number: null,
        account_number: null,
        account_holder_name: null,
        account_holder_type: '',
        currency: 'USD',
        country: 'US',
    };
    cardExpMonthOptions: any[];
    cardExpYearOptions: any[];

    private stripeScript: HTMLScriptElement;
    private btScript: HTMLScriptElement;
    private btInstance: any = null;

    constructor(i18nService: I18nService, private platformUtilsService: PlatformUtilsService) {
        this.stripeScript = window.document.createElement('script');
        this.stripeScript.src = 'https://js.stripe.com/v2/';
        this.stripeScript.async = true;
        this.stripeScript.onload = () => {
            (window as any).Stripe.setPublishableKey(
                this.platformUtilsService.isDev() ? Keys.stripeTest : Keys.stripeLive);
        };
        this.btScript = window.document.createElement('script');
        this.btScript.src = 'scripts/dropin.js';
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
        for (let i = year; i < (year + 15); i++) {
            this.cardExpYearOptions.push({ name: i.toString(), value: i.toString().slice(-2) });
        }
    }

    ngOnInit() {
        if (!this.showOptions) {
            this.hidePaypal = this.method !== 'paypal';
            this.hideBank = this.method !== 'bank';
        }
        window.document.head.appendChild(this.stripeScript);
        if (!this.hidePaypal) {
            window.document.head.appendChild(this.btScript);
        }
    }

    ngOnDestroy() {
        window.document.head.removeChild(this.stripeScript);
        Array.from(window.document.querySelectorAll('iframe')).forEach((el) => {
            if (el.src != null && el.src.indexOf('stripe') > -1) {
                window.document.body.removeChild(el);
            }
        });
        if (!this.hidePaypal) {
            window.document.head.removeChild(this.btScript);
            const btStylesheet = window.document.head.querySelector('#braintree-dropin-stylesheet');
            if (btStylesheet != null) {
                window.document.head.removeChild(btStylesheet);
            }
        }
    }

    changeMethod() {
        if (this.method !== 'paypal') {
            this.btInstance = null;
            return;
        }

        window.setTimeout(() => {
            (window as any).braintree.dropin.create({
                authorization: this.platformUtilsService.isDev() ? Keys.btSandbox : Keys.btProduction,
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
                    // tslint:disable-next-line
                    console.error(createErr);
                    return;
                }
                this.btInstance = instance;
            });
        }, 250);
    }

    createPaymentToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.method === 'paypal') {
                this.btInstance.requestPaymentMethod().then((payload: any) => {
                    resolve(payload.nonce);
                }).catch((err: any) => {
                    reject(err.message);
                });
            } else if (this.method === 'card' || this.method === 'bank') {
                const createObj: any = this.method === 'card' ? (window as any).Stripe.card :
                    (window as any).Stripe.bankAccount;
                const sourceObj = this.method === 'card' ? this.card : this.bank;
                createObj.createToken(sourceObj, (status: number, response: any) => {
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

    getCountry(): string {
        return this.card.address_country;
    }
}
