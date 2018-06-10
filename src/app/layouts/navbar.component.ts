import {
    Component,
} from '@angular/core';

import { MessagingService } from 'jslib/abstractions/messaging.service';

@Component({
    selector: 'app-navbar',
    templateUrl: 'navbar.component.html',
})
export class NavbarComponent {
    constructor(private messagingService: MessagingService) { }

    lock() {
        this.messagingService.send('lockVault');
    }

    logOut() {
        this.messagingService.send('logout');
    }
}
