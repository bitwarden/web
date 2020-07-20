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
import { Organization } from 'jslib/models/domain/organization';
import { ApiService } from 'jslib/abstractions';
import { CipherBulkDeleteRequest } from 'jslib/models/request/cipherBulkDeleteRequest';

@Component({
    selector: 'app-vault-bulk-delete',
    templateUrl: 'bulk-delete.component.html',
})
export class BulkDeleteComponent {
    @Input() cipherIds: string[] = [];
    @Input() permanent: boolean = false;
    @Input() organization: Organization;
    @Output() onDeleted = new EventEmitter();

    constructor(private analytics: Angulartics2, private cipherService: CipherService,
        private toasterService: ToasterService, private i18nService: I18nService, private apiService: ApiService) { }

    async submit() {
        if (!this.organization || !this.organization.isAdmin) {
            this.permanent
                ? await this.cipherService.deleteManyWithServer(this.cipherIds)
                : await this.cipherService.softDeleteManyWithServer(this.cipherIds);
        }
        else {
            this.permanent
                ? await this.apiService.deleteManyCiphersAdmin(new CipherBulkDeleteRequest(this.cipherIds))
                : await this.apiService.putDeleteManyCiphersAdmin(new CipherBulkDeleteRequest(this.cipherIds))
        }

        this.onDeleted.emit();
        this.analytics.eventTrack.next({ action: 'Bulk Deleted Items' });
        this.toasterService.popAsync('success', null, this.i18nService.t(this.permanent ? 'permanentlyDeletedItems'
            : 'deletedItems'));
    }
}
