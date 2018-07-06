import {
    Component,
    OnInit,
} from '@angular/core';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

@Component({
    selector: 'app-navbar',
    templateUrl: 'navbar.component.html',
})
export class NavbarComponent implements OnInit {
    selfHosted = false;
    email: string;

    constructor(private messagingService: MessagingService, private platformUtilsService: PlatformUtilsService,
        private userService: UserService) {
        this.selfHosted = this.platformUtilsService.isSelfHost();
    }

    async ngOnInit() {
        this.email = await this.userService.getEmail();
    }

    lock() {
        this.messagingService.send('lockVault');
    }

    logOut() {
        this.messagingService.send('logout');
    }
}
