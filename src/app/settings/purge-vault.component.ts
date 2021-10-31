import {
    Component,
    Input,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { Verification } from 'jslib-common/types/verification';

@Component({
    selector: 'app-purge-vault',
    templateUrl: 'purge-vault.component.html',
})
export class PurgeVaultComponent {
    @Input() organizationId?: string = null;

    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private userService: UserService,
        private router: Router, private logService: LogService) { }

    async submit() {
        const request = await this.userService.buildVerificationRequest(this.masterPassword);
        if (request == null) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return;
        }

        try {
            this.formPromise = this.apiService.postPurgeCiphers(request, this.organizationId);
            await this.formPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('vaultPurged'));
            if (this.organizationId != null) {
                this.router.navigate(['organizations', this.organizationId, 'vault']);
            } else {
                this.router.navigate(['vault']);
            }
        } catch (e) {
            this.logService.error(e);
        }
    }
}
