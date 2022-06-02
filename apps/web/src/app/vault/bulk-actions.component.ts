import { Component, Input, ViewChild, ViewContainerRef } from "@angular/core";

import { ModalService } from "jslib-angular/services/modal.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
import { Organization } from "jslib-common/models/domain/organization";

import { BulkDeleteComponent } from "./bulk-delete.component";
import { BulkMoveComponent } from "./bulk-move.component";
import { BulkRestoreComponent } from "./bulk-restore.component";
import { BulkShareComponent } from "./bulk-share.component";
import { CiphersComponent } from "./ciphers.component";

@Component({
  selector: "app-vault-bulk-actions",
  templateUrl: "bulk-actions.component.html",
})
export class BulkActionsComponent {
  @Input() ciphersComponent: CiphersComponent;
  @Input() deleted: boolean;
  @Input() organization: Organization;

  @ViewChild("bulkDeleteTemplate", { read: ViewContainerRef, static: true })
  bulkDeleteModalRef: ViewContainerRef;
  @ViewChild("bulkRestoreTemplate", { read: ViewContainerRef, static: true })
  bulkRestoreModalRef: ViewContainerRef;
  @ViewChild("bulkMoveTemplate", { read: ViewContainerRef, static: true })
  bulkMoveModalRef: ViewContainerRef;
  @ViewChild("bulkShareTemplate", { read: ViewContainerRef, static: true })
  bulkShareModalRef: ViewContainerRef;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private modalService: ModalService,
    private passwordRepromptService: PasswordRepromptService
  ) {}

  async bulkDelete() {
    if (!(await this.promptPassword())) {
      return;
    }

    const selectedIds = this.ciphersComponent.getSelectedIds();
    if (selectedIds.length === 0) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("nothingSelected")
      );
      return;
    }

    const [modal] = await this.modalService.openViewRef(
      BulkDeleteComponent,
      this.bulkDeleteModalRef,
      (comp) => {
        comp.permanent = this.deleted;
        comp.cipherIds = selectedIds;
        comp.organization = this.organization;
        comp.onDeleted.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
      }
    );
  }

  async bulkRestore() {
    if (!(await this.promptPassword())) {
      return;
    }

    const selectedIds = this.ciphersComponent.getSelectedIds();
    if (selectedIds.length === 0) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("nothingSelected")
      );
      return;
    }

    const [modal] = await this.modalService.openViewRef(
      BulkRestoreComponent,
      this.bulkRestoreModalRef,
      (comp) => {
        comp.cipherIds = selectedIds;
        comp.onRestored.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
      }
    );
  }

  async bulkShare() {
    if (!(await this.promptPassword())) {
      return;
    }

    const selectedCiphers = this.ciphersComponent.getSelected();
    if (selectedCiphers.length === 0) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("nothingSelected")
      );
      return;
    }

    const [modal] = await this.modalService.openViewRef(
      BulkShareComponent,
      this.bulkShareModalRef,
      (comp) => {
        comp.ciphers = selectedCiphers;
        comp.onShared.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
      }
    );
  }

  async bulkMove() {
    if (!(await this.promptPassword())) {
      return;
    }

    const selectedIds = this.ciphersComponent.getSelectedIds();
    if (selectedIds.length === 0) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("nothingSelected")
      );
      return;
    }

    const [modal] = await this.modalService.openViewRef(
      BulkMoveComponent,
      this.bulkMoveModalRef,
      (comp) => {
        comp.cipherIds = selectedIds;
        comp.onMoved.subscribe(async () => {
          modal.close();
          await this.ciphersComponent.refresh();
        });
      }
    );
  }

  selectAll(select: boolean) {
    this.ciphersComponent.selectAll(select);
  }

  private async promptPassword() {
    const selectedCiphers = this.ciphersComponent.getSelected();
    const notProtected = !selectedCiphers.find(
      (cipher) => cipher.reprompt !== CipherRepromptType.None
    );

    return notProtected || (await this.passwordRepromptService.showPasswordPrompt());
  }
}
