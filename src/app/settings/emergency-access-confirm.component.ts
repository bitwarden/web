import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ConstantsService } from 'jslib/services/constants.service';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'emergency-access-confirm',
    templateUrl: 'emergency-access-confirm.component.html',
})
export class EmergencyAccessConfirmComponent implements OnInit {
    @Input() name: string;
    @Input() userId: string;
    @Input() emergencyAccessId: string;
    @Output() onConfirmedUser = new EventEmitter();

    dontAskAgain = false;
    loading = true;
    fingerprint: string;
    formPromise: Promise<any>;

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

        try {
            this.onConfirmedUser.emit();
        } catch { }
    }
}
