import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { EventService } from '../../services/event.service';

import { EventResponse } from 'jslib/models/response/eventResponse';
import { ListResponse } from 'jslib/models/response/listResponse';

@Component({
    selector: 'app-user-events',
    templateUrl: 'user-events.component.html',
})
export class UserEventsComponent implements OnInit {
    @Input() name: string;
    @Input() organizationUserId: string;
    @Input() organizationId: string;

    loading = true;
    loaded = false;
    events: any[];
    start: string;
    end: string;
    continuationToken: string;
    refreshPromise: Promise<any>;
    morePromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private eventService: EventService, private toasterService: ToasterService) { }

    async ngOnInit() {
        const defaultDates = this.eventService.getDefaultDateFilters();
        this.start = defaultDates[0];
        this.end = defaultDates[1];
        await this.loadEvents(true);
        this.loaded = true;
    }

    async loadEvents(clearExisting: boolean) {
        if (this.refreshPromise != null || this.morePromise != null) {
            return;
        }

        let dates: string[] = null;
        try {
            dates = this.eventService.formatDateFilters(this.start, this.end);
        } catch (e) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('invalidDateRange'));
            return;
        }

        this.loading = true;
        let response: ListResponse<EventResponse>;
        try {
            const promise = this.apiService.getEventsOrganizationUser(this.organizationId, this.organizationUserId,
                dates[0], dates[1], clearExisting ? null : this.continuationToken);
            if (clearExisting) {
                this.refreshPromise = promise;
            } else {
                this.morePromise = promise;
            }
            response = await promise;
        } catch { }

        this.continuationToken = response.continuationToken;
        const events = response.data.map((r) => {
            const userId = r.actingUserId == null ? r.userId : r.actingUserId;
            const eventInfo = this.eventService.getEventInfo(r);
            return {
                message: eventInfo.message,
                appIcon: eventInfo.appIcon,
                appName: eventInfo.appName,
                userId: userId,
                date: r.date,
                ip: r.ipAddress,
                type: r.type,
            };
        });

        if (!clearExisting && this.events != null && this.events.length > 0) {
            this.events = this.events.concat(events);
        } else {
            this.events = events;
        }

        this.loading = false;
        this.morePromise = null;
        this.refreshPromise = null;
    }
}
