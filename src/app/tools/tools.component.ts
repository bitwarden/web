import { Component, OnInit } from "@angular/core";

import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { StateService } from "jslib-common/abstractions/state.service";

@Component({
  selector: "app-tools",
  templateUrl: "tools.component.html",
})
export class ToolsComponent implements OnInit {
  canAccessPremium = false;

  constructor(private stateService: StateService, private messagingService: MessagingService) {}

  async ngOnInit() {
    this.canAccessPremium = await this.stateService.getCanAccessPremium();
  }

  premiumRequired() {
    if (!this.canAccessPremium) {
      this.messagingService.send("premiumRequired");
      return;
    }
  }
}
