import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { OrganizationService } from 'jslib-common/abstractions/organization.service';

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
        messagingService: MessagingService, activeAccount: ActiveAccountService,
        private route: ActivatedRoute, private organizationService: OrganizationService) {
        super(cipherService, modalService, messagingService, activeAccount);
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
