import {
    Component,
    ComponentFactoryResolver,
    OnInit,
} from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherReportComponent } from './cipher-report.component';

@Component({
    selector: 'app-weak-passwords-report',
    templateUrl: 'weak-passwords-report.component.html',
})
export class WeakPasswordsReportComponent extends CipherReportComponent implements OnInit {
    passwordStrengthMap = new Map<string, [string, string, number]>();
    showAllCheckbox: boolean;
    weakPasswordCount: number;

    private passwordStrengthCache = new Map<string, number>();

    constructor(protected cipherService: CipherService, protected passwordGenerationService: PasswordGenerationService,
        componentFactoryResolver: ComponentFactoryResolver, messagingService: MessagingService,
        userService: UserService) {
        super(componentFactoryResolver, userService, messagingService, true);
    }

    async ngOnInit() {
        if (await this.checkAccess()) {
            await super.load();
        }
    }

    async setCiphers() {
        const allCiphers = await this.getAllCiphers();
        const weakPasswordCiphers: CipherView[] = [];
        this.weakPasswordCount = 0;
        allCiphers.forEach((c) => {
            if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '') {
                return;
            }
            const hasUsername = c.login.username != null && c.login.username.trim() !== '';
            const cacheKey = c.login.password + '_____' + (hasUsername ? c.login.username : '');
            if (!this.passwordStrengthCache.has(cacheKey)) {
                let userInput: string[] = [];
                if (hasUsername) {
                    const atPosition = c.login.username.indexOf('@');
                    if (atPosition > -1) {
                        userInput = userInput.concat(
                            c.login.username.substr(0, atPosition).trim().toLowerCase().split(/[^A-Za-z0-9]/))
                            .filter((i) => i.length >= 3);
                    } else {
                        userInput = c.login.username.trim().toLowerCase().split(/[^A-Za-z0-9]/)
                            .filter((i) => i.length >= 3);
                    }
                }
                const result = this.passwordGenerationService.passwordStrength(c.login.password,
                    userInput.length > 0 ? userInput : null);
                this.passwordStrengthCache.set(cacheKey, result.score);
            }
            const score = this.passwordStrengthCache.get(cacheKey);
            if (score != null && (score <= 2 || this.showAllCheckbox)) {

                let charSetSize = 0;
                if (c.login.password.match(/[abcdefghijklmnopqrstuvwxyz]/g) != null) {
                    charSetSize += 26;
                }
                if (c.login.password.match(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/g) != null) {
                    charSetSize += 26;
                }
                if (c.login.password.match(/\d/g) != null) {
                    charSetSize += 10;
                }
                if (c.login.password.match(/[+,\/]/g) != null) {
                    charSetSize += 3;
                }
                if (c.login.password.match(/[!"#$%&'()*-.:;<=>?@[\]^_\\`{|}~]/g) != null) {
                    charSetSize += 29;
                }
                const passwordEntropy = Math.round(Math.log2(Math.pow(charSetSize, c.login.password.length)));

                this.passwordStrengthMap.set(c.id, this.scoreKey(score, passwordEntropy));
                weakPasswordCiphers.push(c);
                if (score <= 2) {
                    this.weakPasswordCount = ++this.weakPasswordCount;
                }
            }
        });
        this.ciphers = weakPasswordCiphers;
    }

    protected getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllDecrypted();
    }

    private scoreKey(score: number, passwordEntropy: number): [string, string, number] {
        switch (score) {
            case 4:
                return ['strong', 'success', passwordEntropy];
            case 3:
                return ['good', 'primary', passwordEntropy];
            case 2:
                return ['weak', 'warning', passwordEntropy];
            default:
                return ['veryWeak', 'danger', passwordEntropy];
        }
    }
}
