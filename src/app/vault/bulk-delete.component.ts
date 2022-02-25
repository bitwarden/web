import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Organization } from "jslib-common/models/domain/organization";
import { CipherBulkDeleteRequest } from "jslib-common/models/request/cipherBulkDeleteRequest";

@Component({
  selector: "app-vault-bulk-delete",
  templateUrl: "bulk-delete.component.html",
})
export class BulkDeleteComponent {
  @Input() cipherIds: string[] = [];
  @Input() permanent = false;
  @Input() organization: Organization;
  @Output() onDeleted = new EventEmitter();

  formPromise: Promise<any>;

  constructor(
    private cipherService: CipherService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private apiService: ApiService
  ) {}

  async submit() {
    if (!this.organization || !this.organization.canEditAnyCollection) {
      await this.deleteCiphers();
    } else {
      await this.deleteCiphersAdmin();
    }

    await this.formPromise;

    this.onDeleted.emit();
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t(this.permanent ? "permanentlyDeletedItems" : "deletedItems")
    );
  }

  private async deleteCiphers() {
    if (this.permanent) {
      this.formPromise = await this.cipherService.deleteManyWithServer(this.cipherIds);
    } else {
      this.formPromise = await this.cipherService.softDeleteManyWithServer(this.cipherIds);
    }
  }

  private async deleteCiphersAdmin() {
    const deleteRequest = new CipherBulkDeleteRequest(this.cipherIds, this.organization.id);
    if (this.permanent) {
      this.formPromise = await this.apiService.deleteManyCiphersAdmin(deleteRequest);
    } else {
      this.formPromise = await this.apiService.putDeleteManyCiphersAdmin(deleteRequest);
    }
  }
}
