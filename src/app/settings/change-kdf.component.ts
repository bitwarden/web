import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';

import { KdfRequest } from 'jslib-common/models/request/kdfRequest';

import { KdfType } from 'jslib-common/enums/kdfType';
import { StorageKey } from 'jslib-common/enums/storageKey';

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

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private cryptoService: CryptoService,
        private messagingService: MessagingService, private activeAccount: ActiveAccountService) {
        this.kdfOptions = [
            { name: 'PBKDF2 SHA-256', value: KdfType.PBKDF2_SHA256 },
        ];
    }

    async ngOnInit() {
        this.kdf = await this.activeAccount.getInformation<KdfType>(StorageKey.KdfType);
        this.kdfIterations = await this.activeAccount.getInformation<number>(StorageKey.KdfIterations);
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
        request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);
        const email = this.activeAccount.email;
        const newKey = await this.cryptoService.makeKey(this.masterPassword, email, this.kdf, this.kdfIterations);
        request.newMasterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, newKey);
        const newEncKey = await this.cryptoService.remakeEncKey(newKey);
        request.key = newEncKey[1].encryptedString;
        try {
            this.formPromise = this.apiService.postAccountKdf(request);
            await this.formPromise;
            this.toasterService.popAsync('success', this.i18nService.t('encKeySettingsChanged'),
                this.i18nService.t('logBackIn'));
            this.messagingService.send('logout');
        } catch { }
    }
}
