import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";

import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SearchService } from "jslib-common/abstractions/search.service";
import { CollectionData } from "jslib-common/models/data/collectionData";
import { Collection } from "jslib-common/models/domain/collection";
import { Organization } from "jslib-common/models/domain/organization";
import {
  CollectionDetailsResponse,
  CollectionResponse,
} from "jslib-common/models/response/collectionResponse";
import { ListResponse } from "jslib-common/models/response/listResponse";
import { CollectionView } from "jslib-common/models/view/collectionView";

import { EntityUsersComponent } from "../../modules/organizations/manage/entity-users.component";

import { CollectionAddEditComponent } from "./collection-add-edit.component";

@Component({
  selector: "app-org-manage-collections",
  templateUrl: "collections.component.html",
})
export class CollectionsComponent implements OnInit {
  @ViewChild("addEdit", { read: ViewContainerRef, static: true }) addEditModalRef: ViewContainerRef;
  @ViewChild("usersTemplate", { read: ViewContainerRef, static: true })
  usersModalRef: ViewContainerRef;

  loading = true;
  organization: Organization;
  canCreate = false;
  organizationId: string;
  collections: CollectionView[];
  assignedCollections: CollectionView[];
  pagedCollections: CollectionView[];
  searchText: string;

  protected didScroll = false;
  protected pageSize = 100;

  private pagedCollectionsCount = 0;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private modalService: ModalService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private searchService: SearchService,
    private logService: LogService,
    private organizationService: OrganizationService
  ) {}

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load();
      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        this.searchText = qParams.search;
      });
    });
  }

  async load() {
    this.organization = await this.organizationService.get(this.organizationId);
    this.canCreate = this.organization.canCreateNewCollections;

    const decryptCollections = async (r: ListResponse<CollectionResponse>) => {
      const collections = r.data
        .filter((c) => c.organizationId === this.organizationId)
        .map((d) => new Collection(new CollectionData(d as CollectionDetailsResponse)));
      return await this.collectionService.decryptMany(collections);
    };

    if (this.organization.canViewAssignedCollections) {
      const response = await this.apiService.getUserCollections();
      this.assignedCollections = await decryptCollections(response);
    }

    if (this.organization.canViewAllCollections) {
      const response = await this.apiService.getCollections(this.organizationId);
      this.collections = await decryptCollections(response);
    } else {
      this.collections = this.assignedCollections;
    }

    this.resetPaging();
    this.loading = false;
  }

  loadMore() {
    if (!this.collections || this.collections.length <= this.pageSize) {
      return;
    }
    const pagedLength = this.pagedCollections.length;
    let pagedSize = this.pageSize;
    if (pagedLength === 0 && this.pagedCollectionsCount > this.pageSize) {
      pagedSize = this.pagedCollectionsCount;
    }
    if (this.collections.length > pagedLength) {
      this.pagedCollections = this.pagedCollections.concat(
        this.collections.slice(pagedLength, pagedLength + pagedSize)
      );
    }
    this.pagedCollectionsCount = this.pagedCollections.length;
    this.didScroll = this.pagedCollections.length > this.pageSize;
  }

  async edit(collection: CollectionView) {
    const canCreate = collection == null && this.canCreate;
    const canEdit = collection != null && this.canEdit(collection);
    const canDelete = collection != null && this.canDelete(collection);

    if (!(canCreate || canEdit || canDelete)) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("missingPermissions"));
      return;
    }

    const [modal] = await this.modalService.openViewRef(
      CollectionAddEditComponent,
      this.addEditModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.collectionId = collection != null ? collection.id : null;
        comp.canSave = canCreate || canEdit;
        comp.canDelete = canDelete;
        comp.onSavedCollection.subscribe(() => {
          modal.close();
          this.load();
        });
        comp.onDeletedCollection.subscribe(() => {
          modal.close();
          this.removeCollection(collection);
        });
      }
    );
  }

  add() {
    this.edit(null);
  }

  async delete(collection: CollectionView) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("deleteCollectionConfirmation"),
      collection.name,
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      await this.apiService.deleteCollection(this.organizationId, collection.id);
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("deletedCollectionId", collection.name)
      );
      this.removeCollection(collection);
    } catch (e) {
      this.logService.error(e);
      this.platformUtilsService.showToast("error", null, this.i18nService.t("missingPermissions"));
    }
  }

  async users(collection: CollectionView) {
    const [modal] = await this.modalService.openViewRef(
      EntityUsersComponent,
      this.usersModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.entity = "collection";
        comp.entityId = collection.id;
        comp.entityName = collection.name;

        comp.onEditedUsers.subscribe(() => {
          this.load();
          modal.close();
        });
      }
    );
  }

  async resetPaging() {
    this.pagedCollections = [];
    this.loadMore();
  }

  isSearching() {
    return this.searchService.isSearchable(this.searchText);
  }

  isPaging() {
    const searching = this.isSearching();
    if (searching && this.didScroll) {
      this.resetPaging();
    }
    return !searching && this.collections && this.collections.length > this.pageSize;
  }

  canEdit(collection: CollectionView) {
    if (this.organization.canEditAnyCollection) {
      return true;
    }

    if (
      this.organization.canEditAssignedCollections &&
      this.assignedCollections.some((c) => c.id === collection.id)
    ) {
      return true;
    }
    return false;
  }

  canDelete(collection: CollectionView) {
    if (this.organization.canDeleteAnyCollection) {
      return true;
    }

    if (
      this.organization.canDeleteAssignedCollections &&
      this.assignedCollections.some((c) => c.id === collection.id)
    ) {
      return true;
    }
    return false;
  }

  private removeCollection(collection: CollectionView) {
    const index = this.collections.indexOf(collection);
    if (index > -1) {
      this.collections.splice(index, 1);
      this.resetPaging();
    }
  }
}
