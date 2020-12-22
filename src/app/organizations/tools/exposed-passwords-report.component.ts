import {
    Component,
    ComponentFactoryResolver,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

import {
    ExposedPasswordsReportComponent as BaseExposedPasswordsReportComponent,
} from '../../tools/exposed-passwords-report.component';

import { CipherView } from 'jslib/models/view/cipherView';
import { Cipher } from 'jslib/models/domain/cipher';

@Component({
    selector: 'app-exposed-passwords-report',
    templateUrl: '../../tools/exposed-passwords-report.component.html',
})
export class ExposedPasswordsReportComponent extends BaseExposedPasswordsReportComponent {
    manageableCiphers: Cipher[];

    constructor(cipherService: CipherService, auditService: AuditService,
        componentFactoryResolver: ComponentFactoryResolver, messagingService: MessagingService,
        userService: UserService, private route: ActivatedRoute) {
        super(cipherService, auditService, componentFactoryResolver, messagingService, userService);
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            this.manageableCiphers = await this.cipherService.getAll();
            super.ngOnInit();
        });
    }

    getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllFromApiForOrganization(this.organization.id);
    }

    canManageCipher(c: CipherView): boolean {
        return this.manageableCiphers.some(x => x.id === c.id);
    }
}
