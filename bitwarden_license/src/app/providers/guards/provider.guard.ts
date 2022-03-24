import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { ProviderService } from "jslib-common/abstractions/provider.service";

@Injectable()
export class ProviderGuard implements CanActivate {
  constructor(
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private providerService: ProviderService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const provider = await this.providerService.get(route.params.providerId);
    if (provider == null) {
      this.router.navigate(["/"]);
      return false;
    }
    if (!provider.isProviderAdmin && !provider.enabled) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("providerIsDisabled"));
      this.router.navigate(["/"]);
      return false;
    }

    return true;
  }
}
