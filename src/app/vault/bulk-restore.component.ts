import { Component, EventEmitter, Input, Output } from "@angular/core";

import { CipherService } from "jslib-common/abstractions/cipher.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

@Component({
  selector: "app-vault-bulk-restore",
  templateUrl: "bulk-restore.component.html",
})
export class BulkRestoreComponent {
  @Input() cipherIds: string[] = [];
  @Output() onRestored = new EventEmitter();

  formPromise: Promise<any>;

  constructor(
    private cipherService: CipherService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  async submit() {
    this.formPromise = this.cipherService.restoreManyWithServer(this.cipherIds);
    await this.formPromise;
    this.onRestored.emit();
    this.platformUtilsService.showToast("success", null, this.i18nService.t("restoredItems"));
  }
}
