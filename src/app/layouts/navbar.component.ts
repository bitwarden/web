import {
    Component,
} from '@angular/core';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

@Component({
    selector: 'app-navbar',
    templateUrl: 'navbar.component.html',
})
export class NavbarComponent {
    selfHosted = false;

    constructor(private messagingService: MessagingService, private platformUtilsService: PlatformUtilsService) {
        this.selfHosted = this.platformUtilsService.isSelfHost();
    }

    lock() {
        this.messagingService.send('lockVault');
    }

    logOut() {
        this.messagingService.send('logout');
    }
}
