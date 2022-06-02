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
  selector: "emergency-access-attachments",
  templateUrl: "../vault/attachments.component.html",
})
export class EmergencyAccessAttachmentsComponent extends BaseAttachmentsComponent {
  viewOnly = true;
  canAccessAttachments = true;

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

  protected async init() {
    // Do nothing since cipher is already decoded
  }

  protected showFixOldAttachments(attachment: AttachmentView) {
    return false;
  }
}
