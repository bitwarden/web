import {
    Component,
    ComponentFactoryResolver,
    OnInit,
} from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherReportComponent } from './cipher-report.component';

@Component({
    selector: 'app-unsecured-websites-report',
    templateUrl: 'unsecured-websites-report.component.html',
})
export class UnsecuredWebsitesReportComponent extends CipherReportComponent implements OnInit {
    constructor(private ciphersService: CipherService, componentFactoryResolver: ComponentFactoryResolver,
        messagingService: MessagingService, userService: UserService) {
        super(componentFactoryResolver, userService, messagingService, true);
    }

    async ngOnInit() {
        if (await this.checkPremium()) {
            await super.load();
        }
    }

    async setCiphers() {
        const allCiphers = await this.ciphersService.getAllDecrypted();
        const unsecuredCiphers = allCiphers.filter((c) => {
            if (c.type !== CipherType.Login || !c.login.hasUris) {
                return false;
            }
            return c.login.uris.find((u) => u.uri.indexOf('http://') === 0) != null;
        });
        this.ciphers = unsecuredCiphers;
    }
}
