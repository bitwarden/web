import { Component, Input, OnInit } from "@angular/core";

import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { StateService } from "jslib-common/abstractions/state.service";

@Component({
  selector: "app-premium-badge",
  template: `
    <a *ngIf="condition" href="#" appStopClick (click)="premiumRequired()">
      <bit-badge type="success">{{ "premium" | i18n }}</bit-badge>
    </a>
  `,
})
export class PremiumBadgeComponent implements OnInit {
  // Optional condition defaults to premium
  @Input() condition: boolean;

  constructor(private stateService: StateService, private messagingService: MessagingService) {}

  async ngOnInit() {
    this.condition ??= await this.stateService.getCanAccessPremium();
  }

  premiumRequired() {
    this.messagingService.send("premiumRequired");
  }
}
