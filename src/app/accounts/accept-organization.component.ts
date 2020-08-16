import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Toast, ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { StateService } from 'jslib/abstractions/state.service';
import { UserService } from 'jslib/abstractions/user.service';

import { OrganizationUserAcceptRequest } from 'jslib/models/request/organizationUserAcceptRequest';

@Component({
    selector: 'app-accept-organization',
    templateUrl: 'accept-organization.component.html',
})
export class AcceptOrganizationComponent implements OnInit {
    loading = true;
    authed = false;
    orgName: string;
    email: string;
    actionPromise: Promise<any>;

    constructor(
        private router: Router,
        private toasterService: ToasterService,
        private i18nService: I18nService,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private userService: UserService,
        private stateService: StateService
    ) {}

    ngOnInit() {
        let fired = false;
        this.route.queryParams.subscribe(async (qParams) => {
            if (fired) {
                return;
            }
            fired = true;
            await this.stateService.remove('orgInvitation');
            let error =
                qParams.organizationId == null ||
                qParams.organizationUserId == null ||
                qParams.token == null;
            let errorMessage: string = null;
            if (!error) {
                this.authed = await this.userService.isAuthenticated();
                if (this.authed) {
                    const request = new OrganizationUserAcceptRequest();
                    request.token = qParams.token;
                    try {
                        this.actionPromise = this.apiService.postOrganizationUserAccept(
                            qParams.organizationId,
                            qParams.organizationUserId,
                            request
                        );
                        await this.actionPromise;
                        const toast: Toast = {
                            type: 'success',
                            title: this.i18nService.t('inviteAccepted'),
                            body: this.i18nService.t('inviteAcceptedDesc'),
                            timeout: 10000,
                        };
                        this.toasterService.popAsync(toast);
                        this.router.navigate(['/vault']);
                    } catch (e) {
                        error = true;
                        errorMessage = e.message;
                    }
                } else {
                    await this.stateService.save('orgInvitation', qParams);
                    this.email = qParams.email;
                    this.orgName = qParams.organizationName;
                    if (this.orgName != null) {
                        // Fix URL encoding of space issue with Angular
                        this.orgName = this.orgName.replace(/\+/g, ' ');
                    }
                }
            }

            if (error) {
                const toast: Toast = {
                    type: 'error',
                    title: null,
                    body:
                        errorMessage != null
                            ? this.i18nService.t('inviteAcceptFailedShort', errorMessage)
                            : this.i18nService.t('inviteAcceptFailed'),
                    timeout: 10000,
                };
                this.toasterService.popAsync(toast);
                this.router.navigate(['/']);
            }

            this.loading = false;
        });
    }
}
