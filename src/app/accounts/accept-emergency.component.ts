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

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { StateService } from 'jslib/abstractions/state.service';
import { UserService } from 'jslib/abstractions/user.service';
import { EmergencyAccessAcceptRequest } from 'jslib/models/request/emergencyAccessAcceptRequest';

@Component({
    selector: 'app-accept-emergency',
    templateUrl: 'accept-emergency.component.html',
})
export class AcceptEmergencyComponent implements OnInit {
    loading = true;
    authed = false;
    name: string;
    email: string;
    actionPromise: Promise<any>;

    constructor(private router: Router, private toasterService: ToasterService,
        private i18nService: I18nService, private route: ActivatedRoute,
        private apiService: ApiService, private userService: UserService,
        private stateService: StateService) { }

    ngOnInit() {
        let fired = false;
        this.route.queryParams.subscribe(async qParams => {
            if (fired) {
                return;
            }
            fired = true;
            await this.stateService.remove('emergencyInvitation');
            let error = qParams.id == null || qParams.name == null || qParams.email == null || qParams.token == null;
            let errorMessage: string = null;
            if (!error) {
                this.authed = await this.userService.isAuthenticated();
                if (this.authed) {
                    const request = new EmergencyAccessAcceptRequest();
                    request.token = qParams.token;
                    try {
                        this.actionPromise = this.apiService.postEmergencyAccessAccept(qParams.id, request);
                        await this.actionPromise;
                        const toast: Toast = {
                            type: 'success',
                            title: this.i18nService.t('inviteAccepted'),
                            body: this.i18nService.t('emergencyInviteAcceptedDesc'),
                            timeout: 10000,
                        };
                        this.toasterService.popAsync(toast);
                        this.router.navigate(['/vault']);
                    } catch (e) {
                        error = true;
                        errorMessage = e.message;
                    }
                } else {
                    await this.stateService.save('emergencyInvitation', qParams);
                    this.email = qParams.email;
                    this.name = qParams.name;
                    if (this.name != null) {
                        // Fix URL encoding of space issue with Angular
                        this.name = this.name.replace(/\+/g, ' ');
                    }
                }
            }

            if (error) {
                const toast: Toast = {
                    type: 'error',
                    title: null,
                    body: errorMessage != null ? this.i18nService.t('emergencyInviteAcceptFailedShort', errorMessage) :
                        this.i18nService.t('emergencyInviteAcceptFailed'),
                    timeout: 10000,
                };
                this.toasterService.popAsync(toast);
                this.router.navigate(['/']);
            }

            this.loading = false;
        });
    }
}
