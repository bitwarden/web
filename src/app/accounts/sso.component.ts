import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

import { SsoComponent as BaseSsoComponent } from 'jslib-angular/components/sso.component';

const IdentifierStorageKey = 'ssoOrgIdentifier';

@Component({
    selector: 'app-sso',
    templateUrl: 'sso.component.html',
})
export class SsoComponent extends BaseSsoComponent {
    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, route: ActivatedRoute,
        storageService: StorageService, stateService: StateService,
        platformUtilsService: PlatformUtilsService, apiService: ApiService,
        cryptoFunctionService: CryptoFunctionService, environmentService: EnvironmentService,
        passwordGenerationService: PasswordGenerationService, logService: LogService) {
        super(authService, router, i18nService, route, storageService, stateService, platformUtilsService,
            apiService, cryptoFunctionService, environmentService, passwordGenerationService, logService);
        this.redirectUri = window.location.origin + '/sso-connector.html';
        this.clientId = 'web';
    }

    async ngOnInit() {
        super.ngOnInit();
        const queryParamsSub = this.route.queryParams.subscribe(async qParams => {
            if (qParams.identifier != null) {
                this.identifier = qParams.identifier;
            } else {
                const storedIdentifier = await this.storageService.get<string>(IdentifierStorageKey);
                if (storedIdentifier != null) {
                    this.identifier = storedIdentifier;
                }
            }
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
    }

    async submit() {
        await this.storageService.save(IdentifierStorageKey, this.identifier);
        if (this.clientId === 'browser') {
            document.cookie = `ssoHandOffMessage=${this.i18nService.t('ssoHandOff')};SameSite=strict`;
        }
        super.submit();
    }
}
