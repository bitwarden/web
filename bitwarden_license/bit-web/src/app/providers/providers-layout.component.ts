import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ProviderService } from "jslib-common/abstractions/provider.service";
import { Provider } from "jslib-common/models/domain/provider";

@Component({
  selector: "providers-layout",
  templateUrl: "providers-layout.component.html",
})
export class ProvidersLayoutComponent {
  provider: Provider;
  private providerId: string;

  constructor(private route: ActivatedRoute, private providerService: ProviderService) {}

  ngOnInit() {
    document.body.classList.remove("layout_frontend");
    this.route.params.subscribe(async (params) => {
      this.providerId = params.providerId;
      await this.load();
    });
  }

  async load() {
    this.provider = await this.providerService.get(this.providerId);
  }

  get showMenuBar() {
    return this.showManageTab || this.showSettingsTab;
  }

  get showManageTab() {
    return this.provider.canManageUsers || this.provider.canAccessEventLogs;
  }

  get showSettingsTab() {
    return this.provider.isProviderAdmin;
  }

  get manageRoute(): string {
    switch (true) {
      case this.provider.canManageUsers:
        return "manage/people";
      case this.provider.canAccessEventLogs:
        return "manage/events";
    }
  }
}
