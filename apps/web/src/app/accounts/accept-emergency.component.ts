import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { EmergencyAccessAcceptRequest } from "jslib-common/models/request/emergencyAccessAcceptRequest";

import { BaseAcceptComponent } from "../common/base.accept.component";

@Component({
  selector: "app-accept-emergency",
  templateUrl: "accept-emergency.component.html",
})
export class AcceptEmergencyComponent extends BaseAcceptComponent {
  name: string;

  protected requiredParameters: string[] = ["id", "name", "email", "token"];
  protected failedShortMessage = "emergencyInviteAcceptFailedShort";
  protected failedMessage = "emergencyInviteAcceptFailed";

  constructor(
    router: Router,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    route: ActivatedRoute,
    private apiService: ApiService,
    stateService: StateService
  ) {
    super(router, platformUtilsService, i18nService, route, stateService);
  }

  async authedHandler(qParams: any): Promise<void> {
    const request = new EmergencyAccessAcceptRequest();
    request.token = qParams.token;
    this.actionPromise = this.apiService.postEmergencyAccessAccept(qParams.id, request);
    await this.actionPromise;
    this.platformUtilService.showToast(
      "success",
      this.i18nService.t("inviteAccepted"),
      this.i18nService.t("emergencyInviteAcceptedDesc"),
      { timeout: 10000 }
    );
    this.router.navigate(["/vault"]);
  }

  async unauthedHandler(qParams: any): Promise<void> {
    this.name = qParams.name;
    if (this.name != null) {
      // Fix URL encoding of space issue with Angular
      this.name = this.name.replace(/\+/g, " ");
    }
  }
}
