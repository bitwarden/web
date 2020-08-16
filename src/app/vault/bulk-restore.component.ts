import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-vault-bulk-restore',
    templateUrl: 'bulk-restore.component.html',
})
export class BulkRestoreComponent {
    @Input() cipherIds: string[] = [];
    @Output() onRestored = new EventEmitter();

    formPromise: Promise<any>;

    constructor(
        private analytics: Angulartics2,
        private cipherService: CipherService,
        private toasterService: ToasterService,
        private i18nService: I18nService
    ) {}

    async submit() {
        this.formPromise = this.cipherService.restoreManyWithServer(this.cipherIds);
        await this.formPromise;
        this.onRestored.emit();
        this.analytics.eventTrack.next({ action: 'Bulk Restored Items' });
        this.toasterService.popAsync('success', null, this.i18nService.t('restoredItems'));
    }
}
