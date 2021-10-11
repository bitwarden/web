import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PasswordRepromptService } from 'jslib-common/abstractions/passwordReprompt.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ModalService } from 'jslib-angular/services/modal.service';

import {
    UnsecuredWebsitesReportComponent as BaseUnsecuredWebsitesReportComponent,
} from '../../tools/unsecured-websites-report.component';

import { CipherView } from 'jslib-common/models/view/cipherView';

@Component({
    selector: 'app-unsecured-websites-report',
    templateUrl: '../../tools/unsecured-websites-report.component.html',
})
export class UnsecuredWebsitesReportComponent extends BaseUnsecuredWebsitesReportComponent {
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
