import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { CipherView } from 'jslib/models/view/cipherView';
import { CollectionView } from 'jslib/models/view/collectionView';

import { Cipher } from 'jslib/models/domain/cipher';

@Component({
    selector: 'app-vault-collections',
    templateUrl: 'collections.component.html',
})
export class CollectionsComponent implements OnInit, OnDestroy {
    @Input() cipherId: string;
    @Output() onSavedCollections = new EventEmitter();

    formPromise: Promise<any>;
    cipher: CipherView;
    collections: CollectionView[] = [];

    private cipherDomain: Cipher;

    constructor(private collectionService: CollectionService, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService,
        private cipherService: CipherService) { }

    async ngOnInit() {
        this.cipherDomain = await this.cipherService.get(this.cipherId);
        this.cipher = await this.cipherDomain.decrypt();
        const allCollections = await this.collectionService.getAllDecrypted();
        this.collections = allCollections.filter((c) =>
            !c.readOnly && c.organizationId === this.cipher.organizationId);

        this.unselectAll();
        if (this.cipherDomain.collectionIds != null) {
            for (const collection of this.collections) {
                (collection as any).checked = this.cipherDomain.collectionIds.indexOf(collection.id) > -1;
            }
        }
    }

    ngOnDestroy() {
        this.unselectAll();
    }

    async submit() {
        this.cipherDomain.collectionIds = this.collections
            .filter((c) => !!(c as any).checked)
            .map((c) => c.id);
        this.formPromise = this.cipherService.saveCollectionsWithServer(this.cipherDomain);
        await this.formPromise;
        this.onSavedCollections.emit();
        this.analytics.eventTrack.next({ action: 'Edited Cipher Collections' });
        this.toasterService.popAsync('success', null, this.i18nService.t('editedItem'));
    }

    check(c: CollectionView) {
        (c as any).checked = !(c as any).checked;
    }

    selectAll() {
        for (const c of this.collections) {
            (c as any).checked = true;
        }
    }

    unselectAll() {
        for (const c of this.collections) {
            (c as any).checked = false;
        }
    }
}
