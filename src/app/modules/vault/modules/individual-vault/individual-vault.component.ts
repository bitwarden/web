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
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { TokenService } from "jslib-common/abstractions/token.service";
import { CipherType } from "jslib-common/enums/cipherType";
import { CipherView } from "jslib-common/models/view/cipherView";

import { UpdateKeyComponent } from "../../../../settings/update-key.component";
import { AddEditComponent } from "../../../../vault/add-edit.component";
import { AttachmentsComponent } from "../../../../vault/attachments.component";
import { CiphersComponent } from "../../../../vault/ciphers.component";
import { CollectionsComponent } from "../../../../vault/collections.component";
import { FolderAddEditComponent } from "../../../../vault/folder-add-edit.component";
import { ShareComponent } from "../../../../vault/share.component";
import { VaultFilterComponent } from "../../../vault-filter/vault-filter.component";
import { VaultService } from "../../vault.service";

const BroadcasterSubscriptionId = "VaultComponent";

@Component({
  selector: "app-vault",
  templateUrl: "individual-vault.component.html",
})
export class IndividualVaultComponent implements OnInit, OnDestroy {
  @ViewChild("vaultFilter", { static: true }) filterComponent: VaultFilterComponent;
  @ViewChild(CiphersComponent, { static: true }) ciphersComponent: CiphersComponent;
  @ViewChild("attachments", { read: ViewContainerRef, static: true })
  attachmentsModalRef: ViewContainerRef;
  @ViewChild("folderAddEdit", { read: ViewContainerRef, static: true })
  folderAddEditModalRef: ViewContainerRef;
  @ViewChild("cipherAddEdit", { read: ViewContainerRef, static: true })
  cipherAddEditModalRef: ViewContainerRef;
  @ViewChild("share", { read: ViewContainerRef, static: true }) shareModalRef: ViewContainerRef;
  @ViewChild("collections", { read: ViewContainerRef, static: true })
  collectionsModalRef: ViewContainerRef;
  @ViewChild("updateKeyTemplate", { read: ViewContainerRef, static: true })
  updateKeyModalRef: ViewContainerRef;

  favorites = false;
  folderId: string = null;
  collectionId: string = null;
  organizationId: string = null;
  myVaultOnly = false;
  showVerifyEmail = false;
  showBrowserOutdated = false;
  showUpdateKey = false;
  showPremiumCallout = false;
  deleted = false;
  trashCleanupWarning: string = null;
  activeFilter: VaultFilter = new VaultFilter();

  constructor(
    private syncService: SyncService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private i18nService: I18nService,
    private modalService: ModalService,
    private tokenService: TokenService,
    private cryptoService: CryptoService,
    private messagingService: MessagingService,
    private platformUtilsService: PlatformUtilsService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    private stateService: StateService,
    private organizationService: OrganizationService,
    private vaultService: VaultService,
    private cipherService: CipherService,
    private passwordRepromptService: PasswordRepromptService
  ) {}

