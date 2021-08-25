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
import { SeatAutoscaleRequest } from 'jslib-common/models/request/seatAutoscaleRequest';

@Component({
    selector: 'app-adjust-seat-autoscale',
    templateUrl: 'adjust-seat-autoscale.component.html',
})
export class AdjustSeatsAutoscaleComponent {
    @Input() organizationId: string;
    @Input() enableSeatAutoscaling: boolean;
    @Input() maxAutoscaleSeats: number;
    @Input() currentSeatCount: number;
    @Output() onAdjusted = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private router: Router) { }

    async submit() {
        try {
            const request = new SeatAutoscaleRequest(this.enableSeatAutoscaling, this.maxAutoscaleSeats);

            this.formPromise = this.apiService.postOrganizationAutoscaleSeats(this.organizationId, request);
            await this.formPromise;

            let message = this.i18nService.t('enabledUnlimitedAutoscaling');
            if (!request.enableSeatAutoscaling) {
                message = this.i18nService.t('disabledSeatAutoscaling');
            } else if (request.maxAutoscaleSeats != null) {
                message = this.i18nService.t('enabledLimitedAutoscaling', request.maxAutoscaleSeats.toString());
            }
            this.toasterService.popAsync('success', null, message);
        } catch { }
        this.onAdjusted.emit();
    }

    cancel() {
        this.onCanceled.emit();
    }

    enableAutoscalingChanged() {
        if (!this.enableSeatAutoscaling) {
            this.maxAutoscaleSeats = null;
        }
    }
}
