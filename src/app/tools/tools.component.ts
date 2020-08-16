import { Component, OnInit } from '@angular/core';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

@Component({
    selector: 'app-tools',
    templateUrl: 'tools.component.html',
})
export class ToolsComponent implements OnInit {
    canAccessPremium = false;

    constructor(private userService: UserService, private messagingService: MessagingService) {}

    async ngOnInit() {
        this.canAccessPremium = await this.userService.canAccessPremium();
    }

    premiumRequired() {
        if (!this.canAccessPremium) {
            this.messagingService.send('premiumRequired');
            return;
        }
    }
}
