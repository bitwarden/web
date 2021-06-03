import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { ApiService } from 'jslib-common/abstractions/api.service';

import { LoginComponent as BaseLoginComponent } from 'jslib-angular/components/login.component';

import { Policy } from 'jslib-common/models/domain/policy';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent {

    showResetPasswordAutoEnrollWarning = false;

    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, private route: ActivatedRoute,
        storageService: StorageService, stateService: StateService,
        platformUtilsService: PlatformUtilsService, environmentService: EnvironmentService,
        passwordGenerationService: PasswordGenerationService, cryptoFunctionService: CryptoFunctionService,
        private apiService: ApiService, private policyService: PolicyService) {
        super(authService, router,
            platformUtilsService, i18nService,
            stateService, environmentService,
            passwordGenerationService, cryptoFunctionService,
            storageService);
        this.onSuccessfulLoginNavigate = this.goAfterLogIn;
    }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe(async qParams => {
            if (qParams.email != null && qParams.email.indexOf('@') > -1) {
                this.email = qParams.email;
            }
            if (qParams.premium != null) {
                this.stateService.save('loginRedirect', { route: '/settings/premium' });
            } else if (qParams.org != null) {
                this.stateService.save('loginRedirect',
                    { route: '/settings/create-organization', qParams: { plan: qParams.org } });
            }
            await super.ngOnInit();
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });

        const invite = await this.stateService.get<any>('orgInvitation');
        if (invite != null) {
            let policyList: Policy[] = null;
            try {
                const policies = await this.apiService.getPoliciesByToken(invite.organizationId, invite.token,
                    invite.email, invite.organizationUserId);
                policyList = this.policyService.mapPoliciesFromToken(policies);
            } catch { }

            if (policyList != null) {
                const result = this.policyService.getResetPasswordPolicyOptions(policyList, invite.organizationId);
                // Set to true if policy enabled and auto-enroll enabled
                this.showResetPasswordAutoEnrollWarning = result[1] && result[0].autoEnrollEnabled;
            }
        }
    }

    async goAfterLogIn() {
        const orgInvite = await this.stateService.get<any>('orgInvitation');
        const emergencyInvite = await this.stateService.get<any>('emergencyInvitation');
        if (orgInvite != null) {
            this.router.navigate(['accept-organization'], { queryParams: orgInvite });
        } else if (emergencyInvite != null) {
            this.router.navigate(['accept-emergency'], { queryParams: emergencyInvite });
        } else {
            const loginRedirect = await this.stateService.get<any>('loginRedirect');
            if (loginRedirect != null) {
                this.router.navigate([loginRedirect.route], { queryParams: loginRedirect.qParams });
                await this.stateService.remove('loginRedirect');
            } else {
                this.router.navigate([this.successRoute]);
            }
        }
    }
}
