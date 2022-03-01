import { Component } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { EncString } from "jslib-common/models/domain/encString";
import { CipherWithIdRequest } from "jslib-common/models/request/cipherWithIdRequest";
import { FolderWithIdRequest } from "jslib-common/models/request/folderWithIdRequest";
import { UpdateKeyRequest } from "jslib-common/models/request/updateKeyRequest";

@Component({
  selector: "app-update-key",
  templateUrl: "update-key.component.html",
})
export class UpdateKeyComponent {
  masterPassword: string;
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private messagingService: MessagingService,
    private syncService: SyncService,
    private folderService: FolderService,
    private cipherService: CipherService,
    private logService: LogService
  ) {}

  async submit() {
    const hasEncKey = await this.cryptoService.hasEncKey();
    if (hasEncKey) {
      return;
    }

    if (this.masterPassword == null || this.masterPassword === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPassRequired")
      );
      return;
    }

    try {
      this.formPromise = this.makeRequest().then((request) => {
        return this.apiService.postAccountKey(request);
      });
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("keyUpdated"),
        this.i18nService.t("logBackInOthersToo"),
        { timeout: 15000 }
      );
      this.messagingService.send("logout");
    } catch (e) {
      this.logService.error(e);
    }
  }

  private async makeRequest(): Promise<UpdateKeyRequest> {
    const key = await this.cryptoService.getKey();
    const encKey = await this.cryptoService.makeEncKey(key);
    const privateKey = await this.cryptoService.getPrivateKey();
    let encPrivateKey: EncString = null;
    if (privateKey != null) {
      encPrivateKey = await this.cryptoService.encrypt(privateKey, encKey[0]);
    }
    const request = new UpdateKeyRequest();
    request.privateKey = encPrivateKey != null ? encPrivateKey.encryptedString : null;
    request.key = encKey[1].encryptedString;
    request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);

    await this.syncService.fullSync(true);

    const folders = await this.folderService.getAllDecrypted();
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id == null) {
        continue;
      }
      const folder = await this.folderService.encrypt(folders[i], encKey[0]);
      request.folders.push(new FolderWithIdRequest(folder));
    }

    const ciphers = await this.cipherService.getAllDecrypted();
    for (let i = 0; i < ciphers.length; i++) {
      if (ciphers[i].organizationId != null) {
        continue;
      }
      const cipher = await this.cipherService.encrypt(ciphers[i], encKey[0]);
      request.ciphers.push(new CipherWithIdRequest(cipher));
    }

    return request;
  }
}
