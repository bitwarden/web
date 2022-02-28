import { Component, OnDestroy } from "@angular/core";

import { CollectionsComponent as BaseCollectionsComponent } from "jslib-angular/components/collections.component";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { CollectionView } from "jslib-common/models/view/collectionView";

@Component({
  selector: "app-vault-collections",
  templateUrl: "collections.component.html",
})
export class CollectionsComponent extends BaseCollectionsComponent implements OnDestroy {
  constructor(
    collectionService: CollectionService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    cipherService: CipherService,
    logService: LogService
  ) {
    super(collectionService, platformUtilsService, i18nService, cipherService, logService);
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
