import { Component } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { AttachmentView } from 'jslib/models/view/attachmentView';

import { AttachmentsComponent as BaseAttachmentsComponent } from 'jslib/angular/components/attachments.component';

@Component({
    selector: 'app-vault-attachments',
    templateUrl: 'attachments.component.html',
})
export class AttachmentsComponent extends BaseAttachmentsComponent {
    constructor(
        cipherService: CipherService,
        i18nService: I18nService,
        cryptoService: CryptoService,
        userService: UserService,
        platformUtilsService: PlatformUtilsService
    ) {
        super(cipherService, i18nService, cryptoService, userService, platformUtilsService, window);
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
