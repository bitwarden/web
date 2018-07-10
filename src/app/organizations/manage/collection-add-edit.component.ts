import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CipherString } from 'jslib/models/domain/cipherString';
import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';
import { CollectionRequest } from 'jslib/models/request/collectionRequest';
import { SelectionReadOnlyRequest } from 'jslib/models/request/selectionReadOnlyRequest';
import { GroupResponse } from 'jslib/models/response/groupResponse';

@Component({
    selector: 'app-collection-add-edit',
    templateUrl: 'collection-add-edit.component.html',
})
export class CollectionAddEditComponent implements OnInit {
    @Input() collectionId: string;
    @Input() organizationId: string;
    @Output() onSavedCollection = new EventEmitter();
    @Output() onDeletedCollection = new EventEmitter();

    loading = true;
    editMode: boolean = false;
    title: string;
    name: string;
    groups: GroupResponse[] = [];
    formPromise: Promise<any>;
    deletePromise: Promise<any>;

    private orgKey: SymmetricCryptoKey;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private platformUtilsService: PlatformUtilsService, private cryptoService: CryptoService) { }

    async ngOnInit() {
        this.editMode = this.loading = this.collectionId != null;
        const groupsResponse = await this.apiService.getGroups(this.organizationId);
        this.groups = groupsResponse.data.map((r) => r);
        this.orgKey = await this.cryptoService.getOrgKey(this.organizationId);

        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editCollection');
            try {
                const collection = await this.apiService.getCollectionDetails(this.organizationId, this.collectionId);
                this.name = await this.cryptoService.decryptToUtf8(new CipherString(collection.name), this.orgKey);
                if (collection.groups != null && this.groups != null) {
                    collection.groups.forEach((s) => {
                        const group = this.groups.filter((g) => g.id === s.id);
                        if (group != null && group.length > 0) {
                            (group[0] as any).checked = true;
                            (group[0] as any).readOnly = s.readOnly;
                        }
                    });
                }
            } catch { }
        } else {
            this.title = this.i18nService.t('addCollection');
        }

        this.loading = false;
    }

    check(g: GroupResponse, select?: boolean) {
        (g as any).checked = select == null ? !(g as any).checked : select;
        if (!(g as any).checked) {
            (g as any).readOnly = false;
        }
    }

    selectAll(select: boolean) {
        this.groups.forEach((g) => this.check(g, select));
    }

    async submit() {
        const request = new CollectionRequest();
        request.name = (await this.cryptoService.encrypt(this.name, this.orgKey)).encryptedString;
        request.groups = this.groups.filter((g) => (g as any).checked)
            .map((g) => new SelectionReadOnlyRequest(g.id, !!(g as any).readOnly));

        try {
            if (this.editMode) {
                this.formPromise = this.apiService.putCollection(this.organizationId, this.collectionId, request);
            } else {
                this.formPromise = this.apiService.postCollection(this.organizationId, request);
            }
            await this.formPromise;
            this.analytics.eventTrack.next({ action: this.editMode ? 'Edited Collection' : 'Created Collection' });
            this.toasterService.popAsync('success', null,
                this.i18nService.t(this.editMode ? 'editedCollectionId' : 'createdCollectionId', this.name));
            this.onSavedCollection.emit();
        } catch { }
    }

    async delete() {
        if (!this.editMode) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteCollectionConfirmation'), this.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.deletePromise = this.apiService.deleteCollection(this.organizationId, this.collectionId);
            await this.deletePromise;
            this.analytics.eventTrack.next({ action: 'Deleted Collection' });
            this.toasterService.popAsync('success', null, this.i18nService.t('deletedCollectionId', this.name));
            this.onDeletedCollection.emit();
        } catch { }
    }
}
