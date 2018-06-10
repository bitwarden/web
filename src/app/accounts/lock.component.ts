import {
    Component,
    OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

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
export class LockComponent extends BaseLockComponent implements OnInit {
    constructor(router: Router, analytics: Angulartics2,
        toasterService: ToasterService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, messagingService: MessagingService,
        userService: UserService, cryptoService: CryptoService,
        private routerService: RouterService) {
        super(router, analytics, toasterService, i18nService, platformUtilsService,
            messagingService, userService, cryptoService);
    }

    async ngOnInit() {
        const authed = await this.userService.isAuthenticated();
        const key = await this.cryptoService.getKey();
        if (!authed) {
            this.router.navigate(['/']);
        } else if (key != null) {
            this.router.navigate(['vault']);
        }

        const previousUrl = this.routerService.getPreviousUrl();
        if (previousUrl !== '/' && previousUrl.indexOf('lock') === -1) {
            this.successRoute = previousUrl;
        }
    }
}
