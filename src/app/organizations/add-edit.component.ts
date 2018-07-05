import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';

import { CipherData } from 'jslib/models/data/cipherData';
import { Cipher } from 'jslib/models/domain/cipher';
import { Organization } from 'jslib/models/domain/organization';
import { CipherRequest } from 'jslib/models/request/cipherRequest';

import { AddEditComponent as BaseAddEditComponent } from '../vault/add-edit.component';

@Component({
    selector: 'app-org-vault-add-edit',
    templateUrl: '../vault/add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent implements OnInit {
    organization: Organization;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        analytics: Angulartics2, toasterService: ToasterService,
        auditService: AuditService, stateService: StateService,
        tokenService: TokenService, totpService: TotpService,
        passwordGenerationService: PasswordGenerationService, private apiService: ApiService) {
        super(cipherService, folderService, i18nService, platformUtilsService, analytics,
            toasterService, auditService, stateService, tokenService, totpService, passwordGenerationService);
    }

    protected async loadCipher() {
        if (!this.organization.isAdmin) {
            return await super.loadCipher();
        }
        const response = await this.apiService.getCipherAdmin(this.cipherId);
        return new Cipher(new CipherData(response));
    }

    protected encryptCipher() {
        if (!this.editMode) {
            this.cipher.organizationId = this.organization.id;
        }
        return super.encryptCipher();
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
