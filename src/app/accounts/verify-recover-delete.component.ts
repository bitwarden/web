import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { VerifyDeleteRecoverRequest } from 'jslib/models/request/verifyDeleteRecoverRequest';

@Component({
    selector: 'app-verify-recover-delete',
    templateUrl: 'verify-recover-delete.component.html',
})
export class VerifyRecoverDeleteComponent implements OnInit {
    email: string;
    formPromise: Promise<any>;

    private userId: string;
    private token: string;

    constructor(
        private router: Router,
        private apiService: ApiService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private i18nService: I18nService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        let fired = false;
        this.route.queryParams.subscribe(async (qParams) => {
            if (fired) {
                return;
            }
            fired = true;
            if (qParams.userId != null && qParams.token != null && qParams.email != null) {
                this.userId = qParams.userId;
                this.token = qParams.token;
                this.email = qParams.email;
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    async submit() {
        try {
            const request = new VerifyDeleteRecoverRequest(this.userId, this.token);
            this.formPromise = this.apiService.postAccountRecoverDeleteToken(request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Recovered Delete' });
            this.toasterService.popAsync(
                'success',
                this.i18nService.t('accountDeleted'),
                this.i18nService.t('accountDeletedDesc')
            );
            this.router.navigate(['/']);
        } catch {}
    }
}
