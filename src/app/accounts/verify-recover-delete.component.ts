import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { VerifyDeleteRecoverRequest } from "jslib-common/models/request/verifyDeleteRecoverRequest";

@Component({
  selector: "app-verify-recover-delete",
  templateUrl: "verify-recover-delete.component.html",
})
export class VerifyRecoverDeleteComponent implements OnInit {
  email: string;
  formPromise: Promise<any>;

  private userId: string;
  private token: string;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private route: ActivatedRoute,
    private logService: LogService
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      if (qParams.userId != null && qParams.token != null && qParams.email != null) {
        this.userId = qParams.userId;
        this.token = qParams.token;
        this.email = qParams.email;
      } else {
        this.router.navigate(["/"]);
      }
    });
  }

  async submit() {
    try {
      const request = new VerifyDeleteRecoverRequest(this.userId, this.token);
      this.formPromise = this.apiService.postAccountRecoverDeleteToken(request);
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("accountDeleted"),
        this.i18nService.t("accountDeletedDesc")
      );
      this.router.navigate(["/"]);
    } catch (e) {
      this.logService.error(e);
    }
  }
}
