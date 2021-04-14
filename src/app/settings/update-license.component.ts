import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-update-license',
    templateUrl: 'update-license.component.html',
})
export class UpdateLicenseComponent {
    @Input() organizationId: string;
    @Output() onUpdated = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService) { }

    async submit() {
        const fileEl = document.getElementById('file') as HTMLInputElement;
        const files = fileEl.files;
        if (files == null || files.length === 0) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('selectFile'));
            return;
        }

        try {
            const fd = new FormData();
            fd.append('license', files[0]);

            let updatePromise: Promise<any> = null;
            if (this.organizationId == null) {
                updatePromise = this.apiService.postAccountLicense(fd);
            } else {
                updatePromise = this.apiService.postOrganizationLicenseUpdate(this.organizationId, fd);
            }

            this.formPromise = updatePromise.then(() => {
                return this.apiService.refreshIdentityToken();
            });

            await this.formPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('updatedLicense'));
            this.onUpdated.emit();
        } catch { }
    }

    cancel() {
        this.onCanceled.emit();
    }
}
