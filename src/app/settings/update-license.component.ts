import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-update-license',
    templateUrl: 'update-license.component.html',
})
export class UpdateLicenseComponent {
    @Input() user = true;
    @Output() onUpdated = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) { }

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

            if (this.user) {
                this.formPromise = this.apiService.postAccountLicense(fd);
            } else {
                // TODO
            }

            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Updated License' });
            this.toasterService.popAsync('success', null, this.i18nService.t('updatedLicense'));
            this.onUpdated.emit();
        } catch { }
    }

    cancel() {
        this.onCanceled.emit();
    }
}
