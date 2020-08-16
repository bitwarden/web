import { Component, OnDestroy } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CollectionView } from 'jslib/models/view/collectionView';

import { CollectionsComponent as BaseCollectionsComponent } from 'jslib/angular/components/collections.component';

@Component({
    selector: 'app-vault-collections',
    templateUrl: 'collections.component.html',
})
export class CollectionsComponent extends BaseCollectionsComponent implements OnDestroy {
    constructor(
        collectionService: CollectionService,
        platformUtilsService: PlatformUtilsService,
        i18nService: I18nService,
        cipherService: CipherService
    ) {
        super(collectionService, platformUtilsService, i18nService, cipherService);
    }

    ngOnDestroy() {
        this.selectAll(false);
    }

    check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    selectAll(select: boolean) {
        this.collections.forEach((c) => this.check(c, select));
    }
}
