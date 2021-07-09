import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import {
    Toast,
    ToasterService,
} from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { EmergencyAccessAcceptRequest } from 'jslib-common/models/request/emergencyAccessAcceptRequest';
import { BaseAcceptComponent } from '../common/base.accept.component';

@Component({
    selector: 'app-accept-emergency',
    templateUrl: 'accept-emergency.component.html',
})
export class AcceptEmergencyComponent extends BaseAcceptComponent {

    name: string;

    protected requiredParameters: string[] = ['id', 'name', 'email', 'token'];
    protected failedShortMessage = 'emergencyInviteAcceptFailedShort';
    protected failedMessage = 'emergencyInviteAcceptFailed';

    constructor(router: Router, toasterService: ToasterService,
        i18nService: I18nService, route: ActivatedRoute,
        private apiService: ApiService, userService: UserService,
        stateService: StateService) {
        super(router, toasterService, i18nService, route, userService, stateService);
    }

    async authedHandler(qParams: any): Promise<void> {
        const request = new EmergencyAccessAcceptRequest();
        request.token = qParams.token;
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
    }

    async unauthedHandler(qParams: any): Promise<void> {
        this.name = qParams.name;
        if (this.name != null) {
            // Fix URL encoding of space issue with Angular
            this.name = this.name.replace(/\+/g, ' ');
        }
    }
}
