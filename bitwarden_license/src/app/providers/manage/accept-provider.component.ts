import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { ProviderUserAcceptRequest } from "jslib-common/models/request/provider/providerUserAcceptRequest";

import { BaseAcceptComponent } from "src/app/common/base.accept.component";

@Component({
  selector: "app-accept-provider",
  templateUrl: "accept-provider.component.html",
})
export class AcceptProviderComponent extends BaseAcceptComponent {
  providerName: string;

  failedMessage = "providerInviteAcceptFailed";

  requiredParameters = ["providerId", "providerUserId", "token"];

  constructor(
    router: Router,
    i18nService: I18nService,
    route: ActivatedRoute,
    stateService: StateService,
    private apiService: ApiService,
    platformUtilService: PlatformUtilsService
  ) {
    super(router, platformUtilService, i18nService, route, stateService);
  }

  async authedHandler(qParams: any) {
    const request = new ProviderUserAcceptRequest();
    request.token = qParams.token;

    await this.apiService.postProviderUserAccept(
      qParams.providerId,
      qParams.providerUserId,
      request
    );
    this.platformUtilService.showToast(
      "success",
      this.i18nService.t("inviteAccepted"),
      this.i18nService.t("providerInviteAcceptedDesc"),
      { timeout: 10000 }
    );
    this.router.navigate(["/vault"]);
  }

  async unauthedHandler(qParams: any) {
    this.providerName = qParams.providerName;
  }
}
