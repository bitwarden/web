import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Utils } from "jslib-common/misc/utils";
import { EncString } from "jslib-common/models/domain/encString";
import { SymmetricCryptoKey } from "jslib-common/models/domain/symmetricCryptoKey";
import { CollectionRequest } from "jslib-common/models/request/collectionRequest";
import { SelectionReadOnlyRequest } from "jslib-common/models/request/selectionReadOnlyRequest";
import { GroupResponse } from "jslib-common/models/response/groupResponse";

@Component({
  selector: "app-collection-add-edit",
  templateUrl: "collection-add-edit.component.html",
})
export class CollectionAddEditComponent implements OnInit {
  @Input() collectionId: string;
  @Input() organizationId: string;
  @Input() canSave: boolean;
  @Input() canDelete: boolean;
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
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private logService: LogService,
    private organizationService: OrganizationService
  ) {}

  async ngOnInit() {
    const organization = await this.organizationService.get(this.organizationId);
    this.accessGroups = organization.useGroups;
    this.editMode = this.loading = this.collectionId != null;
    if (this.accessGroups) {
      const groupsResponse = await this.apiService.getGroups(this.organizationId);
      this.groups = groupsResponse.data
        .map((r) => r)
        .sort(Utils.getSortFunction(this.i18nService, "name"));
    }
    this.orgKey = await this.cryptoService.getOrgKey(this.organizationId);

    if (this.editMode) {
      this.editMode = true;
      this.title = this.i18nService.t("editCollection");
      try {
        const collection = await this.apiService.getCollectionDetails(
          this.organizationId,
          this.collectionId
        );
        this.name = await this.cryptoService.decryptToUtf8(
          new EncString(collection.name),
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
      } catch (e) {
        this.logService.error(e);
      }
    } else {
      this.title = this.i18nService.t("addCollection");
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
      throw new Error("No encryption key for this organization.");
    }

    const request = new CollectionRequest();
    request.name = (await this.cryptoService.encrypt(this.name, this.orgKey)).encryptedString;
    request.externalId = this.externalId;
    request.groups = this.groups
      .filter((g) => (g as any).checked && !g.accessAll)
      .map(
        (g) => new SelectionReadOnlyRequest(g.id, !!(g as any).readOnly, !!(g as any).hidePasswords)
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
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t(this.editMode ? "editedCollectionId" : "createdCollectionId", this.name)
      );
      this.onSavedCollection.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async delete() {
    if (!this.editMode) {
      return;
    }

    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("deleteCollectionConfirmation"),
      this.name,
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.deletePromise = this.apiService.deleteCollection(this.organizationId, this.collectionId);
      await this.deletePromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("deletedCollectionId", this.name)
      );
      this.onDeletedCollection.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
