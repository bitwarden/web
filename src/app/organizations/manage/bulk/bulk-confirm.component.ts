import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';

import { OrganizationUserBulkConfirmRequest } from 'jslib-common/models/request/organizationUserBulkConfirmRequest';
import { OrganizationUserBulkRequest } from 'jslib-common/models/request/organizationUserBulkRequest';

import { OrganizationUserUserDetailsResponse } from 'jslib-common/models/response/organizationUserResponse';

import { OrganizationUserStatusType } from 'jslib-common/enums/organizationUserStatusType';

import { Utils } from 'jslib-common/misc/utils';

@Component({
    selector: 'app-bulk-confirm',
    templateUrl: 'bulk-confirm.component.html',
})
export class BulkConfirmComponent implements OnInit {

    @Input() organizationId: string;
    @Input() users: OrganizationUserUserDetailsResponse[];

    excludedUsers: OrganizationUserUserDetailsResponse[];
    filteredUsers: OrganizationUserUserDetailsResponse[];
    publicKeys: Map<string, Uint8Array> = new Map();
    fingerprints: Map<string, string> = new Map();
    statuses: Map<string, string> = new Map();

    loading: boolean = true;
    done: boolean = false;
    error: string;

    constructor(private cryptoService: CryptoService, private apiService: ApiService,
      private i18nService: I18nService) { }

    async ngOnInit() {
        this.excludedUsers = this.users.filter(user => user.status !== OrganizationUserStatusType.Accepted);
        this.filteredUsers = this.users.filter(user => user.status === OrganizationUserStatusType.Accepted);

        if (this.filteredUsers.length <= 0) {
            this.done = true;
        }

        const request = new OrganizationUserBulkRequest(this.filteredUsers.map(user => user.id));
        const response = await this.apiService.postOrganizationUsersPublicKey(this.organizationId, request);

        for (const entry of response.data) {
            const publicKey = Utils.fromB64ToArray(entry.key);
            const fingerprint = await this.cryptoService.getFingerprint(entry.userId, publicKey.buffer);
            if (fingerprint != null) {
                this.publicKeys.set(entry.id, publicKey);
                this.fingerprints.set(entry.id, fingerprint.join('-'));
            }
        }

        this.loading = false;
    }

    async submit() {
        this.loading = true;
        try {
            const orgKey = await this.cryptoService.getOrgKey(this.organizationId);
            const userIdsWithKeys: any[] = [];
            for (const user of this.filteredUsers) {
                const publicKey = this.publicKeys.get(user.id);
                if (publicKey == null) {
                    continue;
                }
                const key = await this.cryptoService.rsaEncrypt(orgKey.key, publicKey.buffer);
                userIdsWithKeys.push({
                    id: user.id,
                    key: key.encryptedString,
                });
            }
            const request = new OrganizationUserBulkConfirmRequest(userIdsWithKeys);
            const response = await this.apiService.postOrganizationUserBulkConfirm(this.organizationId, request);

            response.data.forEach(entry => {
                const error = entry.error !== '' ? entry.error : this.i18nService.t('bulkConfirmMessage');
                this.statuses.set(entry.id, error);
            });

            this.done = true;
        } catch (e) {
            this.error = e.message;
        }
        this.loading = false;
    }
}
