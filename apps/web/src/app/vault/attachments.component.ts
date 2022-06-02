import { Component } from "@angular/core";

import { AttachmentsComponent as BaseAttachmentsComponent } from "jslib-angular/components/attachments.component";
import { ApiService } from "jslib-common/abstractions/api.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { AttachmentView } from "jslib-common/models/view/attachmentView";

@Component({
  selector: "app-vault-attachments",
  templateUrl: "attachments.component.html",
})
export class AttachmentsComponent extends BaseAttachmentsComponent {
  viewOnly = false;

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
      platformUtilsService,
      apiService,
      window,
      logService,
      stateService
    );
  }

  protected async reupload(attachment: AttachmentView) {
    if (this.showFixOldAttachments(attachment)) {
      await this.reuploadCipherAttachment(attachment, false);
    }
  }

  protected showFixOldAttachments(attachment: AttachmentView) {
    return attachment.key == null && this.cipher.organizationId == null;
  }
}
