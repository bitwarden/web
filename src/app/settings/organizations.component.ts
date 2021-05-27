import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';
import { Policy } from 'jslib/models/domain/policy';

import { Utils } from 'jslib/misc/utils';

import { OrganizationUserResetPasswordEnrollmentRequest } from 'jslib/models/request/organizationUserResetPasswordEnrollmentRequest';

import { PolicyType } from 'jslib/enums/policyType';

@Component({
    selector: 'app-organizations',
    templateUrl: 'organizations.component.html',
})
export class OrganizationsComponent implements OnInit {
    @Input() vault = false;

    organizations: Organization[];
    policies: Policy[];
    loaded: boolean = false;
    actionPromise: Promise<any>;

    constructor(private userService: UserService, private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService, private apiService: ApiService,
        private toasterService: ToasterService, private syncService: SyncService,
        private cryptoService: CryptoService, private policyService: PolicyService) { }

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
        this.policies = await this.policyService.getAll(PolicyType.ResetPassword);
        this.loaded = true;
    }

    allowEnrollmentChanges(org: Organization): boolean {
        if (org.usePolicies && org.useResetPassword && org.hasPublicAndPrivateKeys) {
            return this.policies.some(p => p.organizationId === org.id && p.enabled);
        }

        return false;
    }

    showEnrolledStatus(org: Organization): boolean {
        return org.useResetPassword && org.resetPasswordEnrolled && this.policies.some(p => p.organizationId === org.id && p.enabled);
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
        // Set variables
        let keyString: string = null;
        let toastStringRef = 'withdrawPasswordResetSuccess';

        // Enrolling
        if (!org.resetPasswordEnrolled) {
            // Alert user about enrollment
            const confirmed = await this.platformUtilsService.showDialog(
                this.i18nService.t('resetPasswordEnrollmentWarning'), null,
                this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
            if (!confirmed) {
                return;
            }

            // Retrieve Public Key
            this.actionPromise = this.apiService.getOrganizationKeys(org.id)
                .then(async response => {
                    let publicKey = null;

                    if (response != null) {
                        publicKey = Utils.fromB64ToArray(response.publicKey);
                    } else {
                        throw new Error('Get Organization Keys response is null');
                    }

                    // RSA Encrypt user's encKey.key with organization public key
                    const encKey = await this.cryptoService.getEncKey();
                    const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);
                    keyString = encryptedKey.encryptedString;
                    toastStringRef = 'enrollPasswordResetSuccess';

                    // Create request and execute enrollment
                    const request = new OrganizationUserResetPasswordEnrollmentRequest();
                    request.resetPasswordKey = keyString;
                    return this.apiService.putOrganizationUserResetPasswordEnrollment(org.id, org.userId, request);
                })
                .then(() => {
                    return this.syncService.fullSync(true);
                });
        } else {
            // Withdrawal
            const request = new OrganizationUserResetPasswordEnrollmentRequest();
            request.resetPasswordKey = keyString;
            this.actionPromise = this.apiService.putOrganizationUserResetPasswordEnrollment(org.id, org.userId, request)
                .then(() => {
                    return this.syncService.fullSync(true);
                });
        }

        try {
            await this.actionPromise;
            this.platformUtilsService.showToast('success', null, this.i18nService.t(toastStringRef));
            await this.load();
        } catch { }
    }
}
