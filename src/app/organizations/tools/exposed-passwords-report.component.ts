import { Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

import { ExposedPasswordsReportComponent as BaseExposedPasswordsReportComponent } from '../../tools/exposed-passwords-report.component';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-exposed-passwords-report',
    templateUrl: '../../tools/exposed-passwords-report.component.html',
})
export class ExposedPasswordsReportComponent extends BaseExposedPasswordsReportComponent {
    constructor(
        cipherService: CipherService,
        auditService: AuditService,
        componentFactoryResolver: ComponentFactoryResolver,
        messagingService: MessagingService,
        userService: UserService,
        private route: ActivatedRoute
    ) {
        super(cipherService, auditService, componentFactoryResolver, messagingService, userService);
    }

    ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            super.ngOnInit();
        });
    }

    getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllFromApiForOrganization(this.organization.id);
    }
}
