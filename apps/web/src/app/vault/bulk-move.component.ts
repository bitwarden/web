import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { CipherService } from "jslib-common/abstractions/cipher.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { FolderView } from "jslib-common/models/view/folderView";

@Component({
  selector: "app-vault-bulk-move",
  templateUrl: "bulk-move.component.html",
})
export class BulkMoveComponent implements OnInit {
  @Input() cipherIds: string[] = [];
  @Output() onMoved = new EventEmitter();

  folderId: string = null;
  folders: FolderView[] = [];
  formPromise: Promise<any>;

  constructor(
    private cipherService: CipherService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private folderService: FolderService
  ) {}

  async ngOnInit() {
    this.folders = await this.folderService.getAllDecrypted();
    this.folderId = this.folders[0].id;
  }

  async submit() {
    this.formPromise = this.cipherService.moveManyWithServer(this.cipherIds, this.folderId);
    await this.formPromise;
    this.onMoved.emit();
    this.platformUtilsService.showToast("success", null, this.i18nService.t("movedItems"));
  }
}
