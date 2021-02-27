import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { UpdateLoginsRequest } from 'jslib/models/request/updateLoginsRequest';

@Component({
    selector: 'app-default-logins',
    templateUrl: 'default-logins.component.html',
})
export class DefaultLoginsComponent implements OnInit {
    loading = true;
    logins: string[] = [];
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) { }

    async ngOnInit() {
        const response = await this.apiService.getSettingsLogins();
        this.loading = false;
        if (response.defaultLogins != null) {
            this.logins = response.defaultLogins;
        }
    }

    remove(index: number) {
        this.logins.splice(index, 1);
    }

    add() {
        this.logins.push('');
    }

    async submit() {
        const request = new UpdateLoginsRequest();

        request.defaultLogins = this.logins.filter(d => d != null && d.trim() !== '');
        if (request.defaultLogins.length === 0) {
            request.defaultLogins = null;
        }

        try {
            this.formPromise = this.apiService.putSettingsLogins(request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Saved Default Logins' });
            this.toasterService.popAsync('success', null, this.i18nService.t('defaultLoginsUpdated'));
        } catch { }
    }

    indexTrackBy(index: number, obj: any): any {
        return index;
    }
}
