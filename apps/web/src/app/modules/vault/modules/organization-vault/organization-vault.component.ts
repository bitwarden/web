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

import { VaultFilter } from "jslib-angular/modules/vault-filter/models/vault-filter.model";
import { ModalService } from "jslib-angular/services/modal.service";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { CipherType } from "jslib-common/enums/cipherType";
import { Organization } from "jslib-common/models/domain/organization";
import { CipherView } from "jslib-common/models/view/cipherView";

import { EntityEventsComponent } from "../../../../organizations/manage/entity-events.component";
import { AddEditComponent } from "../../../../organizations/vault/add-edit.component";
import { AttachmentsComponent } from "../../../../organizations/vault/attachments.component";
import { CiphersComponent } from "../../../../organizations/vault/ciphers.component";
import { CollectionsComponent } from "../../../../organizations/vault/collections.component";
import { VaultFilterComponent } from "../../../vault-filter/vault-filter.component";
import { VaultService } from "../../vault.service";

const BroadcasterSubscriptionId = "OrgVaultComponent";

@Component({
  selector: "app-org-vault",
  templateUrl: "organization-vault.component.html",
})
export class OrganizationVaultComponent implements OnInit, OnDestroy {
  @ViewChild("vaultFilter", { static: true }) vaultFilterComponent: VaultFilterComponent;
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
  activeFilter: VaultFilter = new VaultFilter();

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
    private platformUtilsService: PlatformUtilsService,
    private vaultService: VaultService,
    private cipherService: CipherService,
    private passwordRepromptService: PasswordRepromptService
  ) {}

  ngOnInit() {
    this.trashCleanupWarning = this.i18nService.t(
      this.platformUtilsService.isSelfHost()
        ? "trashCleanupWarningSelfHosted"
        : "trashCleanupWarning"
    );
    this.route.parent.params.subscribe(async (params: any) => {
      this.organization = await this.organizationService.get(params.organizationId);
      this.vaultFilterComponent.organization = this.organization;
      this.ciphersComponent.organization = this.organization;

      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        this.ciphersComponent.searchText = this.vaultFilterComponent.searchText = qParams.search;
        if (!this.organization.canViewAllCollections) {
          await this.syncService.fullSync(false);
          this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
              switch (message.command) {
                case "syncCompleted":
                  if (message.successfully) {
                    await Promise.all([
                      this.vaultFilterComponent.reloadCollectionsAndFolders(
                        new VaultFilter({
                          selectedOrganizationId: this.organization.id,
                        } as Partial<VaultFilter>)
                      ),
                      this.ciphersComponent.refresh(),
                    ]);
                    this.changeDetectorRef.detectChanges();
                  }
                  break;
              }
            });
          });
        }
        await this.vaultFilterComponent.reloadCollectionsAndFolders(
          new VaultFilter({ selectedOrganizationId: this.organization.id } as Partial<VaultFilter>)
        );
        await this.ciphersComponent.reload();

        if (qParams.viewEvents != null) {
          const cipher = this.ciphersComponent.ciphers.filter((c) => c.id === qParams.viewEvents);
          if (cipher.length > 0) {
            this.viewEvents(cipher[0]);
          }
        }

        this.route.queryParams.subscribe(async (params) => {
          if (params.cipherId) {
            if (
              // Handle users with implicit collection access since they use the admin endpoint
              this.organization.canEditAnyCollection ||
              (await this.cipherService.get(params.cipherId)) != null
            ) {
              this.editCipherId(params.cipherId);
            } else {
              this.platformUtilsService.showToast(
                "error",
                this.i18nService.t("errorOccurred"),
                this.i18nService.t("unknownCipher")
              );
              this.router.navigate([], {
                queryParams: { cipherId: null },
                queryParamsHandling: "merge",
              });
            }
          }
        });
      });
    });
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async applyVaultFilter(vaultFilter: VaultFilter) {
    this.ciphersComponent.showAddNew = vaultFilter.status !== "trash";
    this.activeFilter = vaultFilter;
    await this.ciphersComponent.reload(this.buildFilter(), vaultFilter.status === "trash");
    this.vaultFilterComponent.searchPlaceholder =
      this.vaultService.calculateSearchBarLocalizationString(this.activeFilter);
    this.go();
  }

  private buildFilter(): (cipher: CipherView) => boolean {
    return (cipher) => {
      let cipherPassesFilter = true;
      if (this.activeFilter.status === "favorites" && cipherPassesFilter) {
        cipherPassesFilter = cipher.favorite;
      }
      if (this.activeFilter.status === "trash" && cipherPassesFilter) {
        cipherPassesFilter = cipher.isDeleted;
      }
      if (this.activeFilter.cipherType != null && cipherPassesFilter) {
        cipherPassesFilter = cipher.type === this.activeFilter.cipherType;
      }
      if (
        this.activeFilter.selectedFolder != null &&
        this.activeFilter.selectedFolderId != "none" &&
        cipherPassesFilter
      ) {
        cipherPassesFilter = cipher.folderId === this.activeFilter.selectedFolderId;
      }
      if (this.activeFilter.selectedCollectionId != null && cipherPassesFilter) {
        cipherPassesFilter =
          cipher.collectionIds != null &&
          cipher.collectionIds.indexOf(this.activeFilter.selectedCollectionId) > -1;
      }
      if (this.activeFilter.selectedOrganizationId != null && cipherPassesFilter) {
        cipherPassesFilter = cipher.organizationId === this.activeFilter.selectedOrganizationId;
      }
      if (this.activeFilter.myVaultOnly && cipherPassesFilter) {
        cipherPassesFilter = cipher.organizationId === null;
      }
      return cipherPassesFilter;
    };
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
          comp.collections = this.vaultFilterComponent.collections.fullList.filter(
            (c) => !c.readOnly
          );
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
      component.collections = this.vaultFilterComponent.collections.fullList.filter(
        (c) => !c.readOnly
      );
    }
    if (this.collectionId != null) {
      component.collectionIds = [this.collectionId];
    }
  }

  async editCipher(cipher: CipherView) {
    return this.editCipherId(cipher?.id);
  }

  async editCipherId(cipherId: string) {
    const cipher = await this.cipherService.get(cipherId);
    if (cipher != null && cipher.reprompt != 0) {
      if (!(await this.passwordRepromptService.showPasswordPrompt())) {
        this.go({ cipherId: null });
        return;
      }
    }

    const [modal, childComponent] = await this.modalService.openViewRef(
      AddEditComponent,
      this.cipherAddEditModalRef,
      (comp) => {
        comp.organization = this.organization;
        comp.cipherId = cipherId;
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

    modal.onClosedPromise().then(() => {
      this.go({ cipherId: null });
    });

    return childComponent;
  }

  async cloneCipher(cipher: CipherView) {
    const component = await this.editCipher(cipher);
    component.cloneMode = true;
    component.organizationId = this.organization.id;
    if (this.organization.canEditAnyCollection) {
      component.collections = this.vaultFilterComponent.collections.fullList.filter(
        (c) => !c.readOnly
      );
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
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }
}
