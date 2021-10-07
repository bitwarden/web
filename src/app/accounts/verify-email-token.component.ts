import {
    Component,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';

import { VerifyEmailRequest } from 'jslib-common/models/request/verifyEmailRequest';

@Component({
    selector: 'app-verify-email-token',
    templateUrl: 'verify-email-token.component.html',
})
export class VerifyEmailTokenComponent implements OnInit {
    constructor(private router: Router, private toasterService: ToasterService,
        private i18nService: I18nService, private route: ActivatedRoute,
        private apiService: ApiService, private activeAccount: ActiveAccountService) { }

    ngOnInit() {
        let fired = false;
        this.route.queryParams.subscribe(async qParams => {
            if (fired) {
                return;
            }
            fired = true;
            if (qParams.userId != null && qParams.token != null) {
                try {
                    await this.apiService.postAccountVerifyEmailToken(
                        new VerifyEmailRequest(qParams.userId, qParams.token));
                    if (this.activeAccount.isAuthenticated) {
                        await this.apiService.refreshIdentityToken();
                    }
                    this.toasterService.popAsync('success', null, this.i18nService.t('emailVerified'));
                    this.router.navigate(['/']);
                    return;
                } catch { }
            }
            this.toasterService.popAsync('error', null, this.i18nService.t('emailVerifiedFailed'));
            this.router.navigate(['/']);
        });
    }
}
