import {
    Component,
    OnInit,
} from '@angular/core';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';
import { StorageService } from 'jslib/abstractions/storage.service';

@Component({
    selector: 'app-tools',
    templateUrl: 'tools.component.html',
})
export class ToolsComponent implements OnInit {
    canAccessPremium = false;
    scaleUIWidth: boolean = false;

    constructor(private userService: UserService, private messagingService: MessagingService, private storageService: StorageService) { }

    async ngOnInit() {
        this.scaleUIWidth = await this.storageService.get<boolean>('enableUIScaling');
        this.canAccessPremium = await this.userService.canAccessPremium();
    }

    premiumRequired() {
        if (!this.canAccessPremium) {
            this.messagingService.send('premiumRequired');
            return;
        }
    }
}
