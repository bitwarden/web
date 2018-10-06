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
    collectionIds: string[];
    collections: CollectionView[] = [];

    protected cipherDomain: Cipher;

    constructor(protected collectionService: CollectionService, protected analytics: Angulartics2,
        protected toasterService: ToasterService, protected i18nService: I18nService,
        protected cipherService: CipherService) { }

    async ngOnInit() {
        this.cipherDomain = await this.loadCipher();
        this.collectionIds = this.loadCipherCollections();
        this.cipher = await this.cipherDomain.decrypt();
        this.collections = await this.loadCollections();

        this.selectAll(false);
        if (this.collectionIds != null) {
            this.collections.forEach((c) => {
                (c as any).checked = this.collectionIds.indexOf(c.id) > -1;
            });
        }
    }

    ngOnDestroy() {
        this.selectAll(false);
    }

    async submit() {
        this.cipherDomain.collectionIds = this.collections
            .filter((c) => !!(c as any).checked)
            .map((c) => c.id);
        this.formPromise = this.saveCollections();
        await this.formPromise;
        this.onSavedCollections.emit();
        this.analytics.eventTrack.next({ action: 'Edited Cipher Collections' });
        this.toasterService.popAsync('success', null, this.i18nService.t('editedItem'));
    }

    selectAll(select: boolean) {
        this.collections.forEach((c) => this.check(c, select));
    }

    protected check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    protected loadCipher() {
        return this.cipherService.get(this.cipherId);
    }

    protected loadCipherCollections() {
        return this.cipherDomain.collectionIds;
    }

    protected async loadCollections() {
        const allCollections = await this.collectionService.getAllDecrypted();
        return allCollections.filter((c) => !c.readOnly && c.organizationId === this.cipher.organizationId);
    }

    protected saveCollections() {
        return this.cipherService.saveCollectionsWithServer(this.cipherDomain);
    }
}
