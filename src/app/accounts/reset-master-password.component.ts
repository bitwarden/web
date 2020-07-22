import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { ResetMasterPasswordComponent as BaseResetMasterPasswordComponent } from 'jslib/angular/components/reset-master-password.component';

import { AuthResult } from 'jslib/models/domain';

@Component({
    selector: 'app-reset-master-password',
    templateUrl: 'reset-master-password.component.html',
})
export class ResetMasterPasswordComponent extends BaseResetMasterPasswordComponent {
    showTerms = true;
    onSuccessfulLogin: () => Promise<any>;
    onSuccessfulLoginNavigate: () => Promise<any>;
    onSuccessfulLoginTwoFactorNavigate: () => Promise<any>;
    response: AuthResult;

    protected twoFactorRoute = '2fa';
    protected successRoute = 'lock';

    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, cryptoService: CryptoService,
        apiService: ApiService, private route: ActivatedRoute,
        stateService: StateService, platformUtilsService: PlatformUtilsService,
        passwordGenerationService: PasswordGenerationService, private storageService: StorageService) {
        super(authService, router, i18nService, cryptoService, apiService, stateService, platformUtilsService,
            passwordGenerationService);
        this.showTerms = !platformUtilsService.isSelfHost();
    }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe((qParams) => {
            // User info needed? Email? etc
            if (qParams.isCompleteRegistraion != null) {
                this.isCompleteRegistration = qParams.isCompleteRegistraion;
            }

            if (qParams.response != null) {
                this.response = qParams.response;
            }

            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
    }

    async submit() {
        if (await super.submit()) {
            if (this.response.twoFactor) {
                this.platformUtilsService.eventTrack('SSO Logged In To Two-step');
                if (this.onSuccessfulLoginTwoFactorNavigate != null) {
                    this.onSuccessfulLoginTwoFactorNavigate();
                } else {
                    this.router.navigate([this.twoFactorRoute]);
                }
            } else {
                const disableFavicon = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
                await this.stateService.save(ConstantsService.disableFaviconKey, !!disableFavicon);
                if (this.onSuccessfulLogin != null) {
                    this.onSuccessfulLogin();
                }
                this.platformUtilsService.eventTrack('SSO Logged In');
                if (this.onSuccessfulLoginNavigate != null) {
                    this.onSuccessfulLoginNavigate();
                } else {
                    this.router.navigate([this.successRoute]);
                }
            }
            return true;
        }
    }
}
