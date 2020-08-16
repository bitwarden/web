import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

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

    @ViewChild(PaymentComponent, { static: true })
    paymentComponent: PaymentComponent;

    storageAdjustment = 0;
    formPromise: Promise<any>;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {}

    async submit() {
        try {
            const request = new StorageRequest();
            request.storageGbAdjustment = this.storageAdjustment;
            if (!this.add) {
                request.storageGbAdjustment *= -1;
            }

            let paymentFailed = false;
            const action = async () => {
                let response: Promise<PaymentResponse>;
                if (this.organizationId == null) {
                    response = this.formPromise = this.apiService.postAccountStorage(request);
                } else {
                    response = this.formPromise = this.apiService.postOrganizationStorage(
                        this.organizationId,
                        request
                    );
                }
                const result = await response;
                if (result != null && result.paymentIntentClientSecret != null) {
                    try {
                        await this.paymentComponent.handleStripeCardPayment(
                            result.paymentIntentClientSecret,
                            null
                        );
                    } catch {
                        paymentFailed = true;
                    }
                }
            };
            this.formPromise = action();
            await this.formPromise;
            this.analytics.eventTrack.next({
                action: this.add ? 'Added Storage' : 'Removed Storage',
            });
            this.onAdjusted.emit(this.storageAdjustment);
            if (paymentFailed) {
                this.toasterService.popAsync({
                    body: this.i18nService.t('couldNotChargeCardPayInvoice'),
                    type: 'warning',
                    timeout: 10000,
                });
                this.router.navigate(['../billing'], {
                    relativeTo: this.activatedRoute,
                });
            } else {
                this.toasterService.popAsync(
                    'success',
                    null,
                    this.i18nService.t('adjustedStorage', request.storageGbAdjustment.toString())
                );
            }
        } catch {}
    }

    cancel() {
        this.onCanceled.emit();
    }

    get adjustedStorageTotal(): number {
        return this.storageGbPrice * this.storageAdjustment;
    }
}
