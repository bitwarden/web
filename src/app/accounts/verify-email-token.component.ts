import {
    Component,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { first } from 'rxjs/operators';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { StateService } from 'jslib-common/abstractions/state.service';

import { VerifyEmailRequest } from 'jslib-common/models/request/verifyEmailRequest';

@Component({
    selector: 'app-verify-email-token',
    templateUrl: 'verify-email-token.component.html',
})
export class VerifyEmailTokenComponent implements OnInit {
    constructor(private router: Router, private toasterService: ToasterService,
        private i18nService: I18nService, private route: ActivatedRoute,
        private apiService: ApiService, private logService: LogService,
        private stateService: StateService) { }

    ngOnInit() {
        this.route.queryParams.pipe(first()).subscribe(async qParams => {
            if (qParams.userId != null && qParams.token != null) {
                try {
                    await this.apiService.postAccountVerifyEmailToken(
                        new VerifyEmailRequest(qParams.userId, qParams.token));
                    if (await this.stateService.getIsAuthenticated()) {
                        await this.apiService.refreshIdentityToken();
                    }
                    this.toasterService.popAsync('success', null, this.i18nService.t('emailVerified'));
                    this.router.navigate(['/']);
                    return;
                } catch (e) {
                    this.logService.error(e);
                }
            }
            this.toasterService.popAsync('error', null, this.i18nService.t('emailVerifiedFailed'));
            this.router.navigate(['/']);
        });
    }
}
