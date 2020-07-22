import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { Utils } from 'jslib/misc/utils';

import { AuthResult } from 'jslib/models/domain/authResult';

@Component({
    selector: 'app-sso',
    templateUrl: 'sso.component.html',
})
export class SsoComponent {
    identifier: string;
    loggingIn = false;

    formPromise: Promise<AuthResult>;
    onSuccessfulLogin: () => Promise<any>;
    onSuccessfulLoginNavigate: () => Promise<any>;
    onSuccessfulLoginTwoFactorNavigate: () => Promise<any>;

    protected twoFactorRoute = '2fa';
    protected successRoute = 'lock';
    protected resetMasterPasswordRoute = 'reset-master-password';

    private redirectUri = window.location.origin + '/sso-connector.html';

    constructor(private authService: AuthService, private router: Router,
        private i18nService: I18nService, private route: ActivatedRoute,
        private storageService: StorageService, private stateService: StateService,
        private platformUtilsService: PlatformUtilsService, private apiService: ApiService,
        private cryptoFunctionService: CryptoFunctionService,
        private passwordGenerationService: PasswordGenerationService) { }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe(async (qParams) => {
            if (qParams.code != null && qParams.state != null) {
                const codeVerifier = await this.storageService.get<string>(ConstantsService.ssoCodeVerifierKey);
                const state = await this.storageService.get<string>(ConstantsService.ssoStateKey);
                await this.storageService.remove(ConstantsService.ssoCodeVerifierKey);
                await this.storageService.remove(ConstantsService.ssoStateKey);
                if (qParams.code != null && codeVerifier != null && state != null && state === qParams.state) {
                    await this.logIn(qParams.code, codeVerifier);
                }
            }
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
    }

    async submit() {
        const passwordOptions: any = {
            type: 'password',
            length: 64,
            uppercase: true,
            lowercase: true,
            numbers: true,
            special: false,
        };
        const state = await this.passwordGenerationService.generatePassword(passwordOptions);
        const codeVerifier = await this.passwordGenerationService.generatePassword(passwordOptions);
        const codeVerifierHash = await this.cryptoFunctionService.hash(codeVerifier, 'sha256');
        const codeChallenge = Utils.fromBufferToUrlB64(codeVerifierHash);

        await this.storageService.save(ConstantsService.ssoCodeVerifierKey, codeVerifier);
        await this.storageService.save(ConstantsService.ssoStateKey, state);

        const authorizeUrl = this.apiService.identityBaseUrl + '/connect/authorize?' +
            'client_id=web&redirect_uri=' + this.redirectUri + '&' +
            'response_type=code&scope=api offline_access&' +
            'state=' + state + '&code_challenge=' + codeChallenge + '&' +
            'code_challenge_method=S256&response_mode=query&' +
            'domain_hint=' + this.identifier;
        this.platformUtilsService.launchUri(authorizeUrl, { sameWindow: true });
    }

    private async logIn(code: string, codeVerifier: string) {
        this.loggingIn = true;
        try {
            this.formPromise = this.authService.logInSso(code, codeVerifier, this.redirectUri);
            const response = await this.formPromise;
            if (response.resetMasterPassword) {
                // TODO Need a callback?
                // TODO Need user info (user id, email, etc?)
                this.platformUtilsService.eventTrack('SSO - routing to complete registration');
                this.router.navigate([this.resetMasterPasswordRoute],
                    {
                        queryParams:
                        {
                            isCompleteRegistration: true,
                            response: response,
                        }
                    });
            } else if (response.twoFactor) {
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
        } catch { }
        this.loggingIn = false;
    }
}
