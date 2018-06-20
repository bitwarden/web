import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherType } from 'jslib/enums/cipherType';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/add-edit.component';
import { LoginUriView } from 'jslib/models/view/loginUriView';

@Component({
    selector: 'app-vault-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent implements OnInit {
    isPremium: boolean;
    totpCode: string;
    totpCodeFormatted: string;
    totpDash: number;
    totpSec: number;
    totpLow: boolean;

    private totpInterval: number;

    constructor(cipherService: CipherService, folderService: FolderService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        analytics: Angulartics2, toasterService: ToasterService,
        auditService: AuditService, stateService: StateService,
        private tokenService: TokenService, private totpService: TotpService) {
        super(cipherService, folderService, i18nService, platformUtilsService, analytics,
            toasterService, auditService, stateService);
    }

    async ngOnInit() {
        await super.load();
        this.cleanUp();

        this.isPremium = this.tokenService.getPremium();
        if (this.cipher.type === CipherType.Login && this.cipher.login.totp &&
            (this.cipher.organizationUseTotp || this.isPremium)) {
            await this.totpUpdateCode();
            await this.totpTick();

            this.totpInterval = window.setInterval(async () => {
                await this.totpTick();
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

        this.analytics.eventTrack.next({ action: 'Launched Login URI' });
        this.platformUtilsService.launchUri(uri.uri);
    }

    copy(value: string, typeI18nKey: string, aType: string) {
        if (value == null) {
            return;
        }

        this.analytics.eventTrack.next({ action: 'Copied ' + aType });
        this.platformUtilsService.copyToClipboard(value, { doc: window.document });
        this.toasterService.popAsync('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t(typeI18nKey)));
    }

    private cleanUp() {
        if (this.totpInterval) {
            window.clearInterval(this.totpInterval);
        }
    }

    private async totpUpdateCode() {
        if (this.cipher == null || this.cipher.type !== CipherType.Login || this.cipher.login.totp == null) {
            if (this.totpInterval) {
                window.clearInterval(this.totpInterval);
            }
            return;
        }

        this.totpCode = await this.totpService.getCode(this.cipher.login.totp);
        if (this.totpCode != null) {
            this.totpCodeFormatted = this.totpCode.substring(0, 3) + ' ' + this.totpCode.substring(3);
        } else {
            this.totpCodeFormatted = null;
            if (this.totpInterval) {
                window.clearInterval(this.totpInterval);
            }
        }
    }

    private async totpTick() {
        const epoch = Math.round(new Date().getTime() / 1000.0);
        const mod = epoch % 30;

        this.totpSec = 30 - mod;
        this.totpDash = +(Math.round(((2.62 * mod) + 'e+2') as any) + 'e-2');
        this.totpLow = this.totpSec <= 7;
        if (mod === 0) {
            await this.totpUpdateCode();
        }
    }
}
