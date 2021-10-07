import {
    Directive,
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

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { StateService } from 'jslib-common/abstractions/state.service';

@Directive()
export abstract class BaseAcceptComponent implements OnInit {
    loading = true;
    authed = false;
    email: string;
    actionPromise: Promise<any>;

    protected requiredParameters: string[] = [];
    protected failedShortMessage = 'inviteAcceptFailedShort';
    protected failedMessage = 'inviteAcceptFailed';

    constructor(protected router: Router, protected toasterService: ToasterService,
        protected i18nService: I18nService, protected route: ActivatedRoute,
        protected stateService: StateService, protected activeAccount: ActiveAccountService) { }

    abstract authedHandler(qParams: any): Promise<void>;
    abstract unauthedHandler(qParams: any): Promise<void>;

    ngOnInit() {
        let fired = false;
        this.route.queryParams.subscribe(async qParams => {
            if (fired) {
                return;
            }
            fired = true;
            await this.stateService.remove('loginRedirect');

            let error = this.requiredParameters.some(e => qParams?.[e] == null || qParams[e] === '');
            let errorMessage: string = null;
            if (!error) {
                this.authed = this.activeAccount.isAuthenticated;

                if (this.authed) {
                    try {
                        await this.authedHandler(qParams);
                    } catch (e) {
                        error = true;
                        errorMessage = e.message;
                    }
                } else {
                    await this.stateService.save('loginRedirect', {
                        route: this.getRedirectRoute(),
                        qParams: qParams,
                    });

                    this.email = qParams.email;
                    await this.unauthedHandler(qParams);
                }
            }

            if (error) {
                const toast: Toast = {
                    type: 'error',
                    title: null,
                    body: errorMessage != null ? this.i18nService.t(this.failedShortMessage, errorMessage) :
                        this.i18nService.t(this.failedMessage),
                    timeout: 10000,
                };
                this.toasterService.popAsync(toast);
                this.router.navigate(['/']);
            }

            this.loading = false;
        });
    }

    getRedirectRoute() {
        const urlTree = this.router.parseUrl(this.router.url);
        urlTree.queryParams = {};
        return urlTree.toString();
    }
}
