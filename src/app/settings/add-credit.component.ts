import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PaymentMethodType } from 'jslib/enums/paymentMethodType';

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

    @ViewChild('ppButtonForm', { read: ElementRef }) ppButtonFormRef: ElementRef;

    paymentMethodType = PaymentMethodType;
    ppButtonFormAction = WebConstants.paypal.buttonActionProduction;
    ppButtonBusinessId = WebConstants.paypal.businessIdProduction;
    ppButtonCustomField: string;
    ppReturnUrl: string;
    ppLoading = false;
    subject: string;
    formPromise: Promise<any>;

    constructor(private userService: UserService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService) {
        if (platformUtilsService.isDev()) {
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
            }
        } else {
            if (this.creditAmount == null) {
                this.creditAmount = '10.00';
            }
            const userId = await this.userService.getUserId();
            this.subject = await this.userService.getEmail();
            this.ppButtonCustomField = 'user_id:' + userId;
        }
        this.ppButtonCustomField += ',account_credit:1';
        this.ppReturnUrl = window.location.href;
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
        try {
            this.analytics.eventTrack.next({
                action: 'Added Credit',
            });
            this.toasterService.popAsync('success', null, this.i18nService.t('updatedPaymentMethod'));
            this.onAdded.emit();
        } catch { }
    }

    changeMethod() {
        // TODO:
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
}
