import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

import { UserBillingHistoryComponent } from "../../settings/user-billing-history.component";

@Component({
  selector: "app-org-billing",
  templateUrl: "../../settings/user-billing-history.component.html",
})
export class OrganizationBillingComponent extends UserBillingHistoryComponent implements OnInit {
  constructor(
    apiService: ApiService,
    i18nService: I18nService,
    private route: ActivatedRoute,
    platformUtilsService: PlatformUtilsService,
    logService: LogService
  ) {
    super(apiService, i18nService, platformUtilsService, logService);
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load();
      this.firstLoaded = true;
    });
  }
}
