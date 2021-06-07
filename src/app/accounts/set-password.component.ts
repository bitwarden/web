import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import {
    SetPasswordComponent as BaseSetPasswordComponent,
} from 'jslib-angular/components/set-password.component';

@Component({
    selector: 'app-set-password',
    templateUrl: 'set-password.component.html',
})
export class SetPasswordComponent extends BaseSetPasswordComponent {
    constructor(apiService: ApiService, i18nService: I18nService,
        cryptoService: CryptoService, messagingService: MessagingService,
        userService: UserService, passwordGenerationService: PasswordGenerationService,
        platformUtilsService: PlatformUtilsService, policyService: PolicyService, router: Router,
        syncService: SyncService, route: ActivatedRoute) {
        super(i18nService, cryptoService, messagingService, userService, passwordGenerationService,
            platformUtilsService, policyService, router, apiService, syncService, route);
    }
}
