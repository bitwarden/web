import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { TokenService } from 'jslib-common/abstractions/token.service';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';
import { UserService } from 'jslib-common/abstractions/user.service';

const BroadcasterSubscriptionId = 'SettingsComponent';

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
    premium: boolean;
    selfHosted: boolean;
    isInEnterprise: boolean;
    hasFamilySponsorshipAvailable: boolean;

    constructor(private tokenService: TokenService, private broadcasterService: BroadcasterService,
        private ngZone: NgZone, private platformUtilsService: PlatformUtilsService,
        private userService: UserService) { }

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

        this.selfHosted = await this.platformUtilsService.isSelfHost();
        await this.load();
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async load() {
        this.isInEnterprise = true;
        this.premium = await this.tokenService.getPremium();
        this.hasFamilySponsorshipAvailable = (await this.userService.getAllOrganizations())
            .some(o => o.familySponsorshipAvailable || o.familySponsorshipFriendlyName !== null);
    }
}
