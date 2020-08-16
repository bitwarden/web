import { Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

import { InactiveTwoFactorReportComponent as BaseInactiveTwoFactorReportComponent } from '../../tools/inactive-two-factor-report.component';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-inactive-two-factor-report',
    templateUrl: '../../tools/inactive-two-factor-report.component.html',
})
export class InactiveTwoFactorReportComponent extends BaseInactiveTwoFactorReportComponent {
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
