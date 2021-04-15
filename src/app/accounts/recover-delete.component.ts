import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { DeleteRecoverRequest } from 'jslib/models/request/deleteRecoverRequest';

@Component({
    selector: 'app-recover-delete',
    templateUrl: 'recover-delete.component.html',
})
export class RecoverDeleteComponent {
    email: string;
    formPromise: Promise<any>;

    constructor(private router: Router, private apiService: ApiService,
        private toasterService: ToasterService, private i18nService: I18nService) {
    }

    async submit() {
        try {
            const request = new DeleteRecoverRequest();
            request.email = this.email.trim().toLowerCase();
            this.formPromise = this.apiService.postAccountRecoverDelete(request);
            await this.formPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('deleteRecoverEmailSent'));
            this.router.navigate(['/']);
        } catch { }
    }
}
