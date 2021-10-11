import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { StateService } from 'jslib-common/abstractions/state.service';

import { RegisterComponent as BaseRegisterComponent } from 'jslib-angular/components/register.component';

import { MasterPasswordPolicyOptions } from 'jslib-common/models/domain/masterPasswordPolicyOptions';
import { Policy } from 'jslib-common/models/domain/policy';

import { PolicyData } from 'jslib-common/models/data/policyData';
import { ReferenceEventRequest } from 'jslib-common/models/request/referenceEventRequest';

@Component({
    selector: 'app-register',
    templateUrl: 'register.component.html',
})
export class RegisterComponent extends BaseRegisterComponent {
    showCreateOrgMessage = false;
    layout = '';
    enforcedPolicyOptions: MasterPasswordPolicyOptions;

    private policies: Policy[];

    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, cryptoService: CryptoService,
        apiService: ApiService, private route: ActivatedRoute,
        stateService: StateService, platformUtilsService: PlatformUtilsService,
        passwordGenerationService: PasswordGenerationService, private policyService: PolicyService,
        environmentService: EnvironmentService, private logService: LogService) {
        super(authService, router, i18nService, cryptoService, apiService, stateService, platformUtilsService,
            passwordGenerationService, environmentService);
    }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe(qParams => {
            this.referenceData = new ReferenceEventRequest();
            if (qParams.email != null && qParams.email.indexOf('@') > -1) {
                this.email = qParams.email;
            }
            if (qParams.premium != null) {
                this.stateService.save('loginRedirect', { route: '/settings/premium' });
            } else if (qParams.org != null) {
                this.showCreateOrgMessage = true;
                this.referenceData.flow = qParams.org;
                this.stateService.save('loginRedirect',
                    { route: '/settings/create-organization', qParams: { plan: qParams.org } });
            }
            if (qParams.layout != null) {
                this.layout = this.referenceData.layout = qParams.layout;
            }
            if (qParams.reference != null) {
                this.referenceData.id = qParams.reference;
            } else {
                this.referenceData.id = ('; ' + document.cookie).split('; reference=').pop().split(';').shift();
            }
            if (this.referenceData.id === '') {
                this.referenceData.id = null;
            }
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
        const invite = await this.stateService.get<any>('orgInvitation');
        if (invite != null) {
            try {
                const policies = await this.apiService.getPoliciesByToken(invite.organizationId, invite.token,
                    invite.email, invite.organizationUserId);
                if (policies.data != null) {
                    const policiesData = policies.data.map(p => new PolicyData(p));
                    this.policies = policiesData.map(p => new Policy(p));
                }
            } catch (e) {
                this.logService.error(e);
            }
        }

        if (this.policies != null) {
            this.enforcedPolicyOptions = await this.policyService.getMasterPasswordPolicyOptions(this.policies);
        }

        await super.ngOnInit();
    }

    async submit() {
        if (this.enforcedPolicyOptions != null &&
            !this.policyService.evaluateMasterPassword(this.masterPasswordScore, this.masterPassword,
                this.enforcedPolicyOptions)) {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPasswordPolicyRequirementsNotMet'));
            return;
        }

        await super.submit();
    }
}
