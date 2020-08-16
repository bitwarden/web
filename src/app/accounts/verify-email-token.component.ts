import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { UserService } from 'jslib/abstractions/user.service';

import { VerifyEmailRequest } from 'jslib/models/request/verifyEmailRequest';

@Component({
    selector: 'app-verify-email-token',
    templateUrl: 'verify-email-token.component.html',
})
export class VerifyEmailTokenComponent implements OnInit {
    constructor(
        private router: Router,
        private toasterService: ToasterService,
        private i18nService: I18nService,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private userService: UserService
    ) {}

    ngOnInit() {
        let fired = false;
        this.route.queryParams.subscribe(async (qParams) => {
            if (fired) {
                return;
            }
            fired = true;
            if (qParams.userId != null && qParams.token != null) {
                try {
                    await this.apiService.postAccountVerifyEmailToken(
                        new VerifyEmailRequest(qParams.userId, qParams.token)
                    );
                    const authed = await this.userService.isAuthenticated();
                    if (authed) {
                        await this.apiService.refreshIdentityToken();
                    }
                    this.toasterService.popAsync(
                        'success',
                        null,
                        this.i18nService.t('emailVerified')
                    );
                    this.router.navigate(['/']);
                    return;
                } catch {}
            }
            this.toasterService.popAsync('error', null, this.i18nService.t('emailVerifiedFailed'));
            this.router.navigate(['/']);
        });
    }
}
