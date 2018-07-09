import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { TokenService } from 'jslib/abstractions/token.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

const BroadcasterSubscriptionId = 'SettingsComponent';

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
    premium: boolean;

    constructor(private tokenService: TokenService, private broadcasterService: BroadcasterService,
        private ngZone: NgZone) { }

    async ngOnInit() {
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'purchasedPremium':
                        await this.load();
                        break;
                    default:
                }
            });
        });

        await this.load();
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async load() {
        this.premium = await this.tokenService.getPremium();
    }
}
