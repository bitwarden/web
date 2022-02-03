import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Organization } from "jslib-common/models/domain/organization";
import { CipherView } from "jslib-common/models/view/cipherView";
import { CollectionView } from "jslib-common/models/view/collectionView";

@Component({
  selector: "app-vault-bulk-share",
  templateUrl: "bulk-share.component.html",
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
    private cipherService: CipherService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private collectionService: CollectionService,
    private organizationService: OrganizationService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    this.shareableCiphers = this.ciphers.filter(
      (c) => !c.hasOldAttachments && c.organizationId == null
    );
    this.nonShareableCount = this.ciphers.length - this.shareableCiphers.length;
    const allCollections = await this.collectionService.getAllDecrypted();
    this.writeableCollections = allCollections.filter((c) => !c.readOnly);
    this.organizations = await this.organizationService.getAll();
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
      const orgName =
        this.organizations.find((o) => o.id === this.organizationId)?.name ??
        this.i18nService.t("organization");
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("movedItemsToOrg", orgName)
      );
    } catch (e) {
      this.logService.error(e);
    }
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
