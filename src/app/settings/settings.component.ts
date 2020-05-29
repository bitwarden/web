import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';
import { StorageService } from 'jslib/abstractions/storage.service';

const BroadcasterSubscriptionId = 'SettingsComponent';

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
    premium: boolean;
    selfHosted: boolean;
    scaleUIWidth: boolean = false;

    constructor(private tokenService: TokenService, private broadcasterService: BroadcasterService,
        private ngZone: NgZone, private platformUtilsService: PlatformUtilsService, private storageService: StorageService) { }

    async ngOnInit() {
        this.scaleUIWidth = await this.storageService.get<boolean>('enableUIScaling');
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
        this.premium = await this.tokenService.getPremium();
    }
}
