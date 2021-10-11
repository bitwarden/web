import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PasswordRepromptService } from 'jslib-common/abstractions/passwordReprompt.service';
import { UserService } from 'jslib-common/abstractions/user.service';

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
        messagingService: MessagingService, userService: UserService, passwordRepromptService: PasswordRepromptService,
        private route: ActivatedRoute) {
        super(cipherService, modalService, messagingService, userService, passwordRepromptService);
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            await super.ngOnInit();
        });
    }

    getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllFromApiForOrganization(this.organization.id);
    }
}
