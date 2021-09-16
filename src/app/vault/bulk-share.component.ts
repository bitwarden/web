import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { CipherView } from 'jslib-common/models/view/cipherView';
import { CollectionView } from 'jslib-common/models/view/collectionView';

import { Organization } from 'jslib-common/models/domain/organization';

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

    constructor(private cipherService: CipherService, private toasterService: ToasterService,
        private i18nService: I18nService, private collectionService: CollectionService,
        private userService: UserService) { }

    async ngOnInit() {
        this.shareableCiphers = this.ciphers.filter(c => !c.hasOldAttachments && c.organizationId == null);
        this.nonShareableCount = this.ciphers.length - this.shareableCiphers.length;
        const allCollections = await this.collectionService.getAllDecrypted();
        this.writeableCollections = allCollections.filter(c => !c.readOnly);
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
            this.collections = this.writeableCollections.filter(c => c.organizationId === this.organizationId);
        }
    }

    async submit() {
        const checkedCollectionIds = this.collections.filter(c => (c as any).checked).map(c => c.id);
        try {
            this.formPromise = this.cipherService.shareManyWithServer(this.shareableCiphers, this.organizationId,
                checkedCollectionIds);
            await this.formPromise;
            this.onShared.emit();
            const orgName = this.organizations.find(o => o.id === this.organizationId)?.name ?? this.i18nService.t('organization');
            this.toasterService.popAsync('success', null, this.i18nService.t('movedItemsToOrg', orgName));
        } catch { }
    }

    check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    selectAll(select: boolean) {
        const collections = select ? this.collections : this.writeableCollections;
        collections.forEach(c => this.check(c, select));
    }

    get canSave() {
        if (this.shareableCiphers != null && this.shareableCiphers.length > 0 && this.collections != null) {
            for (let i = 0; i < this.collections.length; i++) {
                if ((this.collections[i] as any).checked) {
                    return true;
                }
            }
        }
        return false;
    }
}
