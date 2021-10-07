import { Component } from '@angular/core';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { AuditService } from 'jslib-common/abstractions/audit.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { OrganizationService } from 'jslib-common/abstractions/organization.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { TotpService } from 'jslib-common/abstractions/totp.service';

import { Cipher } from 'jslib-common/models/domain/cipher';

import { AddEditComponent as BaseAddEditComponent } from '../vault/add-edit.component';

@Component({
    selector: 'app-org-vault-add-edit',
    templateUrl: '../vault/add-edit.component.html',
})
export class EmergencyAddEditComponent extends BaseAddEditComponent {
    originalCipher: Cipher = null;
    viewOnly = true;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        activeAccount: ActiveAccountService, collectionService: CollectionService,
        totpService: TotpService, passwordGenerationService: PasswordGenerationService,
        messagingService: MessagingService, eventService: EventService,
        policyService: PolicyService, organizationService: OrganizationService) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService,
            collectionService, totpService, passwordGenerationService, messagingService,
            eventService, policyService, activeAccount, organizationService);
    }

    async load() {
        this.title = this.i18nService.t('viewItem');
    }

    protected async loadCipher() {
        return Promise.resolve(this.originalCipher);
    }
}
