import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { OrganizationSubscriptionUpdateRequest } from 'jslib-common/models/request/organizationSubscriptionUpdateRequest';

@Component({
    selector: 'app-adjust-subscription',
    templateUrl: 'adjust-subscription.component.html',
})
export class AdjustSubscription {
    @Input() organizationId: string;
    @Input() maxAutoscaleSeats: number;
    @Input() currentSeatCount: number;
    @Input() seatPrice = 0;
    @Input() interval = 'year';
    @Output() onAdjusted = new EventEmitter();

    formPromise: Promise<any>;
    limitSubscription: boolean;
    newSeatCount: number;
    newMaxSeats: number;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private router: Router) { }

    ngOnInit() {
        this.limitSubscription = this.maxAutoscaleSeats != null;
        this.newSeatCount = this.currentSeatCount;
        this.newMaxSeats = this.maxAutoscaleSeats;
    }

    async submit() {
        try {
            const seatAdjustment = this.newSeatCount - this.currentSeatCount;
            const request = new OrganizationSubscriptionUpdateRequest(seatAdjustment, this.newMaxSeats);
            this.formPromise = this.apiService.postOrganizationUpdateSubscription(this.organizationId, request);

            await this.formPromise;

            const messages: string[] = [];

            if (seatAdjustment != 0) {
                messages.push(this.i18nService.t('adjustedSeats', seatAdjustment.toString()));
            }

            if (this.newMaxSeats != this.maxAutoscaleSeats) {
                if (this.newMaxSeats == null) {
                    messages.push(this.i18nService.t('enabledUnlimitedAutoscaling'));
                } else {
                    messages.push(this.i18nService.t('enabledLimitedAutoscaling', request.maxAutoscaleSeats.toString()));
                }
            }

            if (messages.length != 0) {
                this.toasterService.popAsync('success', null, messages.join(' '));
            } else {
                this.toasterService.popAsync('success', null, this.i18nService.t('subscriptionUpdated'));
            }
        } catch { }
        this.onAdjusted.emit();
    }

    limitSubscriptionChanged() {
        if (!this.limitSubscription) {
            this.newMaxSeats = null;
        }
    }

    get adjustedSeatTotal(): number {
        return this.newSeatCount * this.seatPrice;
    }

    get maxSeatTotal(): number {
        return this.newMaxSeats * this.seatPrice;
    }
}
