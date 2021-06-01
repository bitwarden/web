import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { Organization } from 'jslib-common/models/domain/organization';

import { Utils } from 'jslib-common/misc/utils';

import { OrganizationUserResetPasswordEnrollmentRequest } from 'jslib-common/models/request/organizationUserResetPasswordEnrollmentRequest';

@Component({
    selector: 'app-organizations',
    templateUrl: 'organizations.component.html',
})
export class OrganizationsComponent implements OnInit {
    @Input() vault = false;

    organizations: Organization[];
    loaded: boolean = false;
    actionPromise: Promise<any>;
    // TODO Remove feature flag once ready for general release
    resetPasswordFeatureFlag = false;

    constructor(private userService: UserService, private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService, private apiService: ApiService,
        private toasterService: ToasterService, private syncService: SyncService,
        private cryptoService: CryptoService) { }

    async ngOnInit() {
        if (!this.vault) {
            await this.syncService.fullSync(true);
            await this.load();
        }
    }

    async load() {
        const orgs = await this.userService.getAllOrganizations();
        orgs.sort(Utils.getSortFunction(this.i18nService, 'name'));
        this.organizations = orgs;
        this.loaded = true;
    }

    async unlinkSso(org: Organization) {
        const confirmed = await this.platformUtilsService.showDialog(
            'Are you sure you want to unlink SSO for this organization?', org.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.apiService.deleteSsoUser(org.id).then(() => {
                return this.syncService.fullSync(true);
            });
            await this.actionPromise;
            this.toasterService.popAsync('success', null, 'Unlinked SSO');
            await this.load();
        } catch { }
    }

    async leave(org: Organization) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('leaveOrganizationConfirmation'), org.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.apiService.postLeaveOrganization(org.id).then(() => {
                return this.syncService.fullSync(true);
            });
            await this.actionPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('leftOrganization'));
            await this.load();
        } catch { }
    }

    async toggleResetPasswordEnrollment(org: Organization) {
        // Feature Flag
        if (!this.resetPasswordFeatureFlag) {
            return;
        }

        // Set variables
        let keyString: string = null;
        let toastStringRef = 'withdrawPasswordResetSuccess';

        // Enroll - encrpyt user's encKey.key with organization key
        if (!org.resetPasswordEnrolled) {
            const encKey = await this.cryptoService.getEncKey();
            const orgSymKey = await this.cryptoService.getOrgKey(org.id);
            const encryptedKey = await this.cryptoService.encrypt(encKey.key, orgSymKey);
            keyString = encryptedKey.encryptedString;
            toastStringRef = 'enrollPasswordResetSuccess';
        }

        // Create/Execute request
        try {
            const request = new OrganizationUserResetPasswordEnrollmentRequest();
            request.resetPasswordKey = keyString;
            this.actionPromise = this.apiService.putOrganizationUserResetPasswordEnrollment(org.id, org.userId, request)
                .then(() => {
                    return this.syncService.fullSync(true);
                });
            await this.actionPromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t(toastStringRef));
            await this.load();
        } catch { }
    }
}
