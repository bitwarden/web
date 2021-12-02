import {
    Component,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { first } from 'rxjs/operators';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { VerifyEmailRequest } from 'jslib-common/models/request/verifyEmailRequest';

@Component({
    selector: 'app-verify-email-token',
    templateUrl: 'verify-email-token.component.html',
})
export class VerifyEmailTokenComponent implements OnInit {
    constructor(private router: Router, private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService, private route: ActivatedRoute,
        private apiService: ApiService, private userService: UserService,
        private logService: LogService) { }

    ngOnInit() {
        this.route.queryParams.pipe(first()).subscribe(async qParams => {
            if (qParams.userId != null && qParams.token != null) {
                try {
                    await this.apiService.postAccountVerifyEmailToken(
                        new VerifyEmailRequest(qParams.userId, qParams.token));
                    const authed = await this.userService.isAuthenticated();
                    if (authed) {
                        await this.apiService.refreshIdentityToken();
                    }
                    this.platformUtilsService.showToast('success', null, this.i18nService.t('emailVerified'));
                    this.router.navigate(['/']);
                    return;
                } catch (e) {
                    this.logService.error(e);
                }
            }
            this.platformUtilsService.showToast('error', null, this.i18nService.t('emailVerifiedFailed'));
            this.router.navigate(['/']);
        });
    }
}
