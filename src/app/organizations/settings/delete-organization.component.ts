import { 
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { Verification } from 'jslib-common/types/verification';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { UserVerificationService } from 'jslib-common/abstractions/userVerification.service';

@Component({
    selector: 'app-delete-organization',
    templateUrl: 'delete-organization.component.html',
})
export class DeleteOrganizationComponent {
    organizationId: string;
    descriptionKey = 'deleteOrganizationDesc';
    @Output() onSuccess: EventEmitter<any> = new EventEmitter();

    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private userVerificationService: UserVerificationService,
        private logService: LogService) { }

    async submit() {
        const request = await this.userVerificationService.buildRequest(this.masterPassword);

        try {
            this.formPromise = this.apiService.deleteOrganization(this.organizationId, request);
            await this.formPromise;
            this.toasterService.popAsync('success', this.i18nService.t('organizationDeleted'),
                this.i18nService.t('organizationDeletedDesc'));
            this.onSuccess.emit();
            //this.router.navigate(['/']);
        } catch (e) {
            this.logService.error(e);
        }
    }
}
