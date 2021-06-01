import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { ExportService } from 'jslib/abstractions/export.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { EventService } from '../../services/event.service';

import { EventResponse } from 'jslib/models/response/eventResponse';
import { ListResponse } from 'jslib/models/response/listResponse';
import { EventView } from 'jslib/models/view/eventView';

@Component({
    selector: 'app-org-events',
    templateUrl: 'events.component.html',
})
export class EventsComponent implements OnInit {
    loading = true;
    loaded = false;
    organizationId: string;
    events: EventView[];
    start: string;
    end: string;
    continuationToken: string;
    refreshPromise: Promise<any>;
    exportPromise: Promise<any>;
    morePromise: Promise<any>;

    private orgUsersUserIdMap = new Map<string, any>();
    private orgUsersIdMap = new Map<string, any>();

    constructor(private apiService: ApiService, private route: ActivatedRoute, private eventService: EventService,
        private i18nService: I18nService, private toasterService: ToasterService, private userService: UserService,
        private exportService: ExportService, private platformUtilsService: PlatformUtilsService,
        private router: Router) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            const organization = await this.userService.getOrganization(this.organizationId);
            if (organization == null || !organization.useEvents) {
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
            this.orgUsersIdMap.set(u.id, { name: name, email: u.email });
            this.orgUsersUserIdMap.set(u.userId, { name: name, email: u.email });
        });
        await this.loadEvents(true);
        this.loaded = true;
    }

    async exportEvents() {
        if (this.appApiPromiseUnfulfilled()) {
            return;
        }

        this.loading = true;
        this.exportPromise = this.exportService.getEventExport(this.events).then(data => {
            const fileName = this.exportService.getFileName('org-events', 'csv');
            this.platformUtilsService.saveFile(window, data, { type: 'text/plain' }, fileName);
        });
        try {
            await this.exportPromise;
        } catch { }

        this.exportPromise = null;
        this.loading = false;
    }

    async loadEvents(clearExisting: boolean) {
        if (this.appApiPromiseUnfulfilled()) {
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
            const promise = this.apiService.getEventsOrganization(this.organizationId, dates[0], dates[1],
                clearExisting ? null : this.continuationToken);
            if (clearExisting) {
                this.refreshPromise = promise;
            } else {
                this.morePromise = promise;
            }
            response = await promise;
        } catch { }

        this.continuationToken = response.continuationToken;
        const events = await Promise.all(response.data.map(async r => {
            const userId = r.actingUserId == null ? r.userId : r.actingUserId;
            const eventInfo = await this.eventService.getEventInfo(r);
            const user = userId != null && this.orgUsersUserIdMap.has(userId) ?
                this.orgUsersUserIdMap.get(userId) : null;
            return new EventView({
                message: eventInfo.message,
                humanReadableMessage: eventInfo.humanReadableMessage,
                appIcon: eventInfo.appIcon,
                appName: eventInfo.appName,
                deviceType: eventInfo.deviceType,
                userId: userId,
                userName: user != null ? user.name : this.i18nService.t('unknown'),
                userEmail: user != null ? user.email : '',
                date: r.date,
                ip: r.ipAddress,
                type: r.type,
            });
        }));

        if (!clearExisting && this.events != null && this.events.length > 0) {
            this.events = this.events.concat(events);
        } else {
            this.events = events;
        }

        this.loading = false;
        this.morePromise = null;
        this.refreshPromise = null;
    }

    private appApiPromiseUnfulfilled() {
        return this.refreshPromise != null || this.morePromise != null || this.exportPromise != null;
    }
}
