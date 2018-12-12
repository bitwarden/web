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
    passwordStrengthMap = new Map<string, [string, string]>();

    private passwordStrengthCache = new Map<string, number>();

    constructor(private ciphersService: CipherService, private passwordGenerationService: PasswordGenerationService,
        componentFactoryResolver: ComponentFactoryResolver, messagingService: MessagingService,
        userService: UserService) {
        super(componentFactoryResolver, userService, messagingService, true);
    }

    async ngOnInit() {
        if (await this.checkPremium()) {
            await super.load();
        }
    }

    async setCiphers() {
        const allCiphers = await this.ciphersService.getAllDecrypted();
        const weakPasswordCiphers: CipherView[] = [];
        allCiphers.forEach((c) => {
            if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '') {
                return;
            }
            if (!this.passwordStrengthCache.has(c.login.password)) {
                const result = this.passwordGenerationService.passwordStrength(c.login.password);
                this.passwordStrengthCache.set(c.login.password, result.score);
            }
            const score = this.passwordStrengthCache.get(c.login.password);
            if (score != null && score <= 3) {
                this.passwordStrengthMap.set(c.id, this.scoreKey(score));
                weakPasswordCiphers.push(c);
            }
        });
        this.ciphers = weakPasswordCiphers;
    }

    private scoreKey(score: number): [string, string] {
        switch (score) {
            case 4:
                return ['strong', 'success'];
            case 3:
                return ['good', 'primary'];
            case 2:
                return ['weak', 'warning'];
            default:
                return ['veryWeak', 'danger'];
        }
    }
}
