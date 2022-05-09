import { Component } from "@angular/core";

import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { TokenService } from "jslib-common/abstractions/token.service";

@Component({
  selector: "app-subscription",
  templateUrl: "subscription.component.html",
})
export class SubscriptionComponent {
  hasPremium: boolean;
  selfHosted: boolean;

  constructor(
    private tokenService: TokenService,
    private platformUtilsService: PlatformUtilsService
  ) {}

  async ngOnInit() {
    this.hasPremium = await this.tokenService.getPremium();
    this.selfHosted = this.platformUtilsService.isSelfHost();
  }

  get subscriptionRoute(): string {
    return this.hasPremium ? "user-subscription" : "premium";
  }
}
