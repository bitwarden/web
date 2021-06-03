import {
    Component,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import {
    Toast,
    ToasterService,
} from 'angular2-toaster';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { StateService } from 'jslib/abstractions/state.service';
import { UserService } from 'jslib/abstractions/user.service';

@Component({
    selector: 'app-setup-provider',
    templateUrl: 'setup-provider.component.html',
})
export class SetupProviderComponent implements OnInit {
    loading = true;
    authed = false;
    email: string;
    actionPromise: Promise<any>;

    constructor(private router: Router, private toasterService: ToasterService,
        private i18nService: I18nService, private route: ActivatedRoute,
        private userService: UserService, private stateService: StateService) { }

    ngOnInit() {
        let fired = false;
        this.route.queryParams.subscribe(async qParams => {
            if (fired) {
                return;
            }
            fired = true;
            await this.stateService.remove('loginRedirect');
            const error = qParams.providerId == null || qParams.email == null || qParams.token == null;

            if (!error) {
                this.authed = await this.userService.isAuthenticated();
                if (this.authed) {
                    this.router.navigate(['providers/setup'], { queryParams: qParams });
                } else {
                    await this.stateService.save('loginRedirect', {
                        route: 'providers/setup',
                        qParams: qParams,
                    });
                    this.email = qParams.email;
                }
            }

            if (error) {
                const toast: Toast = {
                    type: 'error',
                    title: null,
                    body: this.i18nService.t('emergencyInviteAcceptFailed'),
                    timeout: 10000,
                };
                this.toasterService.popAsync(toast);
                this.router.navigate(['/']);
            }

            this.loading = false;
        });
    }
}
