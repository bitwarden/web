import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { Verification } from 'jslib-common/types/verification';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { UserVerificationService } from 'jslib-common/abstractions/userVerification.service';

import { PasswordVerificationRequest } from 'jslib-common/models/request/passwordVerificationRequest';

@Component({
    selector: 'app-delete-organization',
    templateUrl: 'delete-organization.component.html',
})
export class DeleteOrganizationComponent {
    organizationId: string;

    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private userVerificationService: UserVerificationService,
        private router: Router, private logService: LogService) { }

    async submit() {
        let request: PasswordVerificationRequest;
        try {
            request = await this.userVerificationService.buildRequest(this.masterPassword);
        } catch (e) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'), e.message);
            return;
        }

        try {
            this.formPromise = this.apiService.deleteOrganization(this.organizationId, request);
            await this.formPromise;
            this.toasterService.popAsync('success', this.i18nService.t('organizationDeleted'),
                this.i18nService.t('organizationDeletedDesc'));
            this.router.navigate(['/']);
        } catch (e) {
            this.logService.error(e);
        }
    }
}
