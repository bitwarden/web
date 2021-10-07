import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

import { StorageKey } from 'jslib-common/enums/storageKey';

@Component({
    selector: 'app-user-confirm',
    templateUrl: 'user-confirm.component.html',
})
export class UserConfirmComponent implements OnInit {
    @Input() name: string;
    @Input() userId: string;
    @Input() publicKey: Uint8Array;
    @Output() onConfirmedUser = new EventEmitter();

    dontAskAgain = false;
    loading = true;
    fingerprint: string;
    formPromise: Promise<any>;

    constructor(private cryptoService: CryptoService, private storageService: StorageService) { }

    async ngOnInit() {
        try {
            if (this.publicKey != null) {
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
            await this.storageService.save(StorageKey.AutoConfirmFingerprints, true);
        }

        this.onConfirmedUser.emit();
    }
}
