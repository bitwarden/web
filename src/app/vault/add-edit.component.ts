import {
    Component,
    OnInit,
} from '@angular/core';

import { CipherType } from 'jslib/enums/cipherType';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/add-edit.component';
import { LoginUriView } from 'jslib/models/view/loginUriView';

@Component({
    selector: 'app-vault-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent implements OnInit {
    canAccessPremium: boolean;
    totpCode: string;
    totpCodeFormatted: string;
    totpDash: number;
    totpSec: number;
    totpLow: boolean;
    showRevisionDate = false;
    hasPasswordHistory = false;
    viewingPasswordHistory = false;

    protected totpInterval: number;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, stateService: StateService,
        protected userService: UserService, protected totpService: TotpService,
        protected passwordGenerationService: PasswordGenerationService, protected messagingService: MessagingService) {
        super(cipherService, folderService, i18nService, platformUtilsService, auditService, stateService);
    }

    async ngOnInit() {
        await super.load();
        this.showRevisionDate = this.cipher.passwordRevisionDisplayDate != null;
        this.hasPasswordHistory = this.cipher.hasPasswordHistory;
        this.cleanUp();

        this.canAccessPremium = await this.userService.canAccessPremium();
        if (this.cipher.type === CipherType.Login && this.cipher.login.totp &&
            (this.cipher.organizationUseTotp || this.canAccessPremium)) {
            await this.totpUpdateCode();
            const interval = this.totpService.getTimeInterval(this.cipher.login.totp);
            await this.totpTick(interval);

            this.totpInterval = window.setInterval(async () => {
                await this.totpTick(interval);
            }, 1000);
        }
    }

    toggleFavorite() {
        this.cipher.favorite = !this.cipher.favorite;
    }

    launch(uri: LoginUriView) {
        if (!uri.canLaunch) {
            return;
        }

        this.platformUtilsService.eventTrack('Launched Login URI');
        this.platformUtilsService.launchUri(uri.uri);
    }

    copy(value: string, typeI18nKey: string, aType: string) {
        if (value == null) {
            return;
        }

        this.platformUtilsService.eventTrack('Copied ' + aType);
        this.platformUtilsService.copyToClipboard(value, { window: window });
        this.platformUtilsService.showToast('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t(typeI18nKey)));
    }

    async generatePassword(): Promise<boolean> {
        const confirmed = await super.generatePassword();
        if (confirmed) {
            const options = await this.passwordGenerationService.getOptions();
            this.cipher.login.password = await this.passwordGenerationService.generatePassword(options);
        }
        return confirmed;
    }

    async premiumRequired() {
        if (!this.canAccessPremium) {
            this.messagingService.send('premiumRequired');
            return;
        }
    }

    async upgradeOrganization() {
        this.messagingService.send('upgradeOrganization', { organizationId: this.cipher.organizationId });
    }

    viewHistory() {
        this.viewingPasswordHistory = !this.viewingPasswordHistory;
    }

    protected cleanUp() {
        if (this.totpInterval) {
            window.clearInterval(this.totpInterval);
        }
    }

    protected async totpUpdateCode() {
        if (this.cipher == null || this.cipher.type !== CipherType.Login || this.cipher.login.totp == null) {
            if (this.totpInterval) {
                window.clearInterval(this.totpInterval);
            }
            return;
        }

        this.totpCode = await this.totpService.getCode(this.cipher.login.totp);
        if (this.totpCode != null) {
            if (this.totpCode.length > 4) {
                const half = Math.floor(this.totpCode.length / 2);
                this.totpCodeFormatted = this.totpCode.substring(0, half) + ' ' + this.totpCode.substring(half);
            } else {
                this.totpCodeFormatted = this.totpCode;
            }
        } else {
            this.totpCodeFormatted = null;
            if (this.totpInterval) {
                window.clearInterval(this.totpInterval);
            }
        }
    }

    private async totpTick(intervalSeconds: number) {
        const epoch = Math.round(new Date().getTime() / 1000.0);
        const mod = epoch % intervalSeconds;

        this.totpSec = intervalSeconds - mod;
        this.totpDash = +(Math.round((((78.6 / intervalSeconds) * mod) + 'e+2') as any) + 'e-2');
        this.totpLow = this.totpSec <= 7;
        if (mod === 0) {
            await this.totpUpdateCode();
        }
    }
}
