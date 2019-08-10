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

import { StorageRequest } from 'jslib/models/request/storageRequest';

import { PaymentResponse } from 'jslib/models/response/paymentResponse';

import { PaymentComponent } from './payment.component';

@Component({
    selector: 'app-adjust-storage',
    templateUrl: 'adjust-storage.component.html',
})
export class AdjustStorageComponent {
    @Input() storageGbPrice = 0;
    @Input() add = true;
    @Input() organizationId: string;
    @Input() interval = 'year';
    @Output() onAdjusted = new EventEmitter<number>();
    @Output() onCanceled = new EventEmitter();

    @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;

    storageAdjustment = 0;
    formPromise: Promise<PaymentResponse>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) { }

    async submit() {
        try {
            const request = new StorageRequest();
            request.storageGbAdjustment = this.storageAdjustment;
            if (!this.add) {
                request.storageGbAdjustment *= -1;
            }

            if (this.organizationId == null) {
                this.formPromise = this.apiService.postAccountStorage(request);
            } else {
                this.formPromise = this.apiService.postOrganizationStorage(this.organizationId, request);
            }
            const result = await this.formPromise;
            if (result != null && result.paymentIntentClientSecret != null) {
                await this.paymentComponent.handleStripeCardPayment(result.paymentIntentClientSecret, null);
            }
            this.analytics.eventTrack.next({ action: this.add ? 'Added Storage' : 'Removed Storage' });
            this.toasterService.popAsync('success', null,
                this.i18nService.t('adjustedStorage', request.storageGbAdjustment.toString()));
            this.onAdjusted.emit(this.storageAdjustment);
        } catch { }
    }

    cancel() {
        this.onCanceled.emit();
    }

    get adjustedStorageTotal(): number {
        return this.storageGbPrice * this.storageAdjustment;
    }
}
