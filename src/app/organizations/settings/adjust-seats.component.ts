import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { SeatRequest } from 'jslib/models/request/seatRequest';

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

    seatAdjustment = 0;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) { }

    async submit() {
        try {
            const request = new SeatRequest();
            request.seatAdjustment = this.seatAdjustment;
            if (!this.add) {
                request.seatAdjustment *= -1;
            }

            this.formPromise = this.apiService.postOrganizationSeat(this.organizationId, request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: this.add ? 'Added Seats' : 'Removed Seats' });
            this.toasterService.popAsync('success', null,
                this.i18nService.t('adjustedSeats', request.seatAdjustment.toString()));
            this.onAdjusted.emit(this.seatAdjustment);
        } catch { }
    }

    cancel() {
        this.onCanceled.emit();
    }

    get adjustedSeatTotal(): number {
        return this.seatAdjustment * this.seatPrice;
    }
}
