import {
    Component,
    OnInit,
} from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherData } from 'jslib/models/data/cipherData';
import { Cipher } from 'jslib/models/domain/cipher';
import { Organization } from 'jslib/models/domain/organization';
import { CipherRequest } from 'jslib/models/request/cipherRequest';

import { AddEditComponent as BaseAddEditComponent } from '../../vault/add-edit.component';

@Component({
    selector: 'app-org-vault-add-edit',
    templateUrl: '../../vault/add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent implements OnInit {
    organization: Organization;
    originalCipher: Cipher = null;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        userService: UserService, totpService: TotpService,
        passwordGenerationService: PasswordGenerationService, private apiService: ApiService,
        messagingService: MessagingService) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService,
            userService, totpService, passwordGenerationService, messagingService);
    }

    protected async loadCipher() {
        if (!this.organization.isAdmin) {
            return await super.loadCipher();
        }
        const response = await this.apiService.getCipherAdmin(this.cipherId);
        const data = new CipherData(response);
        this.originalCipher = new Cipher(data);
        return new Cipher(data);
    }

    protected encryptCipher() {
        if (!this.editMode) {
            this.cipher.organizationId = this.organization.id;
        }
        if (!this.organization.isAdmin) {
            return super.encryptCipher();
        }
        return this.cipherService.encrypt(this.cipher, null, this.originalCipher);
    }

    protected async saveCipher(cipher: Cipher) {
        if (!this.organization.isAdmin) {
            return super.saveCipher(cipher);
        }
        const request = new CipherRequest(cipher);
        if (this.editMode) {
            return this.apiService.putCipherAdmin(this.cipherId, request);
        } else {
            return this.apiService.postCipherAdmin(request);
        }
    }

    protected async deleteCipher() {
        if (!this.organization.isAdmin) {
            return super.deleteCipher();
        }
        return this.apiService.deleteCipherAdmin(this.cipherId);
    }
}
