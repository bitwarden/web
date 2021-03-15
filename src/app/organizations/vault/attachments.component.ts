import { Component } from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherData } from 'jslib/models/data/cipherData';
import { Cipher } from 'jslib/models/domain/cipher';
import { Organization } from 'jslib/models/domain/organization';

import { AttachmentView } from 'jslib/models/view/attachmentView';

import { AttachmentsComponent as BaseAttachmentsComponent } from '../../vault/attachments.component';

@Component({
    selector: 'app-org-vault-attachments',
    templateUrl: '../../vault/attachments.component.html',
})
export class AttachmentsComponent extends BaseAttachmentsComponent {
    viewOnly = false;
    organization: Organization;

    constructor(cipherService: CipherService, i18nService: I18nService,
        cryptoService: CryptoService, userService: UserService,
        platformUtilsService: PlatformUtilsService, apiService: ApiService) {
        super(cipherService, i18nService, cryptoService, userService, platformUtilsService, apiService);
    }

    protected async reupload(attachment: AttachmentView) {
        if (this.organization.canManageAllCollections && this.showFixOldAttachments(attachment)) {
            await super.reuploadCipherAttachment(attachment, true);
        }
    }

    protected async loadCipher() {
        if (!this.organization.canManageAllCollections) {
            return await super.loadCipher();
        }
        const response = await this.apiService.getCipherAdmin(this.cipherId);
        return new Cipher(new CipherData(response));
    }

    protected saveCipherAttachment(file: File) {
        return this.cipherService.saveAttachmentWithServer(this.cipherDomain, file, this.organization.canManageAllCollections);
    }

    protected deleteCipherAttachment(attachmentId: string) {
        if (!this.organization.canManageAllCollections) {
            return super.deleteCipherAttachment(attachmentId);
        }
        return this.apiService.deleteCipherAttachmentAdmin(this.cipherId, attachmentId);
    }

    protected showFixOldAttachments(attachment: AttachmentView) {
        return attachment.key == null && this.organization.canManageAllCollections;
    }
}
