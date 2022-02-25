import { Component } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { CipherData } from "jslib-common/models/data/cipherData";
import { Cipher } from "jslib-common/models/domain/cipher";
import { Organization } from "jslib-common/models/domain/organization";
import { AttachmentView } from "jslib-common/models/view/attachmentView";

import { AttachmentsComponent as BaseAttachmentsComponent } from "../../vault/attachments.component";

@Component({
  selector: "app-org-vault-attachments",
  templateUrl: "../../vault/attachments.component.html",
})
export class AttachmentsComponent extends BaseAttachmentsComponent {
  viewOnly = false;
  organization: Organization;

  constructor(
    cipherService: CipherService,
    i18nService: I18nService,
    cryptoService: CryptoService,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    apiService: ApiService,
    logService: LogService
  ) {
    super(
      cipherService,
      i18nService,
      cryptoService,
      stateService,
      platformUtilsService,
      apiService,
      logService
    );
  }

  protected async reupload(attachment: AttachmentView) {
    if (this.organization.canEditAnyCollection && this.showFixOldAttachments(attachment)) {
      await super.reuploadCipherAttachment(attachment, true);
    }
  }

  protected async loadCipher() {
    if (!this.organization.canEditAnyCollection) {
      return await super.loadCipher();
    }
    const response = await this.apiService.getCipherAdmin(this.cipherId);
    return new Cipher(new CipherData(response));
  }

  protected saveCipherAttachment(file: File) {
    return this.cipherService.saveAttachmentWithServer(
      this.cipherDomain,
      file,
      this.organization.canEditAnyCollection
    );
  }

  protected deleteCipherAttachment(attachmentId: string) {
    if (!this.organization.canEditAnyCollection) {
      return super.deleteCipherAttachment(attachmentId);
    }
    return this.apiService.deleteCipherAttachmentAdmin(this.cipherId, attachmentId);
  }

  protected showFixOldAttachments(attachment: AttachmentView) {
    return attachment.key == null && this.organization.canEditAnyCollection;
  }
}
