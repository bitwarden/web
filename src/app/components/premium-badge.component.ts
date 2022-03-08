import { Component } from "@angular/core";

import { MessagingService } from "jslib-common/abstractions/messaging.service";

@Component({
  selector: "app-premium-badge",
  template:
    '<a href="#" appStopClick *appUnlessPremium class="badge badge-success" (click)="premiumRequired()">{{ "premium" | i18n }}</a>',
})
export class PremiumBadgeComponent {
  constructor(private messagingService: MessagingService) {}

  premiumRequired() {
    this.messagingService.send("premiumRequired");
  }
}
