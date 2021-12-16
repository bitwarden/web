import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";

import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { TokenService } from "jslib-common/abstractions/token.service";

const BroadcasterSubscriptionId = "SettingsComponent";

@Component({
    selector: "app-settings",
    templateUrl: "settings.component.html",
})
export class SettingsComponent implements OnInit, OnDestroy {
    premium: boolean;
    selfHosted: boolean;
    hasFamilySponsorshipAvailable: boolean;

    constructor(
        private tokenService: TokenService,
        private broadcasterService: BroadcasterService,
        private ngZone: NgZone,
        private platformUtilsService: PlatformUtilsService,
        private organizationService: OrganizationService
    ) {}

    async ngOnInit() {
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case "purchasedPremium":
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
        this.hasFamilySponsorshipAvailable = await this.organizationService.canManageSponsorships();
    }
}
