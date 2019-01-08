import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { RouterService } from '../services/router.service';

import { LockComponent as BaseLockComponent } from 'jslib/angular/components/lock.component';

@Component({
    selector: 'app-lock',
    templateUrl: 'lock.component.html',
})
export class LockComponent extends BaseLockComponent {
    constructor(router: Router, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, messagingService: MessagingService,
        userService: UserService, cryptoService: CryptoService,
        private routerService: RouterService) {
        super(router, i18nService, platformUtilsService, messagingService, userService, cryptoService);
    }

    async ngOnInit() {
        await super.ngOnInit();
        const authed = await this.userService.isAuthenticated();
        if (!authed) {
            this.router.navigate(['/']);
        } else if (await this.cryptoService.hasKey()) {
            this.router.navigate(['vault']);
        }

        const previousUrl = this.routerService.getPreviousUrl();
        if (previousUrl !== '/' && previousUrl.indexOf('lock') === -1) {
            this.successRoute = previousUrl;
        }
    }
}
