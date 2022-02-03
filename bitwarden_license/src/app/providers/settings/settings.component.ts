import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ProviderService } from "jslib-common/abstractions/provider.service";

@Component({
  selector: "provider-settings",
  templateUrl: "settings.component.html",
})
export class SettingsComponent {
  constructor(private route: ActivatedRoute, private providerService: ProviderService) {}

  ngOnInit() {
    this.route.parent.params.subscribe(async (params) => {
      await this.providerService.get(params.providerId);
    });
  }
}
