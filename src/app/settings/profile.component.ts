import { Component, OnInit } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { UserService } from 'jslib/abstractions/user.service';

import { UpdateProfileRequest } from 'jslib/models/request/updateProfileRequest';

import { ProfileResponse } from 'jslib/models/response/profileResponse';

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.component.html',
})
export class ProfileComponent implements OnInit {
    loading = true;
    profile: ProfileResponse;
    fingerprint: string;

    formPromise: Promise<any>;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private userService: UserService,
        private cryptoService: CryptoService
    ) {}

    async ngOnInit() {
        this.profile = await this.apiService.getProfile();
        this.loading = false;
        const fingerprint = await this.cryptoService.getFingerprint(
            await this.userService.getUserId()
        );
        if (fingerprint != null) {
            this.fingerprint = fingerprint.join('-');
        }
    }

    async submit() {
        try {
            const request = new UpdateProfileRequest(
                this.profile.name,
                this.profile.masterPasswordHint
            );
            this.formPromise = this.apiService.putProfile(request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Updated Profile' });
            this.toasterService.popAsync('success', null, this.i18nService.t('accountUpdated'));
        } catch {}
    }
}
