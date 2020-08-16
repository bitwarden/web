import { Component, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherView } from 'jslib/models/view/cipherView';

import { WeakPasswordsReportComponent as BaseWeakPasswordsReportComponent } from '../../tools/weak-passwords-report.component';

@Component({
    selector: 'app-weak-passwords-report',
    templateUrl: '../../tools/weak-passwords-report.component.html',
})
export class WeakPasswordsReportComponent extends BaseWeakPasswordsReportComponent {
    constructor(
        cipherService: CipherService,
        passwordGenerationService: PasswordGenerationService,
        componentFactoryResolver: ComponentFactoryResolver,
        messagingService: MessagingService,
        userService: UserService,
        private route: ActivatedRoute
    ) {
        super(
            cipherService,
            passwordGenerationService,
            componentFactoryResolver,
            messagingService,
            userService
        );
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
