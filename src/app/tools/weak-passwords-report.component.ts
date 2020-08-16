import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';

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

    constructor(
        protected cipherService: CipherService,
        protected passwordGenerationService: PasswordGenerationService,
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
        const weakPasswordCiphers: CipherView[] = [];
        allCiphers.forEach((c) => {
            if (
                c.type !== CipherType.Login ||
                c.login.password == null ||
                c.login.password === ''
            ) {
                return;
            }
            const hasUsername = c.login.username != null && c.login.username.trim() !== '';
            const cacheKey = c.login.password + '_____' + (hasUsername ? c.login.username : '');
            if (!this.passwordStrengthCache.has(cacheKey)) {
                let userInput: string[] = [];
                if (hasUsername) {
                    const atPosition = c.login.username.indexOf('@');
                    if (atPosition > -1) {
                        userInput = userInput
                            .concat(
                                c.login.username
                                    .substr(0, atPosition)
                                    .trim()
                                    .toLowerCase()
                                    .split(/[^A-Za-z0-9]/)
                            )
                            .filter((i) => i.length >= 3);
                    } else {
                        userInput = c.login.username
                            .trim()
                            .toLowerCase()
                            .split(/[^A-Za-z0-9]/)
                            .filter((i) => i.length >= 3);
                    }
                }
                const result = this.passwordGenerationService.passwordStrength(
                    c.login.password,
                    userInput.length > 0 ? userInput : null
                );
                this.passwordStrengthCache.set(cacheKey, result.score);
            }
            const score = this.passwordStrengthCache.get(cacheKey);
            if (score != null && score <= 2) {
                this.passwordStrengthMap.set(c.id, this.scoreKey(score));
                weakPasswordCiphers.push(c);
            }
        });
        this.ciphers = weakPasswordCiphers;
    }

    protected getAllCiphers(): Promise<CipherView[]> {
        return this.cipherService.getAllDecrypted();
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
