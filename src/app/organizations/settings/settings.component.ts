import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

@Component({
  selector: "app-org-settings",
  templateUrl: "settings.component.html",
})
export class SettingsComponent {
  access2fa = false;
  selfHosted: boolean;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private platformUtilsService: PlatformUtilsService
  ) {}

  ngOnInit() {
    this.route.parent.params.subscribe(async (params) => {
      this.selfHosted = await this.platformUtilsService.isSelfHost();
      const organization = await this.organizationService.get(params.organizationId);
      this.access2fa = organization.use2fa;
    });
  }
}
