import { Component, Input, OnInit } from "@angular/core";

import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { StateService } from "jslib-common/abstractions/state.service";

@Component({
  selector: "app-premium-badge",
  template: `
    <button
      bit-badge
      badgeType="success"
      *ngIf="condition"
      appStopClick
      (click)="premiumRequired()"
      [attr.tabIndex]="tabindex"
    >
      {{ "premium" | i18n }}
    </button>
  `,
})
export class PremiumBadgeComponent implements OnInit {
  // Optional condition defaults to premium
  @Input() condition: boolean;
  @Input() tabindex?: number = null;

  constructor(private stateService: StateService, private messagingService: MessagingService) {}

  async ngOnInit() {
    this.condition ??= !(await this.stateService.getCanAccessPremium());
  }

  premiumRequired() {
    this.messagingService.send("premiumRequired");
  }
}
