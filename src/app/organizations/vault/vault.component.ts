import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ModalService } from "jslib-angular/services/modal.service";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { CipherType } from "jslib-common/enums/cipherType";
import { Organization } from "jslib-common/models/domain/organization";
import { CipherView } from "jslib-common/models/view/cipherView";

import { EntityEventsComponent } from "../manage/entity-events.component";

import { AddEditComponent } from "./add-edit.component";
import { AttachmentsComponent } from "./attachments.component";
import { CiphersComponent } from "./ciphers.component";
import { CollectionsComponent } from "./collections.component";
import { GroupingsComponent } from "./groupings.component";

const BroadcasterSubscriptionId = "OrgVaultComponent";

@Component({
  selector: "app-org-vault",
  templateUrl: "vault.component.html",
})
export class VaultComponent implements OnInit, OnDestroy {
  @ViewChild(GroupingsComponent, { static: true }) groupingsComponent: GroupingsComponent;
  @ViewChild(CiphersComponent, { static: true }) ciphersComponent: CiphersComponent;
  @ViewChild("attachments", { read: ViewContainerRef, static: true })
  attachmentsModalRef: ViewContainerRef;
  @ViewChild("cipherAddEdit", { read: ViewContainerRef, static: true })
  cipherAddEditModalRef: ViewContainerRef;
  @ViewChild("collections", { read: ViewContainerRef, static: true })
  collectionsModalRef: ViewContainerRef;
  @ViewChild("eventsTemplate", { read: ViewContainerRef, static: true })
  eventsModalRef: ViewContainerRef;

