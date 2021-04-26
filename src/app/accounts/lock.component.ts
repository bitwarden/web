import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { RouterService } from '../services/router.service';

import { LockComponent as BaseLockComponent } from 'jslib-angular/components/lock.component';

@Component({
    selector: 'app-lock',
    templateUrl: 'lock.component.html',
})
export class LockComponent extends BaseLockComponent {
    constructor(router: Router, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, messagingService: MessagingService,
        userService: UserService, cryptoService: CryptoService,
        storageService: StorageService, vaultTimeoutService: VaultTimeoutService,
        environmentService: EnvironmentService, private routerService: RouterService,
        stateService: StateService, apiService: ApiService) {
        super(router, i18nService, platformUtilsService, messagingService, userService, cryptoService,
            storageService, vaultTimeoutService, environmentService, stateService, apiService);
    }

    async ngOnInit() {
        await super.ngOnInit();
        this.onSuccessfulSubmit = () => {
            const previousUrl = this.routerService.getPreviousUrl();
            if (previousUrl !== '/' && previousUrl.indexOf('lock') === -1) {
                this.successRoute = previousUrl;
            }
            this.router.navigate([this.successRoute]);
        };
    }
}
