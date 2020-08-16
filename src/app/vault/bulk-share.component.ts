import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherView } from 'jslib/models/view';
import { CollectionView } from 'jslib/models/view/collectionView';

import { Organization } from 'jslib/models/domain/organization';

@Component({
    selector: 'app-vault-bulk-share',
    templateUrl: 'bulk-share.component.html',
})
export class BulkShareComponent implements OnInit {
    @Input() ciphers: CipherView[] = [];
    @Input() organizationId: string;
    @Output() onShared = new EventEmitter();

    nonShareableCount = 0;
    collections: CollectionView[] = [];
    organizations: Organization[] = [];
    shareableCiphers: CipherView[] = [];
    formPromise: Promise<any>;

    private writeableCollections: CollectionView[] = [];

    constructor(
        private analytics: Angulartics2,
        private cipherService: CipherService,
        private toasterService: ToasterService,
        private i18nService: I18nService,
        private collectionService: CollectionService,
        private userService: UserService
    ) {}

    async ngOnInit() {
        this.shareableCiphers = this.ciphers.filter(
            (c) => !c.hasOldAttachments && c.organizationId == null
        );
        this.nonShareableCount = this.ciphers.length - this.shareableCiphers.length;
        const allCollections = await this.collectionService.getAllDecrypted();
        this.writeableCollections = allCollections.filter((c) => !c.readOnly);
        this.organizations = await this.userService.getAllOrganizations();
        if (this.organizationId == null && this.organizations.length > 0) {
            this.organizationId = this.organizations[0].id;
        }
        this.filterCollections();
    }

    ngOnDestroy() {
        this.selectAll(false);
    }

    filterCollections() {
        this.selectAll(false);
        if (this.organizationId == null || this.writeableCollections.length === 0) {
            this.collections = [];
        } else {
            this.collections = this.writeableCollections.filter(
                (c) => c.organizationId === this.organizationId
            );
        }
    }

    async submit() {
        const checkedCollectionIds = this.collections
            .filter((c) => (c as any).checked)
            .map((c) => c.id);
        try {
            this.formPromise = this.cipherService.shareManyWithServer(
                this.shareableCiphers,
                this.organizationId,
                checkedCollectionIds
            );
            await this.formPromise;
            this.onShared.emit();
            this.analytics.eventTrack.next({ action: 'Bulk Shared Items' });
            this.toasterService.popAsync('success', null, this.i18nService.t('sharedItems'));
        } catch {}
    }

    check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    selectAll(select: boolean) {
        const collections = select ? this.collections : this.writeableCollections;
        collections.forEach((c) => this.check(c, select));
    }

    get canSave() {
        if (
            this.shareableCiphers != null &&
            this.shareableCiphers.length > 0 &&
            this.collections != null
        ) {
            for (let i = 0; i < this.collections.length; i++) {
                if ((this.collections[i] as any).checked) {
                    return true;
                }
            }
        }
        return false;
    }
}