  organization: Organization;
  collectionId: string = null;
  type: CipherType = null;
  deleted = false;
  trashCleanupWarning: string = null;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private syncService: SyncService,
    private i18nService: I18nService,
    private modalService: ModalService,
    private messagingService: MessagingService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    private platformUtilsService: PlatformUtilsService
  ) {}

  ngOnInit() {
    this.trashCleanupWarning = this.i18nService.t(
      this.platformUtilsService.isSelfHost()
        ? "trashCleanupWarningSelfHosted"
        : "trashCleanupWarning"
    );
    this.route.parent.params.pipe(first()).subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      this.groupingsComponent.organization = this.organization;
      this.ciphersComponent.organization = this.organization;

      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        this.ciphersComponent.searchText = this.groupingsComponent.searchText = qParams.search;
        if (!this.organization.canViewAllCollections) {
          await this.syncService.fullSync(false);
          this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
              switch (message.command) {
                case "syncCompleted":
                  if (message.successfully) {
                    await Promise.all([
                      this.groupingsComponent.load(),
                      this.ciphersComponent.refresh(),
                    ]);
                    this.changeDetectorRef.detectChanges();
                  }
                  break;
              }
            });
          });
        }
        await this.groupingsComponent.load();

        if (qParams == null) {
          this.groupingsComponent.selectedAll = true;
          await this.ciphersComponent.reload();
        } else {
          if (qParams.deleted) {
            this.groupingsComponent.selectedTrash = true;
            await this.filterDeleted(true);
          } else if (qParams.type) {
            const t = parseInt(qParams.type, null);
            this.groupingsComponent.selectedType = t;
            await this.filterCipherType(t, true);
          } else if (qParams.collectionId) {
            this.groupingsComponent.selectedCollectionId = qParams.collectionId;
            await this.filterCollection(qParams.collectionId, true);
          } else {
            this.groupingsComponent.selectedAll = true;
            await this.ciphersComponent.reload();
          }
        }

        if (qParams.viewEvents != null) {
          const cipher = this.ciphersComponent.ciphers.filter((c) => c.id === qParams.viewEvents);
          if (cipher.length > 0) {
            this.viewEvents(cipher[0]);
          }
        }
      });
    });
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async clearGroupingFilters() {
    this.ciphersComponent.showAddNew = true;
    this.ciphersComponent.deleted = false;
    this.groupingsComponent.searchPlaceholder = this.i18nService.t("searchVault");
    await this.ciphersComponent.applyFilter();
    this.clearFilters();
    this.go();
  }

  async filterCipherType(type: CipherType, load = false) {
    this.ciphersComponent.showAddNew = true;
    this.ciphersComponent.deleted = false;
    this.groupingsComponent.searchPlaceholder = this.i18nService.t("searchType");
    const filter = (c: CipherView) => c.type === type;
    if (load) {
      await this.ciphersComponent.reload(filter);
    } else {
      await this.ciphersComponent.applyFilter(filter);
    }
    this.clearFilters();
    this.type = type;
    this.go();
  }

  async filterCollection(collectionId: string, load = false) {
    this.ciphersComponent.showAddNew = true;
    this.ciphersComponent.deleted = false;
    this.groupingsComponent.searchPlaceholder = this.i18nService.t("searchCollection");
    const filter = (c: CipherView) => {
      if (collectionId === "unassigned") {
        return c.collectionIds == null || c.collectionIds.length === 0;
      } else {
        return c.collectionIds != null && c.collectionIds.indexOf(collectionId) > -1;
      }
    };
    if (load) {
      await this.ciphersComponent.reload(filter);
    } else {
      await this.ciphersComponent.applyFilter(filter);
    }
    this.clearFilters();
    this.collectionId = collectionId;
    this.go();
  }

  async filterDeleted(load = false) {
    this.ciphersComponent.showAddNew = false;
    this.ciphersComponent.deleted = true;
    this.groupingsComponent.searchPlaceholder = this.i18nService.t("searchTrash");
    if (load) {
      await this.ciphersComponent.reload(null, true);
    } else {
      await this.ciphersComponent.applyFilter(null);
    }
    this.clearFilters();
    this.deleted = true;
    this.go();
  }

  filterSearchText(searchText: string) {
    this.ciphersComponent.searchText = searchText;
    this.ciphersComponent.search(200);
  }

  async editCipherAttachments(cipher: CipherView) {
    if (this.organization.maxStorageGb == null || this.organization.maxStorageGb === 0) {
      this.messagingService.send("upgradeOrganization", { organizationId: cipher.organizationId });
      return;
    }

    let madeAttachmentChanges = false;

    const [modal] = await this.modalService.openViewRef(
      AttachmentsComponent,
      this.attachmentsModalRef,
      (comp) => {
        comp.organization = this.organization;
        comp.cipherId = cipher.id;
        comp.onUploadedAttachment.subscribe(() => (madeAttachmentChanges = true));
        comp.onDeletedAttachment.subscribe(() => (madeAttachmentChanges = true));
      }
    );

    modal.onClosed.subscribe(async () => {
      if (madeAttachmentChanges) {
        await this.ciphersComponent.refresh();
      }
      madeAttachmentChanges = false;
    });
  }

  async editCipherCollections(cipher: CipherView) {
    const [modal] = await this.modalService.openViewRef(
      CollectionsComponent,
      this.collectionsModalRef,
      (comp) => {
        if (this.organization.canEditAnyCollection) {
          comp.collectionIds = cipher.collectionIds;
          comp.collections = this.groupingsComponent.collections.filter((c) => !c.readOnly);
        }
        comp.organization = this.organization;
        comp.cipherId = cipher.id;
        comp.onSavedCollections.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
      }
    );
  }

  async addCipher() {
    const component = await this.editCipher(null);
    component.organizationId = this.organization.id;
    component.type = this.type;
    if (this.organization.canEditAnyCollection) {
      component.collections = this.groupingsComponent.collections.filter((c) => !c.readOnly);
    }
    if (this.collectionId != null) {
      component.collectionIds = [this.collectionId];
    }
  }

  async editCipher(cipher: CipherView) {
    const [modal, childComponent] = await this.modalService.openViewRef(
      AddEditComponent,
      this.cipherAddEditModalRef,
      (comp) => {
        comp.organization = this.organization;
        comp.cipherId = cipher == null ? null : cipher.id;
        comp.onSavedCipher.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
        comp.onDeletedCipher.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
        comp.onRestoredCipher.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
      }
    );

    return childComponent;
  }

  async cloneCipher(cipher: CipherView) {
    const component = await this.editCipher(cipher);
    component.cloneMode = true;
    component.organizationId = this.organization.id;
    if (this.organization.canEditAnyCollection) {
      component.collections = this.groupingsComponent.collections.filter((c) => !c.readOnly);
    }
    // Regardless of Admin state, the collection Ids need to passed manually as they are not assigned value
    // in the add-edit componenet
    component.collectionIds = cipher.collectionIds;
  }

  async viewEvents(cipher: CipherView) {
    await this.modalService.openViewRef(EntityEventsComponent, this.eventsModalRef, (comp) => {
      comp.name = cipher.name;
      comp.organizationId = this.organization.id;
      comp.entityId = cipher.id;
      comp.showUser = true;
      comp.entity = "cipher";
    });
  }

  private clearFilters() {
    this.collectionId = null;
    this.type = null;
    this.deleted = false;
  }

  private go(queryParams: any = null) {
    if (queryParams == null) {
      queryParams = {
        type: this.type,
        collectionId: this.collectionId,
        deleted: this.deleted ? true : null,
      };
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true,
    });
  }
}
