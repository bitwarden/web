import { Component, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { first } from "rxjs/operators";

import { ApiService } from "jslib-common/abstractions/api.service";
import { AuthService } from "jslib-common/abstractions/auth.service";
import { CryptoFunctionService } from "jslib-common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";

import { LoginComponent as BaseLoginComponent } from "jslib-angular/components/login.component";

import { Policy } from "jslib-common/models/domain/policy";

@Component({
    selector: "app-login",
    templateUrl: "login.component.html",
})
export class LoginComponent extends BaseLoginComponent {
    showResetPasswordAutoEnrollWarning = false;

    constructor(
        authService: AuthService,
        router: Router,
        i18nService: I18nService,
        private route: ActivatedRoute,
        stateService: StateService,
        platformUtilsService: PlatformUtilsService,
        environmentService: EnvironmentService,
        passwordGenerationService: PasswordGenerationService,
        cryptoFunctionService: CryptoFunctionService,
        private apiService: ApiService,
        private policyService: PolicyService,
        logService: LogService,
        ngZone: NgZone
    ) {
        super(
            authService,
            router,
            platformUtilsService,
            i18nService,
            stateService,
            environmentService,
            passwordGenerationService,
            cryptoFunctionService,
            logService,
            ngZone
        );
        this.onSuccessfulLoginNavigate = this.goAfterLogIn;
    }

    async ngOnInit() {
        this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
            if (qParams.email != null && qParams.email.indexOf("@") > -1) {
                this.email = qParams.email;
            }
            if (qParams.premium != null) {
                this.stateService.setLoginRedirect({ route: "/settings/premium" });
            } else if (qParams.org != null) {
                this.stateService.setLoginRedirect({
                    route: "/settings/create-organization",
                    qParams: { plan: qParams.org },
                });
            }

            // Are they coming from an email for sponsoring a families organization
            if (qParams.sponsorshipToken != null) {
                // After logging in redirect them to setup the families sponsorship
                this.stateService.setLoginRedirect({
                    route: "/setup/families-for-enterprise",
                    qParams: { token: qParams.sponsorshipToken },
                });
            }
            await super.ngOnInit();
        });

        const invite = await this.stateService.getOrganizationInvitation();
        if (invite != null) {
            let policyList: Policy[] = null;
            try {
                const policies = await this.apiService.getPoliciesByToken(
                    invite.organizationId,
                    invite.token,
                    invite.email,
                    invite.organizationUserId
                );
                policyList = this.policyService.mapPoliciesFromToken(policies);
            } catch (e) {
                this.logService.error(e);
            }

            if (policyList != null) {
                const result = this.policyService.getResetPasswordPolicyOptions(policyList, invite.organizationId);
                // Set to true if policy enabled and auto-enroll enabled
                this.showResetPasswordAutoEnrollWarning = result[1] && result[0].autoEnrollEnabled;
            }
        }
    }

    async goAfterLogIn() {
        const loginRedirect = await this.stateService.getLoginRedirect();
        if (loginRedirect != null) {
            this.router.navigate([loginRedirect.route], { queryParams: loginRedirect.qParams });
            await this.stateService.setLoginRedirect(null);
        } else {
            this.router.navigate([this.successRoute]);
        }
    }
}
