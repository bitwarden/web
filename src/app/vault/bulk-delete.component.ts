import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-vault-bulk-delete',
    templateUrl: 'bulk-delete.component.html',
})
export class BulkDeleteComponent {
    @Input() cipherIds: string[] = [];
    @Input() permanent: boolean = false;
    @Output() onDeleted = new EventEmitter();

    formPromise: Promise<any>;

    constructor(private analytics: Angulartics2, private cipherService: CipherService,
        private toasterService: ToasterService, private i18nService: I18nService) { }

    async submit() {
        console.log("this is a test");
        this.formPromise = this.permanent ? this.cipherService.deleteManyWithServer(this.cipherIds) :
            this.cipherService.softDeleteManyWithServer(this.cipherIds);
        await this.formPromise;
        this.onDeleted.emit();
        this.analytics.eventTrack.next({ action: 'Bulk Deleted Items' });
        this.toasterService.popAsync('success', null, this.i18nService.t(this.permanent ? 'permanentlyDeletedItems'
            : 'deletedItems'));
    }
}
