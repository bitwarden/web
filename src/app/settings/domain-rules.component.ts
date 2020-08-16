import { Component, OnInit } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { UpdateDomainsRequest } from 'jslib/models/request/updateDomainsRequest';

@Component({
    selector: 'app-domain-rules',
    templateUrl: 'domain-rules.component.html',
})
export class DomainRulesComponent implements OnInit {
    loading = true;
    custom: string[] = [];
    global: any[] = [];
    formPromise: Promise<any>;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService
    ) {}

    async ngOnInit() {
        const response = await this.apiService.getSettingsDomains();
        this.loading = false;
        if (response.equivalentDomains != null) {
            this.custom = response.equivalentDomains.map((d) => d.join(', '));
        }
        if (response.globalEquivalentDomains != null) {
            this.global = response.globalEquivalentDomains.map((d) => {
                return {
                    domains: d.domains.join(', '),
                    excluded: d.excluded,
                    key: d.type,
                };
            });
        }
    }

    toggleExcluded(globalDomain: any) {
        globalDomain.excluded = !globalDomain.excluded;
    }

    customize(globalDomain: any) {
        globalDomain.excluded = true;
        this.custom.push(globalDomain.domains);
    }

    remove(index: number) {
        this.custom.splice(index, 1);
    }

    add() {
        this.custom.push('');
    }

    async submit() {
        const request = new UpdateDomainsRequest();
        request.excludedGlobalEquivalentDomains = this.global
            .filter((d) => d.excluded)
            .map((d) => d.key);
        if (request.excludedGlobalEquivalentDomains.length === 0) {
            request.excludedGlobalEquivalentDomains = null;
        }
        request.equivalentDomains = this.custom
            .filter((d) => d != null && d.trim() !== '')
            .map((d) => d.split(',').map((d2) => d2.trim()));
        if (request.equivalentDomains.length === 0) {
            request.equivalentDomains = null;
        }

        try {
            this.formPromise = this.apiService.putSettingsDomains(request);
            await this.formPromise;
            this.analytics.eventTrack.next({
                action: 'Saved Equivalent Domains',
            });
            this.toasterService.popAsync('success', null, this.i18nService.t('domainsUpdated'));
        } catch {}
    }

    indexTrackBy(index: number, obj: any): any {
        return index;
    }
}
