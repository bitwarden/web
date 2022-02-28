import { Component } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { CollectionData } from "jslib-common/models/data/collectionData";
import { Collection } from "jslib-common/models/domain/collection";
import { Organization } from "jslib-common/models/domain/organization";
import { CollectionDetailsResponse } from "jslib-common/models/response/collectionResponse";
import { CollectionView } from "jslib-common/models/view/collectionView";

import { GroupingsComponent as BaseGroupingsComponent } from "../../vault/groupings.component";

@Component({
  selector: "app-org-vault-groupings",
  templateUrl: "../../vault/groupings.component.html",
})
export class GroupingsComponent extends BaseGroupingsComponent {
  organization: Organization;

  constructor(
    collectionService: CollectionService,
    folderService: FolderService,
    stateService: StateService,
    private apiService: ApiService,
    private i18nService: I18nService
  ) {
    super(collectionService, folderService, stateService);
  }

  async loadCollections() {
    if (!this.organization.canEditAnyCollection) {
      await super.loadCollections(this.organization.id);
      return;
    }

    const collections = await this.apiService.getCollections(this.organization.id);
    if (collections != null && collections.data != null && collections.data.length) {
      const collectionDomains = collections.data.map(
        (r) => new Collection(new CollectionData(r as CollectionDetailsResponse))
      );
      this.collections = await this.collectionService.decryptMany(collectionDomains);
    } else {
      this.collections = [];
    }

    const unassignedCollection = new CollectionView();
    unassignedCollection.name = this.i18nService.t("unassigned");
    unassignedCollection.id = "unassigned";
    unassignedCollection.organizationId = this.organization.id;
    unassignedCollection.readOnly = true;
    this.collections.push(unassignedCollection);
    this.nestedCollections = await this.collectionService.getAllNested(this.collections);
  }

  async collapse(grouping: CollectionView) {
    await super.collapse(grouping, "org_");
  }

  isCollapsed(grouping: CollectionView) {
    return super.isCollapsed(grouping, "org_");
  }
}
