import {
    Component,
    OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { Organization } from 'jslib-common/models/domain/organization';

import { KeyConnectorUserKeyRequest } from 'jslib-common/models/request/keyConnectorUserKeyRequest';

@Component({
    selector: 'app-organization-encryption',
    templateUrl: 'organization-encryption.component.html',
})
export class OrganizationEncryptionComponent implements OnInit {

    actionPromise: Promise<any>;
    continuing: boolean = false;
    leaving: boolean = false;

    loading: boolean = true;
    organization: Organization;
    email: string;

    constructor(private router: Router, private userService: UserService,
        private apiService: ApiService, private cryptoService: CryptoService,
        private syncService: SyncService, private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService) { }

    async ngOnInit() {
        this.organization = (await this.userService.getAllOrganizations())[0];
        this.email = await this.userService.getEmail();
        await this.syncService.fullSync(false);
        this.loading = false;
    }

    async convert() {
        this.continuing = true;
        this.actionPromise = this.convertAccount();

        try {
            await this.actionPromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t('removedMasterPassword'));
            this.router.navigate(['']);
        } catch (e) {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'), e);
        }
    }

    async leave() {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('leaveOrganizationConfirmation'), this.organization.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.leaving = true;
            this.actionPromise = this.apiService.postLeaveOrganization(this.organization.id).then(() => {
                return this.syncService.fullSync(true);
            });
            await this.actionPromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t('leftOrganization'));
            this.router.navigate(['']);
        } catch (e) {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'), e);
        }
    }

    private async convertAccount() {
        const key = await this.cryptoService.getKey();
        try {
            const keyConnectorRequest = new KeyConnectorUserKeyRequest(key.encKeyB64);
            await this.apiService.postUserKeyToKeyConnector(this.organization.keyConnectorUrl, keyConnectorRequest);
        } catch (e) {
            throw new Error('Unable to reach key connector');
        }

        await this.apiService.postConvertToKeyConnector();
    }
}
