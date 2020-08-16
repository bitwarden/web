import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherString } from 'jslib/models/domain/cipherString';
import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';
import { CollectionRequest } from 'jslib/models/request/collectionRequest';
import { SelectionReadOnlyRequest } from 'jslib/models/request/selectionReadOnlyRequest';
import { GroupResponse } from 'jslib/models/response/groupResponse';

import { Utils } from 'jslib/misc/utils';

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
    editMode = false;
    accessGroups = false;
    title: string;
    name: string;
    externalId: string;
    groups: GroupResponse[] = [];
    formPromise: Promise<any>;
    deletePromise: Promise<any>;

    private orgKey: SymmetricCryptoKey;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private platformUtilsService: PlatformUtilsService,
        private cryptoService: CryptoService,
        private userService: UserService
    ) {}

    async ngOnInit() {
        const organization = await this.userService.getOrganization(this.organizationId);
        this.accessGroups = organization.useGroups;
        this.editMode = this.loading = this.collectionId != null;
        if (this.accessGroups) {
            const groupsResponse = await this.apiService.getGroups(this.organizationId);
            this.groups = groupsResponse.data
                .map((r) => r)
                .sort(Utils.getSortFunction(this.i18nService, 'name'));
        }
        this.orgKey = await this.cryptoService.getOrgKey(this.organizationId);

        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editCollection');
            try {
                const collection = await this.apiService.getCollectionDetails(
                    this.organizationId,
                    this.collectionId
                );
                this.name = await this.cryptoService.decryptToUtf8(
                    new CipherString(collection.name),
                    this.orgKey
                );
                this.externalId = collection.externalId;
                if (collection.groups != null && this.groups.length > 0) {
                    collection.groups.forEach((s) => {
                        const group = this.groups.filter((g) => !g.accessAll && g.id === s.id);
                        if (group != null && group.length > 0) {
                            (group[0] as any).checked = true;
                            (group[0] as any).readOnly = s.readOnly;
                            (group[0] as any).hidePasswords = s.hidePasswords;
                        }
                    });
                }
            } catch {}
        } else {
            this.title = this.i18nService.t('addCollection');
        }

        this.groups.forEach((g) => {
            if (g.accessAll) {
                (g as any).checked = true;
            }
        });

        this.loading = false;
    }

    check(g: GroupResponse, select?: boolean) {
        if (g.accessAll) {
            return;
        }
        (g as any).checked = select == null ? !(g as any).checked : select;
        if (!(g as any).checked) {
            (g as any).readOnly = false;
            (g as any).hidePasswords = false;
        }
    }

    selectAll(select: boolean) {
        this.groups.forEach((g) => this.check(g, select));
    }

    async submit() {
        if (this.orgKey == null) {
            throw new Error('No encryption key for this organization.');
        }

        const request = new CollectionRequest();
        request.name = (await this.cryptoService.encrypt(this.name, this.orgKey)).encryptedString;
        request.externalId = this.externalId;
        request.groups = this.groups
            .filter((g) => (g as any).checked && !g.accessAll)
            .map(
                (g) =>
                    new SelectionReadOnlyRequest(
                        g.id,
                        !!(g as any).readOnly,
                        !!(g as any).hidePasswords
                    )
            );

        try {
            if (this.editMode) {
                this.formPromise = this.apiService.putCollection(
                    this.organizationId,
                    this.collectionId,
                    request
                );
            } else {
                this.formPromise = this.apiService.postCollection(this.organizationId, request);
            }
            await this.formPromise;
            this.analytics.eventTrack.next({
                action: this.editMode ? 'Edited Collection' : 'Created Collection',
            });
            this.toasterService.popAsync(
                'success',
                null,
                this.i18nService.t(
                    this.editMode ? 'editedCollectionId' : 'createdCollectionId',
                    this.name
                )
            );
            this.onSavedCollection.emit();
        } catch {}
    }

    async delete() {
        if (!this.editMode) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteCollectionConfirmation'),
            this.name,
            this.i18nService.t('yes'),
            this.i18nService.t('no'),
            'warning'
        );
        if (!confirmed) {
            return false;
        }

        try {
            this.deletePromise = this.apiService.deleteCollection(
                this.organizationId,
                this.collectionId
            );
            await this.deletePromise;
            this.analytics.eventTrack.next({ action: 'Deleted Collection' });
            this.toasterService.popAsync(
                'success',
                null,
                this.i18nService.t('deletedCollectionId', this.name)
            );
            this.onDeletedCollection.emit();
        } catch {}
    }
}
