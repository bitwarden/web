import {
    Component,
    OnInit,
} from '@angular/core';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PasswordRepromptService } from 'jslib-common/abstractions/passwordReprompt.service';

import { ModalService } from 'jslib-angular/services/modal.service';

import { CipherView } from 'jslib-common/models/view/cipherView';

import { CipherType } from 'jslib-common/enums/cipherType';

import { Utils } from 'jslib-common/misc/utils';

import { CipherReportComponent } from './cipher-report.component';

@Component({
    selector: 'app-inactive-two-factor-report',
    templateUrl: 'inactive-two-factor-report.component.html',
})
export class InactiveTwoFactorReportComponent extends CipherReportComponent implements OnInit {
    services = new Map<string, string>();
    cipherDocs = new Map<string, string>();

    constructor(protected cipherService: CipherService, modalService: ModalService,
        messagingService: MessagingService, activeAccount: ActiveAccountService,
        passwordRepromptService: PasswordRempromptService) {
        super(modalService, messagingService, true, activeAccount, passwordRepromptService);
    }

    async ngOnInit() {
        if (await this.checkAccess()) {
            await super.load();
        }
    }

    async setCiphers() {
        try {
            await this.load2fa();
        } catch { }
        if (this.services.size > 0) {
            const allCiphers = await this.getAllCiphers();
            const inactive2faCiphers: CipherView[] = [];
            const promises: Promise<void>[] = [];
            const docs = new Map<string, string>();
            allCiphers.forEach(c => {
                if (c.type !== CipherType.Login || (c.login.totp != null && c.login.totp !== '') || !c.login.hasUris ||
                    c.isDeleted) {
                    return;
                }
                for (let i = 0; i < c.login.uris.length; i++) {
                    const u = c.login.uris[i];
                    if (u.uri != null && u.uri !== '') {
                        const hostname = Utils.getHostname(u.uri);
                        if (hostname != null && this.services.has(hostname)) {
                            if (this.services.get(hostname) != null) {
                                docs.set(c.id, this.services.get(hostname));
                            }
                            inactive2faCiphers.push(c);
                            break;
                        }
                    }
                }
            });
            await Promise.all(promises);
            this.ciphers = inactive2faCiphers;
            this.cipherDocs = docs;
        }
    }

    protected getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllDecrypted();
    }

    private async load2fa() {
        if (this.services.size > 0) {
            return;
        }
        const response = await fetch(new Request('https://2fa.directory/api/v2/totp.json'));
        if (response.status !== 200) {
            throw new Error();
        }
        const responseJson = await response.json();
        for (const categoryName in responseJson) {
            if (responseJson.hasOwnProperty(categoryName)) {
                const category = responseJson[categoryName];
                for (const serviceName in category) {
                    if (category.hasOwnProperty(serviceName)) {
                        const service = category[serviceName];
                        if (service.url != null) {
                            const hostname = Utils.getHostname(service.url);
                            if (hostname != null) {
                                this.services.set(hostname, service.doc);
                            }
                        }
                    }
                }
            }
        }
    }
}
