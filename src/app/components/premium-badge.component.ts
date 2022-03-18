import { Component } from "@angular/core";

import { MessagingService } from "jslib-common/abstractions/messaging.service";

@Component({
  selector: "app-premium-badge",
  template: `
    <a href="#" appStopClick *appNotPremium (click)="premiumRequired()">
      <bit-badge type="success">{{ "premium" | i18n }}</bit-badge>
    </a>
  `,
})
export class PremiumBadgeComponent {
  constructor(private messagingService: MessagingService) {}

  premiumRequired() {
    this.messagingService.send("premiumRequired");
  }
}
