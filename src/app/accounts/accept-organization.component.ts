import {
    Component,
    OnInit,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import {
    Toast,
    ToasterService,
} from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { OrganizationUserAcceptRequest } from 'jslib-common/models/request/organizationUserAcceptRequest';
import { OrganizationUserResetPasswordEnrollmentRequest } from 'jslib-common/models/request/organizationUserResetPasswordEnrollmentRequest';

import { Utils } from 'jslib-common/misc/utils';
import { Policy } from 'jslib-common/models/domain/policy';

@Component({
    selector: 'app-accept-organization',
    templateUrl: 'accept-organization.component.html',
})
export class AcceptOrganizationComponent implements OnInit {
    loading = true;
    authed = false;
    orgName: string;
    email: string;
    actionPromise: Promise<any>;

    constructor(private router: Router, private toasterService: ToasterService,
        private i18nService: I18nService, private route: ActivatedRoute,
        private apiService: ApiService, private userService: UserService,
        private stateService: StateService, private cryptoService: CryptoService,
        private policyService: PolicyService) { }

    ngOnInit() {
        let fired = false;
        this.route.queryParams.subscribe(async qParams => {
            if (fired) {
                return;
            }
            fired = true;
            await this.stateService.remove('orgInvitation');
            let error = qParams.organizationId == null || qParams.organizationUserId == null || qParams.token == null;
            let errorMessage: string = null;
            if (!error) {
                this.authed = await this.userService.isAuthenticated();
                if (this.authed) {
                    const request = new OrganizationUserAcceptRequest();
                    request.token = qParams.token;
                    try {
                        if (await this.performResetPasswordAutoEnroll(qParams)) {
                            this.actionPromise = this.apiService.postOrganizationUserAccept(qParams.organizationId,
                                qParams.organizationUserId, request).then(() => {
                                    // Retrieve Public Key
                                    return this.apiService.getOrganizationKeys(qParams.organizationId);
                                }).then(async response => {
                                    if (response == null) {
                                        throw new Error(this.i18nService.t('resetPasswordOrgKeysError'));
                                    }

                                    const publicKey = Utils.fromB64ToArray(response.publicKey);

                                    // RSA Encrypt user's encKey.key with organization public key
                                    const encKey = await this.cryptoService.getEncKey();
                                    const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);

                                    // Create request and execute enrollment
                                    const resetRequest = new OrganizationUserResetPasswordEnrollmentRequest();
                                    resetRequest.resetPasswordKey = encryptedKey.encryptedString;

                                    // Get User Id
                                    const userId = await this.userService.getUserId();

                                    return this.apiService.putOrganizationUserResetPasswordEnrollment(qParams.organizationId, userId, resetRequest);
                                });
                        } else {
                            this.actionPromise = this.apiService.postOrganizationUserAccept(qParams.organizationId,
                                qParams.organizationUserId, request);
                        }

                        await this.actionPromise;
                        const toast: Toast = {
                            type: 'success',
                            title: this.i18nService.t('inviteAccepted'),
                            body: this.i18nService.t('inviteAcceptedDesc'),
                            timeout: 10000,
                        };
                        this.toasterService.popAsync(toast);
                        this.router.navigate(['/vault']);
                    } catch (e) {
                        error = true;
                        errorMessage = e.message;
                    }
                } else {
                    await this.stateService.save('orgInvitation', qParams);
                    this.email = qParams.email;
                    this.orgName = qParams.organizationName;
                    if (this.orgName != null) {
                        // Fix URL encoding of space issue with Angular
                        this.orgName = this.orgName.replace(/\+/g, ' ');
                    }
                }
            }

            if (error) {
                const toast: Toast = {
                    type: 'error',
                    title: null,
                    body: errorMessage != null ? this.i18nService.t('inviteAcceptFailedShort', errorMessage) :
                        this.i18nService.t('inviteAcceptFailed'),
                    timeout: 10000,
                };
                this.toasterService.popAsync(toast);
                this.router.navigate(['/']);
            }

            this.loading = false;
        });
    }

    private async performResetPasswordAutoEnroll(qParams: any): Promise<boolean> {
        let policyList: Policy[] = null;
        try {
            const policies = await this.apiService.getPoliciesByToken(qParams.organizationId, qParams.token,
                qParams.email, qParams.organizationUserId);
            policyList = this.policyService.mapPoliciesFromToken(policies);
        } catch { }

        if (policyList != null) {
            const result = this.policyService.getResetPasswordPolicyOptions(policyList, qParams.organizationId);
            // Return true if policy enabled and auto-enroll enabled
            return result[1] && result[0].autoEnrollEnabled;
        }

        return false;
    }
}
