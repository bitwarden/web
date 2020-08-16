import { Component, OnDestroy } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CollectionView } from 'jslib/models/view/collectionView';

import { ShareComponent as BaseShareComponent } from 'jslib/angular/components/share.component';

@Component({
    selector: 'app-vault-share',
    templateUrl: 'share.component.html',
})
export class ShareComponent extends BaseShareComponent implements OnDestroy {
    constructor(
        collectionService: CollectionService,
        platformUtilsService: PlatformUtilsService,
        i18nService: I18nService,
        userService: UserService,
        cipherService: CipherService
    ) {
        super(collectionService, platformUtilsService, i18nService, userService, cipherService);
    }

    ngOnDestroy() {
        this.selectAll(false);
    }

    check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    selectAll(select: boolean) {
        const collections = select ? this.collections : this.writeableCollections;
        collections.forEach((c) => this.check(c, select));
    }
}
