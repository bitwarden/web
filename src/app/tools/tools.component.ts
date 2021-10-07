import {
    Component,
    OnInit,
} from '@angular/core';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';

@Component({
    selector: 'app-tools',
    templateUrl: 'tools.component.html',
})
export class ToolsComponent implements OnInit {
    canAccessPremium = false;

    constructor(private activeAccount: ActiveAccountService, private messagingService: MessagingService) { }

    async ngOnInit() {
        this.canAccessPremium = this.activeAccount.canAccessPremium;
    }

    premiumRequired() {
        if (!this.canAccessPremium) {
            this.messagingService.send('premiumRequired');
            return;
        }
    }
}
