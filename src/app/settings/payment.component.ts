import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

const Keys = {
    stripeTest: 'pk_test_KPoCfZXu7mznb9uSCPZ2JpTD',
    stripeLive: 'pk_live_bpN0P37nMxrMQkcaHXtAybJk',
    btSandbox: 'sandbox_r72q8jq6_9pnxkwm75f87sdc2',
    btProduction: 'production_qfbsv8kc_njj2zjtyngtjmbjd',
};

const StripeElementStyle = {
    base: {
        color: '#333333',
        lineHeight: '21px',
        fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif, ' +
            '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        fontSize: '1rem',
        fontSmoothing: 'antialiased',
    },
    invalid: {
        color: '#333333',
    },
};

const StripeElementClasses = {
    focus: 'is-focused',
    empty: 'is-empty',
    invalid: 'is-invalid',
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

    bank: any = {
        routing_number: null,
        account_number: null,
        account_holder_name: null,
        account_holder_type: '',
        currency: 'USD',
        country: 'US',
    };

    private btScript: HTMLScriptElement;
    private btInstance: any = null;
    private stripeScript: HTMLScriptElement;
    private stripe: any = null;
    private stripeElements: any = null;
    private stripeCardNumberElement: any = null;
    private stripeCardExpiryElement: any = null;
    private stripeCardCvcElement: any = null;

    constructor(private platformUtilsService: PlatformUtilsService) {
        this.stripeScript = window.document.createElement('script');
        this.stripeScript.src = 'https://js.stripe.com/v3/';
        this.stripeScript.async = true;
        this.stripeScript.onload = () => {
            this.stripe = (window as any).Stripe(
                this.platformUtilsService.isDev() ? Keys.stripeTest : Keys.stripeLive);
            this.stripeElements = this.stripe.elements();
            this.setStripeElement();
        };
        this.btScript = window.document.createElement('script');
        this.btScript.src = 'scripts/dropin.js';
        this.btScript.async = true;
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
        window.setTimeout(() => {
            Array.from(window.document.querySelectorAll('iframe')).forEach((el) => {
                if (el.src != null && el.src.indexOf('stripe') > -1) {
                    try {
                        window.document.body.removeChild(el);
                    } catch { }
                }
            });
        }, 200);
        if (!this.hidePaypal) {
            window.document.head.removeChild(this.btScript);
            window.setTimeout(() => {
                Array.from(window.document.head.querySelectorAll('script')).forEach((el) => {
                    if (el.src != null && el.src.indexOf('paypal') > -1) {
                        try {
                            window.document.head.removeChild(el);
                        } catch { }
                    }
                });
                const btStylesheet = window.document.head.querySelector('#braintree-dropin-stylesheet');
                if (btStylesheet != null) {
                    try {
                        window.document.head.removeChild(btStylesheet);
                    } catch { }
                }
            }, 200);
        }
    }

    changeMethod() {
        this.btInstance = null;

        if (this.method === 'paypal') {
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
        } else {
            this.setStripeElement();
        }
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
                let sourceObj: any = null;
                let createObj: any = null;
                if (this.method === 'card') {
                    sourceObj = this.stripeCardNumberElement;
                } else {
                    sourceObj = 'bank_account';
                    createObj = this.bank;
                }
                this.stripe.createToken(sourceObj, createObj).then((result: any) => {
                    if (result.error) {
                        reject(result.error.message);
                    } else if (result.token && result.token.id != null) {
                        resolve(result.token.id);
                    } else {
                        reject();
                    }
                });
            }
        });
    }

    private setStripeElement() {
        window.setTimeout(() => {
            if (this.method === 'card') {
                if (this.stripeCardNumberElement == null) {
                    this.stripeCardNumberElement = this.stripeElements.create('cardNumber', {
                        style: StripeElementStyle,
                        classes: StripeElementClasses,
                        placeholder: '',
                    });
                }
                if (this.stripeCardExpiryElement == null) {
                    this.stripeCardExpiryElement = this.stripeElements.create('cardExpiry', {
                        style: StripeElementStyle,
                        classes: StripeElementClasses,
                    });
                }
                if (this.stripeCardCvcElement == null) {
                    this.stripeCardCvcElement = this.stripeElements.create('cardCvc', {
                        style: StripeElementStyle,
                        classes: StripeElementClasses,
                        placeholder: '',
                    });
                }
                this.stripeCardNumberElement.mount('#stripe-card-number-element');
                this.stripeCardExpiryElement.mount('#stripe-card-expiry-element');
                this.stripeCardCvcElement.mount('#stripe-card-cvc-element');
            }
        }, 50);
    }
}
