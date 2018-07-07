import { Injectable } from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';

@Injectable()
export class EventService {
    constructor(private i18nService: I18nService) { }

    getDefaultDateFilters() {
        const d = new Date();
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59);
        d.setDate(d.getDate() - 30);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0);
        return [this.toDateTimeLocalString(start), this.toDateTimeLocalString(end)];
    }

    formatDateFilters(filterStart: string, filterEnd: string) {
        const start: Date = new Date(filterStart);
        const end: Date = new Date(filterEnd + ':59.999');
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
            throw new Error('Invalid date range.');
        }
        return [start.toISOString(), end.toISOString()];
    }

    private toDateTimeLocalString(date: Date) {
        return date.getFullYear() +
            '-' + this.pad(date.getMonth() + 1) +
            '-' + this.pad(date.getDate()) +
            'T' + this.pad(date.getHours()) +
            ':' + this.pad(date.getMinutes());
    }

    private pad(num: number) {
        const norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + norm;
    }
}
