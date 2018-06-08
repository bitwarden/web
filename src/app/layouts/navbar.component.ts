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

    logOut() {
        this.messagingService.send('logout');
    }
}
