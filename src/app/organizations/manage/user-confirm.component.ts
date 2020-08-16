import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ConstantsService } from 'jslib/services/constants.service';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { OrganizationUserConfirmRequest } from 'jslib/models/request/organizationUserConfirmRequest';

import { Utils } from 'jslib/misc/utils';

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
    formPromise: Promise<any>;

    private publicKey: Uint8Array = null;

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private cryptoService: CryptoService,
        private storageService: StorageService
    ) {}

    async ngOnInit() {
        try {
            const publicKeyResponse = await this.apiService.getUserPublicKey(this.userId);
            if (publicKeyResponse != null) {
                this.publicKey = Utils.fromB64ToArray(publicKeyResponse.publicKey);
                const fingerprint = await this.cryptoService.getFingerprint(
                    this.userId,
                    this.publicKey.buffer
                );
                if (fingerprint != null) {
                    this.fingerprint = fingerprint.join('-');
                }
            }
        } catch {}
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
            this.formPromise = this.doConfirmation();
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Confirmed User' });
            this.toasterService.popAsync(
                'success',
                null,
                this.i18nService.t('hasBeenConfirmed', this.name)
            );
            this.onConfirmedUser.emit();
        } catch {}
    }

    private async doConfirmation() {
        const orgKey = await this.cryptoService.getOrgKey(this.organizationId);
        const key = await this.cryptoService.rsaEncrypt(orgKey.key, this.publicKey.buffer);
        const request = new OrganizationUserConfirmRequest();
        request.key = key.encryptedString;
        await this.apiService.postOrganizationUserConfirm(
            this.organizationId,
            this.organizationUserId,
            request
        );
    }
}
