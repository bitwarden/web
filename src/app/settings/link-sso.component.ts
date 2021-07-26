import {
    AfterContentInit,
    Component,
    Input,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

import { SsoComponent } from 'jslib-angular/components/sso.component';

import { Organization } from 'jslib-common/models/domain/organization';

@Component({
    selector: 'app-link-sso',
    templateUrl: 'link-sso.component.html',
})
export class LinkSsoComponent extends SsoComponent implements AfterContentInit {
    @Input() organization: Organization;
    returnUri: string = '/settings/organizations';

    constructor(platformUtilsService: PlatformUtilsService, i18nService: I18nService,
        apiService: ApiService, authService: AuthService,
        router: Router, route: ActivatedRoute,
        cryptoFunctionService: CryptoFunctionService, passwordGenerationService: PasswordGenerationService,
        storageService: StorageService, stateService: StateService, environmentService: EnvironmentService) {
        super(authService, router,
            i18nService, route,
            storageService, stateService,
            platformUtilsService, apiService,
            cryptoFunctionService, environmentService, passwordGenerationService);

        this.returnUri = '/settings/organizations';
        this.redirectUri = window.location.origin + '/sso-connector.html';
        this.clientId = 'web';
    }

    async ngAfterContentInit() {
        this.identifier = this.organization.identifier;
    }
}
