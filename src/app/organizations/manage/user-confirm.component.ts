import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ConstantsService } from 'jslib-common/services/constants.service';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

import { Utils } from 'jslib-common/misc/utils';

@Component({
    selector: 'app-user-confirm',
    templateUrl: 'user-confirm.component.html',
})
export class UserConfirmComponent implements OnInit {
    @Input() name: string;
    @Input() userId: string;
    @Input() organizationUserId: string;
    @Input() organizationId: string;
    @Output() onConfirmedUser = new EventEmitter();

    dontAskAgain = false;
    loading = true;
    fingerprint: string;

    private publicKey: Uint8Array = null;

    constructor(private apiService: ApiService, private cryptoService: CryptoService,
        private storageService: StorageService) { }

    async ngOnInit() {
        try {
            const publicKeyResponse = await this.apiService.getUserPublicKey(this.userId);
            if (publicKeyResponse != null) {
                this.publicKey = Utils.fromB64ToArray(publicKeyResponse.publicKey);
                const fingerprint = await this.cryptoService.getFingerprint(this.userId, this.publicKey.buffer);
                if (fingerprint != null) {
                    this.fingerprint = fingerprint.join('-');
                }
            }
        } catch { }
        this.loading = false;
    }

    async submit() {
        if (this.loading) {
            return;
        }

        if (this.dontAskAgain) {
            await this.storageService.save(ConstantsService.autoConfirmFingerprints, true);
        }

        this.onConfirmedUser.emit(this.publicKey);
    }
}
