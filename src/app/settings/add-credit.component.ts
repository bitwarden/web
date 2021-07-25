import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { PaymentMethodType } from 'jslib-common/enums/paymentMethodType';

import { BitPayInvoiceRequest } from 'jslib-common/models/request/bitPayInvoiceRequest';

import { WebConstants } from '../../services/webConstants';

@Component({
    selector: 'app-add-credit',
    templateUrl: 'add-credit.component.html',
})
export class AddCreditComponent implements OnInit {
    @Input() creditAmount: string;
    @Input() showOptions = true;
    @Input() method = PaymentMethodType.PayPal;
    @Input() organizationId: string;
    @Output() onAdded = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    @ViewChild('ppButtonForm', { read: ElementRef, static: true }) ppButtonFormRef: ElementRef;

    paymentMethodType = PaymentMethodType;
    ppButtonFormAction = WebConstants.paypal.buttonActionProduction;
    ppButtonBusinessId = WebConstants.paypal.businessIdProduction;
    ppButtonCustomField: string;
    ppLoading = false;
    subject: string;
    returnUrl: string;
    formPromise: Promise<any>;

    private userId: string;
    private name: string;
    private email: string;

    constructor(private userService: UserService, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService) {
        if (process.env.ENV !== 'production' || platformUtilsService.isDev()) {
            this.ppButtonFormAction = WebConstants.paypal.buttonActionSandbox;
            this.ppButtonBusinessId = WebConstants.paypal.businessIdSandbox;
        }
    }

    async ngOnInit() {
        if (this.organizationId != null) {
            if (this.creditAmount == null) {
                this.creditAmount = '20.00';
            }
            this.ppButtonCustomField = 'organization_id:' + this.organizationId;
            const org = await this.userService.getOrganization(this.organizationId);
            if (org != null) {
                this.subject = org.name;
                this.name = org.name;
            }
        } else {
            if (this.creditAmount == null) {
                this.creditAmount = '10.00';
            }
            this.userId = await this.userService.getUserId();
            this.subject = await this.userService.getEmail();
            this.email = this.subject;
            this.ppButtonCustomField = 'user_id:' + this.userId;
        }
        this.ppButtonCustomField += ',account_credit:1';
        this.returnUrl = window.location.href;
    }

    async submit() {
        if (this.creditAmount == null || this.creditAmount === '') {
            return;
        }

        if (this.method === PaymentMethodType.PayPal) {
            this.ppButtonFormRef.nativeElement.submit();
            this.ppLoading = true;
            return;
        }
        if (this.method === PaymentMethodType.BitPay) {
            try {
                const req = new BitPayInvoiceRequest();
                req.email = this.email;
                req.name = this.name;
                req.credit = true;
                req.amount = this.creditAmountNumber;
                req.organizationId = this.organizationId;
                req.userId = this.userId;
                req.returnUrl = this.returnUrl;
                this.formPromise = this.apiService.postBitPayInvoice(req);
                const bitPayUrl: string = await this.formPromise;
                this.platformUtilsService.launchUri(bitPayUrl);
            } catch { }
            return;
        }
        try {
            this.onAdded.emit();
        } catch { }
    }

    cancel() {
        this.onCanceled.emit();
    }

    formatAmount() {
        try {
            if (this.creditAmount != null && this.creditAmount !== '') {
                const floatAmount = Math.abs(parseFloat(this.creditAmount));
                if (floatAmount > 0) {
                    this.creditAmount = parseFloat((Math.round(floatAmount * 100) / 100).toString())
                        .toFixed(2).toString();
                    return;
                }
            }
        } catch { }
        this.creditAmount = '';
    }

    get creditAmountNumber(): number {
        if (this.creditAmount != null && this.creditAmount !== '') {
            try {
                return parseFloat(this.creditAmount);
            } catch { }
        }
        return null;
    }
}