  async ngOnInit() {
    this.showVerifyEmail = !(await this.tokenService.getEmailVerified());
    this.showBrowserOutdated = window.navigator.userAgent.indexOf("MSIE") !== -1;
    this.trashCleanupWarning = this.i18nService.t(
      this.platformUtilsService.isSelfHost()
        ? "trashCleanupWarningSelfHosted"
        : "trashCleanupWarning"
    );

    this.route.queryParams.pipe(first()).subscribe(async (params) => {
      await this.syncService.fullSync(false);
      const canAccessPremium = await this.stateService.getCanAccessPremium();
      this.showPremiumCallout =
        !this.showVerifyEmail && !canAccessPremium && !this.platformUtilsService.isSelfHost();

      this.filterComponent.reloadCollectionsAndFolders(this.activeFilter);
      this.filterComponent.reloadOrganizations();
      this.showUpdateKey = !(await this.cryptoService.hasEncKey());

      if (params.cipherId) {
        const cipherView = new CipherView();
        cipherView.id = params.cipherId;
        if (params.action === "clone") {
          await this.cloneCipher(cipherView);
        } else if (params.action === "edit") {
          await this.editCipher(cipherView);
        }
      }
      await this.ciphersComponent.reload();

      this.route.queryParams.subscribe(async (params) => {
        if (params.cipherId) {
          if ((await this.cipherService.get(params.cipherId)) != null) {
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

      this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
        this.ngZone.run(async () => {
          switch (message.command) {
            case "syncCompleted":
              if (message.successfully) {
                await Promise.all([
                  this.filterComponent.reloadCollectionsAndFolders(this.activeFilter),
                  this.filterComponent.reloadOrganizations(),
                  this.ciphersComponent.load(this.ciphersComponent.filter),
                ]);
                this.changeDetectorRef.detectChanges();
              }
              break;
          }
        });
      });
    });
  }

  get isShowingCards() {
    return (
      this.showBrowserOutdated ||
      this.showPremiumCallout ||
      this.showUpdateKey ||
      this.showVerifyEmail
    );
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async applyVaultFilter(vaultFilter: VaultFilter) {
    this.ciphersComponent.showAddNew = vaultFilter.status !== "trash";
    this.activeFilter = vaultFilter;
    await this.ciphersComponent.reload(this.buildFilter(), vaultFilter.status === "trash");
    this.filterComponent.searchPlaceholder = this.vaultService.calculateSearchBarLocalizationString(
      this.activeFilter
    );
    this.go();
  }

  async applyOrganizationFilter(orgId: string) {
    if (orgId == null) {
      this.activeFilter.resetOrganization();
      this.activeFilter.myVaultOnly = true;
    } else {
      this.activeFilter.selectedOrganizationId = orgId;
    }
    await this.applyVaultFilter(this.activeFilter);
  }

  filterSearchText(searchText: string) {
    this.ciphersComponent.searchText = searchText;
    this.ciphersComponent.search(200);
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
        this.activeFilter.selectedFolder &&
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

  async editCipherAttachments(cipher: CipherView) {
    const canAccessPremium = await this.stateService.getCanAccessPremium();
    if (cipher.organizationId == null && !canAccessPremium) {
      this.messagingService.send("premiumRequired");
      return;
    } else if (cipher.organizationId != null) {
      const org = await this.organizationService.get(cipher.organizationId);
      if (org != null && (org.maxStorageGb == null || org.maxStorageGb === 0)) {
        this.messagingService.send("upgradeOrganization", {
          organizationId: cipher.organizationId,
        });
        return;
      }
    }

    let madeAttachmentChanges = false;
    const [modal] = await this.modalService.openViewRef(
      AttachmentsComponent,
      this.attachmentsModalRef,
      (comp) => {
        comp.cipherId = cipher.id;
        comp.onUploadedAttachment.subscribe(() => (madeAttachmentChanges = true));
        comp.onDeletedAttachment.subscribe(() => (madeAttachmentChanges = true));
        comp.onReuploadedAttachment.subscribe(() => (madeAttachmentChanges = true));
      }
    );

    modal.onClosed.subscribe(async () => {
      if (madeAttachmentChanges) {
        await this.ciphersComponent.refresh();
      }
      madeAttachmentChanges = false;
    });
  }

  async shareCipher(cipher: CipherView) {
    const [modal] = await this.modalService.openViewRef(
      ShareComponent,
      this.shareModalRef,
      (comp) => {
        comp.cipherId = cipher.id;
        comp.onSharedCipher.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
      }
    );
  }

  async editCipherCollections(cipher: CipherView) {
    const [modal] = await this.modalService.openViewRef(
      CollectionsComponent,
      this.collectionsModalRef,
      (comp) => {
        comp.cipherId = cipher.id;
        comp.onSavedCollections.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
      }
    );
  }

  async addFolder() {
    const [modal] = await this.modalService.openViewRef(
      FolderAddEditComponent,
      this.folderAddEditModalRef,
      (comp) => {
        comp.folderId = null;
        comp.onSavedFolder.subscribe(async () => {
          modal.close();
          await this.filterComponent.reloadCollectionsAndFolders(this.activeFilter);
        });
      }
    );
  }

  async editFolder(folderId: string) {
    const [modal] = await this.modalService.openViewRef(
      FolderAddEditComponent,
      this.folderAddEditModalRef,
      (comp) => {
        comp.folderId = folderId;
        comp.onSavedFolder.subscribe(async () => {
          modal.close();
          await this.filterComponent.reloadCollectionsAndFolders(this.activeFilter);
        });
        comp.onDeletedFolder.subscribe(async () => {
          modal.close();
          await this.filterComponent.reloadCollectionsAndFolders(this.activeFilter);
        });
      }
    );
  }

  async addCipher() {
    const component = await this.editCipher(null);
    component.type = this.activeFilter.cipherType;
    component.folderId = this.folderId === "none" ? null : this.folderId;
    if (this.activeFilter.selectedCollectionId != null) {
      const collection = this.filterComponent.collections.fullList.filter(
        (c) => c.id === this.activeFilter.selectedCollectionId
      );
      if (collection.length > 0) {
        component.organizationId = collection[0].organizationId;
        component.collectionIds = [this.activeFilter.selectedCollectionId];
      }
    }
    if (this.activeFilter.selectedFolderId && this.activeFilter.selectedFolder) {
      component.folderId = this.activeFilter.selectedFolderId;
    }
    if (this.activeFilter.selectedOrganizationId) {
      component.organizationId = this.activeFilter.selectedOrganizationId;
    }
  }

  async editCipher(cipher: CipherView) {
    return this.editCipherId(cipher?.id);
  }

  async editCipherId(id: string) {
    const cipher = await this.cipherService.get(id);
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
        comp.cipherId = id;
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
  }

  async updateKey() {
    await this.modalService.openViewRef(UpdateKeyComponent, this.updateKeyModalRef);
  }

  private go(queryParams: any = null) {
    if (queryParams == null) {
      queryParams = {
        favorites: this.favorites ? true : null,
        type: this.activeFilter.cipherType,
        folderId: this.folderId,
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
