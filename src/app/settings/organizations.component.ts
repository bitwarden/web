import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';

@Component({
    selector: 'app-organizations',
    templateUrl: 'organizations.component.html',
})
export class OrganizationsComponent implements OnInit {
    @Input() vault = false;

    organizations: Organization[];
    loaded: boolean = false;
    actionPromise: Promise<any>;

    constructor(private userService: UserService, private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService, private apiService: ApiService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private syncService: SyncService) { }

    async ngOnInit() {
        await this.load();
    }

    async load() {
        const orgs = await this.userService.getAllOrganizations();
        orgs.sort((a, b) => {
            if (a.name == null && b.name != null) {
                return -1;
            }
            if (a.name != null && b.name == null) {
                return 1;
            }
            if (a.name == null && b.name == null) {
                return 0;
            }

            return this.i18nService.collator ? this.i18nService.collator.compare(a.name, b.name) :
                a.name.localeCompare(b.name);
        });
        this.organizations = orgs;
        this.loaded = true;
    }

    async leave(org: Organization) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('leaveOrganizationConfirmation'), org.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.apiService.postLeaveOrganization(org.id).then(() => {
                return this.syncService.fullSync(true);
            });
            await this.actionPromise;
            this.analytics.eventTrack.next({ action: 'Left Organization' });
            this.toasterService.popAsync('success', null, this.i18nService.t('leftOrganization'));
            await this.load();
        } catch { }
    }
}
