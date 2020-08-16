import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherReportComponent } from './cipher-report.component';

@Component({
    selector: 'app-reused-passwords-report',
    templateUrl: 'reused-passwords-report.component.html',
})
export class ReusedPasswordsReportComponent extends CipherReportComponent implements OnInit {
    passwordUseMap: Map<string, number>;

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
        const ciphersWithPasswords: CipherView[] = [];
        this.passwordUseMap = new Map<string, number>();
        allCiphers.forEach((c) => {
            if (
                c.type !== CipherType.Login ||
                c.login.password == null ||
                c.login.password === ''
            ) {
                return;
            }
            ciphersWithPasswords.push(c);
            if (this.passwordUseMap.has(c.login.password)) {
                this.passwordUseMap.set(
                    c.login.password,
                    this.passwordUseMap.get(c.login.password) + 1
                );
            } else {
                this.passwordUseMap.set(c.login.password, 1);
            }
        });
        const reusedPasswordCiphers = ciphersWithPasswords.filter(
            (c) =>
                this.passwordUseMap.has(c.login.password) &&
                this.passwordUseMap.get(c.login.password) > 1
        );
        this.ciphers = reusedPasswordCiphers;
    }

    protected getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllDecrypted();
    }
}
