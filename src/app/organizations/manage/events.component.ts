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
import { Organization } from 'jslib-common/models/domain/organization';
import { EventResponse } from 'jslib-common/models/response/eventResponse';

import { EventView } from 'jslib-common/models/view/eventView';

import { EventService } from '../../services/event.service';

@Component({
    selector: 'app-org-events',
    templateUrl: 'events.component.html',
})
export class EventsComponent implements OnInit {
    loading = true;
    loaded = false;
    organizationId: string;
    organization: Organization;
    events: EventView[];
    start: string;
    end: string;
    dirtyDates: boolean = true;
    continuationToken: string;
    refreshPromise: Promise<any>;
    exportPromise: Promise<any>;
    morePromise: Promise<any>;

    private orgUsersUserIdMap = new Map<string, any>();

    constructor(private apiService: ApiService, private route: ActivatedRoute, private eventService: EventService,
        private i18nService: I18nService, private toasterService: ToasterService, private userService: UserService,
        private exportService: ExportService, private platformUtilsService: PlatformUtilsService,
        private router: Router) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            this.organization = await this.userService.getOrganization(this.organizationId);
            if (this.organization == null || !this.organization.useEvents) {
                this.router.navigate(['/organizations', this.organizationId]);
                return;
            }
            const defaultDates = this.eventService.getDefaultDateFilters();
            this.start = defaultDates[0];
            this.end = defaultDates[1];
            await this.load();
        });
    }

    async load() {
        const response = await this.apiService.getOrganizationUsers(this.organizationId);
        response.data.forEach(u => {
            const name = u.name == null || u.name.trim() === '' ? u.email : u.name;
            this.orgUsersUserIdMap.set(u.userId, { name: name, email: u.email });
        });

        if (this.organization.providerId != null && (await this.userService.getProvider(this.organization.providerId)) != null) {
            const providerUsersResponse = await this.apiService.getProviderUsers(this.organization.providerId);
            providerUsersResponse.data.forEach(u => {
                const name = u.name == null || u.name.trim() === '' ? u.email : u.name;
                this.orgUsersUserIdMap.set(u.userId, { name: `${name} (${this.organization.providerName})`, email: u.email });
            });
        }

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
        const fileName = this.exportService.getFileName('org-events', 'csv');
        this.platformUtilsService.saveFile(window, data, { type: 'text/plain' }, fileName);
    }

    private async loadAndParseEvents(startDate: string, endDate: string, continuationToken: string) {
        const response = await this.apiService.getEventsOrganization(this.organizationId, startDate, endDate,
            continuationToken);

        const events = await Promise.all(response.data.map(async r => {
            const userId = r.actingUserId == null ? r.userId : r.actingUserId;
            const eventInfo = await this.eventService.getEventInfo(r);
            const user = this.getUserName(r, userId);
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

    private getUserName(r: EventResponse, userId: string) {
        if (userId == null) {
            return null;
        }

        if (this.orgUsersUserIdMap.has(userId)) {
            return this.orgUsersUserIdMap.get(userId);
        }

        if (r.providerId != null && r.providerId === this.organization.providerId) {
            return {
                'name': this.organization.providerName,
            };
        }

        return null;
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
