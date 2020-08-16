import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherReportComponent } from './cipher-report.component';

@Component({
    selector: 'app-unsecured-websites-report',
    templateUrl: 'unsecured-websites-report.component.html',
})
export class UnsecuredWebsitesReportComponent extends CipherReportComponent implements OnInit {
    constructor(
        protected cipherService: CipherService,
        componentFactoryResolver: ComponentFactoryResolver,
        messagingService: MessagingService,
        userService: UserService
    ) {
        super(componentFactoryResolver, userService, messagingService, true);
    }

    async ngOnInit() {
        if (await this.checkAccess()) {
            await super.load();
        }
    }

    async setCiphers() {
        const allCiphers = await this.getAllCiphers();
        const unsecuredCiphers = allCiphers.filter((c) => {
            if (c.type !== CipherType.Login || !c.login.hasUris) {
                return false;
            }
            return c.login.uris.some((u) => u.uri != null && u.uri.indexOf('http://') === 0);
        });
        this.ciphers = unsecuredCiphers;
    }

    protected getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllDecrypted();
    }
}
