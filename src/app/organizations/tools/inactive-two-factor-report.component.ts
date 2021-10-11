import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { OrganizationService } from 'jslib-common/abstractions/organization.service';
import { PasswordRepromptService } from 'jslib-common/abstractions/passwordReprompt.service';

import { ModalService } from 'jslib-angular/services/modal.service';

import {
    InactiveTwoFactorReportComponent as BaseInactiveTwoFactorReportComponent,
} from '../../tools/inactive-two-factor-report.component';

import { CipherView } from 'jslib-common/models/view/cipherView';

@Component({
    selector: 'app-inactive-two-factor-report',
    templateUrl: '../../tools/inactive-two-factor-report.component.html',
})
export class InactiveTwoFactorReportComponent extends BaseInactiveTwoFactorReportComponent {
    constructor(cipherService: CipherService, modalService: ModalService,
        messagingService: MessagingService, activeAccount: ActiveAccountService,
        private route: ActivatedRoute, private organizationService: OrganizationService,
        passwordRepromptService: PasswordRepromptService) {
        super(cipherService, modalService, messagingService, activeAccount, passwordRepromptService);
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organization = await this.organizationService.get(params.organizationId);
            await super.ngOnInit();
        });
    }

    getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllFromApiForOrganization(this.organization.id);
    }
}
