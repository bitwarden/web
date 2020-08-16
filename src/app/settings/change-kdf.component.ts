import { Component, OnInit } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

import { KdfRequest } from 'jslib/models/request/kdfRequest';

import { KdfType } from 'jslib/enums/kdfType';

@Component({
    selector: 'app-change-kdf',
    templateUrl: 'change-kdf.component.html',
})
export class ChangeKdfComponent implements OnInit {
    masterPassword: string;
    kdfIterations: number;
    kdf = KdfType.PBKDF2_SHA256;
    kdfOptions: any[] = [];
    formPromise: Promise<any>;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private cryptoService: CryptoService,
        private messagingService: MessagingService,
        private userService: UserService
    ) {
        this.kdfOptions = [{ name: 'PBKDF2 SHA-256', value: KdfType.PBKDF2_SHA256 }];
    }

    async ngOnInit() {
        this.kdf = await this.userService.getKdf();
        this.kdfIterations = await this.userService.getKdfIterations();
    }

    async submit() {
        const hasEncKey = await this.cryptoService.hasEncKey();
        if (!hasEncKey) {
            this.toasterService.popAsync('error', null, this.i18nService.t('updateKey'));
            return;
        }

        const request = new KdfRequest();
        request.kdf = this.kdf;
        request.kdfIterations = this.kdfIterations;
        request.masterPasswordHash = await this.cryptoService.hashPassword(
            this.masterPassword,
            null
        );
        const email = await this.userService.getEmail();
        const newKey = await this.cryptoService.makeKey(
            this.masterPassword,
            email,
            this.kdf,
            this.kdfIterations
        );
        request.newMasterPasswordHash = await this.cryptoService.hashPassword(
            this.masterPassword,
            newKey
        );
        const newEncKey = await this.cryptoService.remakeEncKey(newKey);
        request.key = newEncKey[1].encryptedString;
        try {
            this.formPromise = this.apiService.postAccountKdf(request);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Changed KDF' });
            this.toasterService.popAsync(
                'success',
                this.i18nService.t('encKeySettingsChanged'),
                this.i18nService.t('logBackIn')
            );
            this.messagingService.send('logout');
        } catch {}
    }
}
