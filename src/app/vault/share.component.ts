import {
    Component,
    OnDestroy,
} from '@angular/core';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { OrganizationService } from 'jslib-common/abstractions/organization.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { CollectionView } from 'jslib-common/models/view/collectionView';

import { ShareComponent as BaseShareComponent } from 'jslib-angular/components/share.component';

@Component({
    selector: 'app-vault-share',
    templateUrl: 'share.component.html',
})
export class ShareComponent extends BaseShareComponent implements OnDestroy {
    constructor(collectionService: CollectionService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, cipherService: CipherService,
        activeAccount: ActiveAccountService, organizationService: OrganizationService) {
        super(collectionService, platformUtilsService, i18nService, cipherService,
            activeAccount, organizationService);
    }

    ngOnDestroy() {
        this.selectAll(false);
    }

    check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    selectAll(select: boolean) {
        const collections = select ? this.collections : this.writeableCollections;
        collections.forEach(c => this.check(c, select));
    }
}
