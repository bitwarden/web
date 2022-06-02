import { Component } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { AuditService } from "jslib-common/abstractions/audit.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { EventService } from "jslib-common/abstractions/event.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { TotpService } from "jslib-common/abstractions/totp.service";
import { CipherData } from "jslib-common/models/data/cipherData";
import { Cipher } from "jslib-common/models/domain/cipher";
import { Organization } from "jslib-common/models/domain/organization";
import { CipherCreateRequest } from "jslib-common/models/request/cipherCreateRequest";
import { CipherRequest } from "jslib-common/models/request/cipherRequest";

import { AddEditComponent as BaseAddEditComponent } from "../../vault/add-edit.component";

@Component({
  selector: "app-org-vault-add-edit",
  templateUrl: "../../vault/add-edit.component.html",
})
export class AddEditComponent extends BaseAddEditComponent {
  organization: Organization;
  originalCipher: Cipher = null;

  constructor(
    cipherService: CipherService,
    folderService: FolderService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    auditService: AuditService,
    stateService: StateService,
    collectionService: CollectionService,
    totpService: TotpService,
    passwordGenerationService: PasswordGenerationService,
    private apiService: ApiService,
    messagingService: MessagingService,
    eventService: EventService,
    policyService: PolicyService,
    logService: LogService,
    passwordRepromptService: PasswordRepromptService,
    organizationService: OrganizationService
  ) {
    super(
      cipherService,
      folderService,
      i18nService,
      platformUtilsService,
      auditService,
      stateService,
      collectionService,
      totpService,
      passwordGenerationService,
      messagingService,
      eventService,
      policyService,
      organizationService,
      logService,
      passwordRepromptService
    );
  }

  protected allowOwnershipAssignment() {
    if (
      this.ownershipOptions != null &&
      (this.ownershipOptions.length > 1 || !this.allowPersonal)
    ) {
      if (this.organization != null) {
        return this.cloneMode && this.organization.canEditAnyCollection;
      } else {
        return !this.editMode || this.cloneMode;
      }
    }
    return false;
  }

  protected loadCollections() {
    if (!this.organization.canEditAnyCollection) {
      return super.loadCollections();
    }
    return Promise.resolve(this.collections);
  }

  protected async loadCipher() {
    if (!this.organization.canEditAnyCollection) {
      return await super.loadCipher();
    }
    const response = await this.apiService.getCipherAdmin(this.cipherId);
    const data = new CipherData(response);
    this.originalCipher = new Cipher(data);
    return new Cipher(data);
  }

  protected encryptCipher() {
    if (!this.organization.canEditAnyCollection) {
      return super.encryptCipher();
    }
    return this.cipherService.encrypt(this.cipher, null, this.originalCipher);
  }

  protected async saveCipher(cipher: Cipher) {
    if (!this.organization.canEditAnyCollection || cipher.organizationId == null) {
      return super.saveCipher(cipher);
    }
    if (this.editMode && !this.cloneMode) {
      const request = new CipherRequest(cipher);
      return this.apiService.putCipherAdmin(this.cipherId, request);
    } else {
      const request = new CipherCreateRequest(cipher);
      return this.apiService.postCipherAdmin(request);
    }
  }

  protected async deleteCipher() {
    if (!this.organization.canEditAnyCollection) {
      return super.deleteCipher();
    }
    return this.cipher.isDeleted
      ? this.apiService.deleteCipherAdmin(this.cipherId)
      : this.apiService.putDeleteCipherAdmin(this.cipherId);
  }
}
