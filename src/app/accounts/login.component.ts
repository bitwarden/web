import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { LoginComponent as BaseLoginComponent } from 'jslib/angular/components/login.component';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent {
    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, private route: ActivatedRoute,
        storageService: StorageService, private stateService: StateService,
        platformUtilsService: PlatformUtilsService) {
        super(authService, router, platformUtilsService, i18nService, storageService);
        this.onSuccessfulLoginNavigate = this.goAfterLogIn;
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (qParams) => {
            if (qParams.email != null && qParams.email.indexOf('@') > -1) {
                this.email = qParams.email;
            }
            if (qParams.premium != null) {
                this.stateService.save('loginRedirect', { route: '/settings/premium' });
            } else if (qParams.org != null) {
                this.stateService.save('loginRedirect',
                    { route: '/settings/create-organization', qParams: { plan: qParams.org } });
            }
            await super.ngOnInit();
        });
    }

    async goAfterLogIn() {
        const invite = await this.stateService.get<any>('orgInvitation');
        if (invite != null) {
            this.router.navigate(['accept-organization'], { queryParams: invite });
        } else {
            const loginRedirect = await this.stateService.get<any>('loginRedirect');
            if (loginRedirect != null) {
                this.router.navigate([loginRedirect.route], { queryParams: loginRedirect.qParams });
                await this.stateService.remove('loginRedirect');
            } else {
                this.router.navigate([this.successRoute]);
            }
        }
    }
}
