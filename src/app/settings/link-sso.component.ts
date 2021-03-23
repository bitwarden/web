import {
    AfterContentInit,
    Component,
    Input,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { SsoComponent } from 'jslib/angular/components/sso.component';

import { Organization } from 'jslib/models/domain/organization';

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
        storageService: StorageService, stateService: StateService) {
        super(authService, router,
            i18nService, route,
            storageService, stateService,
            platformUtilsService, apiService,
            cryptoFunctionService, passwordGenerationService);

        this.returnUri = '/settings/organizations';
        this.redirectUri = window.location.origin + '/sso-connector.html';
        this.clientId = 'web';
    }

    async ngAfterContentInit() {
        this.identifier = this.organization.identifier;
    }
}
