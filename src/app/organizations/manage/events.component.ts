import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';

import { EventService } from '../../services/event.service';

@Component({
    selector: 'app-org-events',
    templateUrl: 'events.component.html',
})
export class EventsComponent implements OnInit {
    loading = true;
    loaded = false;
    organizationId: string;
    events: any[];
    start: string;
    end: string;
    continuationToken: string;
    refreshPromise: Promise<any>;
    morePromise: Promise<any>;

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private eventService: EventService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            const defaultDates = this.eventService.getDefaultDateFilters();
            this.start = defaultDates[0];
            this.end = defaultDates[1];
            await this.load();
        });
    }

    async load() {
        // TODO: load users
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
            // TODO: error toast
            return;
        }

        this.loading = true;
        try {
            const promise = this.apiService.getEventsOrganization(this.organizationId, dates[0], dates[1],
                clearExisting ? null : this.continuationToken);
            if (clearExisting) {
                this.refreshPromise = promise;
            } else {
                this.morePromise = promise;
            }
            const response = await promise;
            this.continuationToken = response.continuationToken;
            const events = response.data.map((r) => {
                const userId = r.actingUserId == null ? r.userId : r.actingUserId;
                const eventInfo: any = {};
                const htmlMessage = '';
                return {
                    message: htmlMessage,
                    appIcon: eventInfo.appIcon,
                    appName: eventInfo.appName,
                    userId: userId,
                    userName: userId != null ? 'user' : '-',
                    date: r.date,
                    ip: r.ipAddress,
                };
            });
            if (!clearExisting && this.events != null && this.events.length > 0) {
                this.events = this.events.concat(events);
            } else {
                this.events = events;
            }
        } catch { }
        this.loading = false;
        this.morePromise = null;
        this.refreshPromise = null;
    }
}
