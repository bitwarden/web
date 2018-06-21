import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { UpdateProfileRequest } from 'jslib/models/request/updateProfileRequest';

import { ProfileResponse } from 'jslib/models/response/profileResponse';

@Component({
    selector: 'app-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent implements OnInit {
    loading = true;
    profile: ProfileResponse;

    submitPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService, ) { }

    async ngOnInit() {
        this.profile = await this.apiService.getProfile();
        this.loading = false;
    }

    async submit() {
        try {
            const request = new UpdateProfileRequest(this.profile.name, this.profile.masterPasswordHint);
            this.submitPromise = this.apiService.putProfile(request);
            await this.submitPromise;
            this.analytics.eventTrack.next({ action: 'Updated Profile' });
            this.toasterService.popAsync('success', null, this.i18nService.t('accountUpdated'));
        } catch { }
    }

    changePassword() {

    }

    changeEmail() {

    }
}
