import { Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

import { UnsecuredWebsitesReportComponent as BaseUnsecuredWebsitesReportComponent } from '../../tools/unsecured-websites-report.component';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-unsecured-websites-report',
    templateUrl: '../../tools/unsecured-websites-report.component.html',
})
export class UnsecuredWebsitesReportComponent extends BaseUnsecuredWebsitesReportComponent {
    constructor(
        cipherService: CipherService,
        componentFactoryResolver: ComponentFactoryResolver,
        messagingService: MessagingService,
        userService: UserService,
        private route: ActivatedRoute
    ) {
        super(cipherService, componentFactoryResolver, messagingService, userService);
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            await super.ngOnInit();
        });
    }

    getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllFromApiForOrganization(this.organization.id);
    }
}
