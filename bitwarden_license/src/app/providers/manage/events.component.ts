import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { ExportService } from 'jslib-common/abstractions/export.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { EventView } from 'jslib-common/models/view/eventView';

import { EventService } from 'src/app/services/event.service';

@Component({
    selector: 'provider-events',
    templateUrl: 'events.component.html',
})
export class EventsComponent implements OnInit {
    loading = true;
    loaded = false;
    providerId: string;
    events: EventView[];
    start: string;
    end: string;
    dirtyDates: boolean = true;
    continuationToken: string;
    refreshPromise: Promise<any>;
    exportPromise: Promise<any>;
    morePromise: Promise<any>;

    private providerUsersUserIdMap = new Map<string, any>();
    private providerUsersIdMap = new Map<string, any>();

    constructor(private apiService: ApiService, private route: ActivatedRoute, private eventService: EventService,
        private i18nService: I18nService, private toasterService: ToasterService, private userService: UserService,
        private exportService: ExportService, private platformUtilsService: PlatformUtilsService,
        private router: Router) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.providerId = params.providerId;
            const provider = await this.userService.getProvider(this.providerId);
            if (provider == null || !provider.useEvents) {
                this.router.navigate(['/providers', this.providerId]);
                return;
            }
            const defaultDates = this.eventService.getDefaultDateFilters();
            this.start = defaultDates[0];
            this.end = defaultDates[1];
            await this.load();
        });
    }

    async load() {
        const response = await this.apiService.getProviderUsers(this.providerId);
        response.data.forEach(u => {
            const name = u.name == null || u.name.trim() === '' ? u.email : u.name;
            this.providerUsersIdMap.set(u.id, { name: name, email: u.email });
            this.providerUsersUserIdMap.set(u.userId, { name: name, email: u.email });
        });
        await this.loadEvents(true);
        this.loaded = true;
    }

    async exportEvents() {
        if (this.appApiPromiseUnfulfilled() || this.dirtyDates) {
            return;
        }

        this.loading = true;

        const dates = this.parseDates();
        if (dates == null) {
            return;
        }

        try {
            this.exportPromise = this.export(dates[0], dates[1]);

            await this.exportPromise;
        } catch { }

        this.exportPromise = null;
        this.loading = false;
    }

    async loadEvents(clearExisting: boolean) {
        if (this.appApiPromiseUnfulfilled()) {
            return;
        }

        const dates = this.parseDates();
        if (dates == null) {
            return;
        }

        this.loading = true;
        let events: EventView[] = [];
        try {
            const promise = this.loadAndParseEvents(dates[0], dates[1], clearExisting ? null : this.continuationToken);
            if (clearExisting) {
                this.refreshPromise = promise;
            } else {
                this.morePromise = promise;
            }
            const result = await promise;
            this.continuationToken = result.continuationToken;
            events = result.events;
        } catch { }

        if (!clearExisting && this.events != null && this.events.length > 0) {
            this.events = this.events.concat(events);
        } else {
            this.events = events;
        }

        this.dirtyDates = false;
        this.loading = false;
        this.morePromise = null;
        this.refreshPromise = null;
    }

    private async export(start: string, end: string) {
        let continuationToken = this.continuationToken;
        let events = [].concat(this.events);

        while (continuationToken != null) {
            const result = await this.loadAndParseEvents(start, end, continuationToken);
            continuationToken = result.continuationToken;
            events = events.concat(result.events);
        }

        const data = await this.exportService.getEventExport(events);
        const fileName = this.exportService.getFileName('provider-events', 'csv');
        this.platformUtilsService.saveFile(window, data, { type: 'text/plain' }, fileName);
    }

    private async loadAndParseEvents(startDate: string, endDate: string, continuationToken: string) {
        const response = await this.apiService.getEventsProvider(this.providerId, startDate, endDate,
            continuationToken);

        const events = await Promise.all(response.data.map(async r => {
            const userId = r.actingUserId == null ? r.userId : r.actingUserId;
            const eventInfo = await this.eventService.getEventInfo(r);
            const user = userId != null && this.providerUsersUserIdMap.has(userId) ?
                this.providerUsersUserIdMap.get(userId) : null;
            return new EventView({
                message: eventInfo.message,
                humanReadableMessage: eventInfo.humanReadableMessage,
                appIcon: eventInfo.appIcon,
                appName: eventInfo.appName,
                userId: userId,
                userName: user != null ? user.name : this.i18nService.t('unknown'),
                userEmail: user != null ? user.email : '',
                date: r.date,
                ip: r.ipAddress,
                type: r.type,
            });
        }));
        return { continuationToken: response.continuationToken, events: events };
    }

    private parseDates() {
        let dates: string[] = null;
        try {
            dates = this.eventService.formatDateFilters(this.start, this.end);
        } catch (e) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('invalidDateRange'));
            return null;
        }
        return dates;
    }

    private appApiPromiseUnfulfilled() {
        return this.refreshPromise != null || this.morePromise != null || this.exportPromise != null;
    }
}
