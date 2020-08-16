import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { SeatRequest } from 'jslib/models/request/seatRequest';

import { PaymentComponent } from '../../settings/payment.component';

@Component({
    selector: 'app-adjust-seats',
    templateUrl: 'adjust-seats.component.html',
})
export class AdjustSeatsComponent {
    @Input() seatPrice = 0;
    @Input() add = true;
    @Input() organizationId: string;
    @Input() interval = 'year';
    @Output() onAdjusted = new EventEmitter<number>();
    @Output() onCanceled = new EventEmitter();

    @ViewChild(PaymentComponent, { static: true })
    paymentComponent: PaymentComponent;

    seatAdjustment = 0;
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
            const request = new SeatRequest();
            request.seatAdjustment = this.seatAdjustment;
            if (!this.add) {
                request.seatAdjustment *= -1;
            }

            let paymentFailed = false;
            const action = async () => {
                const result = await this.apiService.postOrganizationSeat(
                    this.organizationId,
                    request
                );
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
                action: this.add ? 'Added Seats' : 'Removed Seats',
            });
            this.onAdjusted.emit(this.seatAdjustment);
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
                    this.i18nService.t('adjustedSeats', request.seatAdjustment.toString())
                );
            }
        } catch {}
    }

    cancel() {
        this.onCanceled.emit();
    }

    get adjustedSeatTotal(): number {
        return this.seatAdjustment * this.seatPrice;
    }
}
