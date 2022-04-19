import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

import { UserBillingComponent } from "../../settings/user-billing.component";

@Component({
  selector: "app-org-billing",
  templateUrl: "../../settings/user-billing.component.html",
})
export class OrganizationBillingComponent extends UserBillingComponent implements OnInit {
  constructor(
    apiService: ApiService,
    i18nService: I18nService,
    private route: ActivatedRoute,
    platformUtilsService: PlatformUtilsService,
    logService: LogService,
    private organizationService: OrganizationService
  ) {
    super(apiService, i18nService, platformUtilsService, logService);
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;

      const organization = await this.organizationService.get(this.organizationId);
      if (organization.hasProvider && !organization.isProviderUser) {
        this.providerName = organization.providerName;
        this.loading = false;
      } else {
        await this.load();
      }
      this.firstLoaded = true;
    });
  }
}
