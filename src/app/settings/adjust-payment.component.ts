import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { PaymentRequest } from 'jslib/models/request/paymentRequest';

import { PaymentMethodType } from 'jslib/enums/paymentMethodType';

import { PaymentComponent } from './payment.component';

@Component({
    selector: 'app-adjust-payment',
    templateUrl: 'adjust-payment.component.html',
})
export class AdjustPaymentComponent {
    @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;

    @Input() currentType?: PaymentMethodType;
    @Input() user = true;
    @Output() onAdjusted = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    paymentMethodType = PaymentMethodType;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) { }

    async submit() {
        try {
            const request = new PaymentRequest();
            this.formPromise = this.paymentComponent.createPaymentToken().then((token) => {
                request.paymentToken = token;
                if (this.user) {
                    return this.apiService.postAccountPayment(request);
                }
            });
            await this.formPromise;
            this.analytics.eventTrack.next({
                action: this.currentType == null ? 'Added Payment Method' : 'Changed Payment Method',
            });
            this.toasterService.popAsync('success', null, this.i18nService.t('updatedPaymentMethod'));
            this.onAdjusted.emit();
        } catch { }
    }

    cancel() {
        this.onCanceled.emit();
    }

    get canChange() {
        return this.currentType == null || this.currentType === PaymentMethodType.Card;
    }
}
